import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Tasklog.css";

const ManagerTasklog = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem("accessToken");
  console.log("token", token);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [rating, setRating] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [activeTab, setActiveTab] = useState("task");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const isMobile = window.innerWidth <= 768;
  const [selectedDate, setSelectedDate] = useState("");
  const [workloadData, setWorkloadData] = useState([]);
  const [date, setDate] = useState("");
  const [workloadDate, setWorkloadDate] = useState("");
  const [workloadWeek, setWorkloadWeek] = useState("");
  const [workloadMonth, setWorkloadMonth] = useState("");
  const [workloadRangeLabel, setWorkloadRangeLabel] = useState("");

  const getTaskDayNumber = (startDate, endDate) => {
    if (!startDate || !endDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    // Today outside task period
    if (today < start || today > end) return null;

    let count = 0;
    let current = new Date(start);

    while (current <= today) {
      const day = current.getDay(); // 0 = Sunday, 6 = Saturday
      const date = current.getDate();

      // Exclude Sundays
      if (day === 0) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      // Exclude first and third Saturdays
      if (day === 6 && (date <= 7 || (date >= 15 && date <= 21))) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      count++;
      current.setDate(current.getDate() + 1);
    }

    return count;
  };
  const formatDateWithoutYear = (dateString) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
    }).format(new Date(dateString));

  const isToday = (dateString) => {
    if (!dateString) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);

    return today.getTime() === date.getTime();
  };
  function getWorkingDays(startIso, endIso) {
    const start = new Date(startIso);
    const end = new Date(endIso);
    let count = 0;

    // Helper to check if a date is 1st or 3rd Saturday
    function isFirstOrThirdSaturday(date) {
      if (date.getDay() !== 6) return false; // Not Saturday
      const day = date.getDate();
      const weekNumber = Math.ceil(day / 7);
      return weekNumber === 1 || weekNumber === 3;
    }

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0) continue; // Skip Sunday
      if (isFirstOrThirdSaturday(d)) continue; // Skip 1st & 3rd Saturday
      count++;
    }

    return count;
  }

  const renderStars = (rating, approved) => {
    if (!rating) return "-";

    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    const starColor = approved ? "#22c55e" : "#9ca3af"; // green / gray
    const renderHalfStar = () => <span className="star half">★</span>;

    return (
      <span style={{ color: starColor, fontSize: 16 }}>
        {"★".repeat(fullStars)}
        {hasHalf && renderHalfStar()}
      </span>
    );
  };
  const isFirstOrThirdSaturday = (date) => {
    if (date.getDay() !== 6) return false;
    const week = Math.ceil(date.getDate() / 7);
    return week === 1 || week === 3;
  };

  const isWorkingDay = (date) => {
    if (date.getDay() === 0) return false;
    if (isFirstOrThirdSaturday(date)) return false;
    return true;
  };

  const findPreviousWorkingDayWithLogs = async () => {
    const token = localStorage.getItem("accessToken");
    let d = new Date();
    d.setDate(d.getDate() - 1); // start from yesterday

    for (let i = 0; i < 15; i++) {
      // search back max 15 days
      if (isWorkingDay(d)) {
        const dateStr = d.toISOString().split("T")[0];

        const res = await axios.get(
          `https://server-backend-nu.vercel.app/api/tasklogs/daily-workload?date=${dateStr}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.data && res.data.data.length > 0) {
          return dateStr;
        }
      }
      d.setDate(d.getDate() - 1);
    }

    return ""; // fallback if nothing found
  };

  const getUtilizationColor = (utilization) => {
    const baseStyle = {
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "0.4px",
      marginLeft: "6px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
      display: "inline-block",
      lineHeight: "1",
    };
    switch (utilization) {
      case "Balanced":
        return {
          ...baseStyle,
          backgroundColor: "#d1f2dd",
          color: "#0f5132",
        };
      case "Underloaded":
        return {
          ...baseStyle,
          backgroundColor: "#d1e7ff",
          color: "#0d6efd",
        };
      case "Overloaded":
        return {
          ...baseStyle,
          backgroundColor: "#fee2e2",
          color: '"#991b1b"',
        };
      default:
        return baseStyle;
    }
  };
  useEffect(() => {
    const init = async () => {
      const date = await findPreviousWorkingDayWithLogs();
      setSelectedDate(date);
    };
    init();
  }, []);
  const fetchWorkload = async () => {
    if (!selectedDate) return;

    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        `https://server-backend-nu.vercel.app/api/tasklogs/daily-workload?date=${selectedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDate(res.data.date);
      setWorkloadData(res.data.data);
      console.log("res.data.data", res.data.data);
    } catch (err) {
      console.error("Failed to fetch workload", err);
    }
  };

  useEffect(() => {
    fetchWorkload();
  }, [selectedDate]);
  console.log("selected date", selectedDate);
  console.log("workload", workloadData);
  const taskLogs = logs;
  const workLogs = [];

  const formatDate = (dateString) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  const formatDisplayHours = (h) => {
    if (h === null || h === undefined) return "";
    const num = Number(h);
    if (Number.isNaN(num)) return "";
    return Number.isInteger(num) ? num : num.toFixed(2);
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted":
        return {
          backgroundColor: "#d1f2dd",
          padding: "8px 16px",
          borderRadius: "4px",
          fontSize: "13px",
          fontWeight: "500",
          display: "inline-block",
          width: "120px",
          textAlign: "center",
          color: "#0f5132",
        };
      case "InProgress":
        return {
          backgroundColor: "#d1e7ff",
          padding: "7px 16px",
          borderRadius: "4px",
          fontSize: "13px",
          fontWeight: "500",
          display: "inline-block",
          width: "120px",
          textAlign: "center",
          color: "#0d6efd",
        };
      case "Pending":
        return {
          backgroundColor: "#FFE493",
          padding: "8px 16px",
          borderRadius: "4px",
          fontSize: "13px",
          fontWeight: "500",
          display: "inline-block",
          width: "120px",
          textAlign: "center",
          color: "#664d03",
        };
      case "Approved":
        return {
          backgroundColor: "#f1dabfff",
          padding: "8px 16px",
          borderRadius: "4px",
          fontSize: "13px",
          fontWeight: "500",
          display: "inline-block",
          width: "120px",
          textAlign: "center",
          color: "#e9700eff",
        };
      case "Rejected":
        return {
          backgroundColor: "#f8d7da",
          padding: "8px 16px",
          borderRadius: "4px",
          fontSize: "13px",
          fontWeight: "500",
          display: "inline-block",
          width: "120px",
          textAlign: "center",
          color: "#842029",
        };
      default:
        return {
          backgroundColor: "#bfcfeeff",
          padding: "8px 16px",
          borderRadius: "4px",
          fontSize: "13px",
          fontWeight: "500",
          display: "inline-block",
          width: "120px",
          textAlign: "center",
          color: "#495057",
        };
    }
  };
  useEffect(() => {
    fetchLogs();
  }, []);
  console.log(user._id);
  const fetchLogs = async () => {
    try {
      const logRes = await fetch(`https://server-backend-nu.vercel.app/api/tasklogs/`);
      const logsData = await logRes.json();
      const managerLogs = logsData.filter(
        (log) => String(log.task?.createdBy) === String(user._id)
      );

      setLogs(managerLogs);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
    }
  };

  const handleFilter = () => {
    let data = [...logs];

    if (searchText) {
      const text = searchText.toLowerCase();

      data = data.filter(
        (l) =>
          l.employee?.name?.toLowerCase().includes(text) ||
          l.task?.taskName?.toLowerCase().includes(text) ||
          l.status?.toLowerCase().includes(text) ||
          l.workDescription?.toLowerCase().includes(text)
      );
    }
    if (filterDate) {
      data = data.filter((l) => {
        const date = new Date(l.date);
        const logDate = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        return logDate === filterDate;
      });
    }

    setFilteredLogs(data);
  };
  useEffect(() => {
    handleFilter();
  }, [logs, searchText, filterDate]);
  console.log("data", filteredLogs);

  const handleReset = () => {
    setSearchText("");
    setFilterDate("");
    setFilterEmployee("");
    setFilteredLogs([]);
  };

  const handleApproveSubmit = async () => {
    try {
      const logId = logs[selectedRow.index]._id;
      const token = localStorage.getItem("accessToken");

      const res = await axios.put(
        `https://server-backend-nu.vercel.app/api/tasklogs/approve/${logId}`,
        {
          status: "Approved",
          rating: Number(rating),
          remarks: remarks,
          // approvedBy:user._id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchLogs();
      setApproveOpen(false);
      setRating("");
      setRemarks("");
    } catch (err) {
      console.error(err);
      alert("Failed to approve log");
    }
  };

  const rejectTaskLog = async (log, index) => {
    try {
      const logId = logs[index]._id; // or log._id directly
      console.log(logId);
      const token = localStorage.getItem("accessToken");

      await axios.put(
        `https://server-backend-nu.vercel.app/api/tasklogs/approve/${logId}`,
        { status: "Rejected", rating: "", remarks: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchLogs();
      setApproveOpen(false);
      setRating("");
      setRemarks("");
      setSelectedRow({ ...log, index }); // now safe
    } catch (err) {
      console.error(err);
      alert("Failed to reject log");
    }
  };

  const gettingWorkload = async () => {
    try {
      let url = "";

      if (workloadDate) {
        url = `https://server-backend-nu.vercel.app/api/tasklogs/daily-workload?date=${workloadDate}`;
      } else if (workloadWeek) {
        const weekStartDate = getStartDateOfWeek(workloadWeek);
        url = `https://server-backend-nu.vercel.app/api/tasklogs/workload/weekly?date=${weekStartDate}`;
      } else if (workloadMonth) {
        // Monthly API
        const [year, month] = workloadMonth.split("-");
        url = `https://server-backend-nu.vercel.app/api/tasklogs/workload/monthly?year=${year}&month=${month}`;
      } else {
        console.warn("No filter selected");
        return;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch workload data");
      const json = await response.json();
      setDate(json.date);
      setWorkloadData(json.data || []);

      if (json.week) {
        const [start, end] = json.week.split(" - ");
        setWorkloadRangeLabel(`${formatDate(start)} – ${formatDate(end)}`);
      } else if (workloadDate) {
        setWorkloadRangeLabel(formatDate(workloadDate));
      } else if (workloadMonth) {
        const d = new Date(`${workloadMonth}-01`);
        setWorkloadRangeLabel(
          d.toLocaleDateString("en-GB", { month: "short", year: "numeric" })
        );
      }
    } catch (error) {
      console.error("Error fetching workload:", error);
    }
  };
  console.log("workloadData", workloadData);

  function getStartDateOfWeek(weekStr) {
    const [year, week] = weekStr.split("-W").map(Number);
    const jan4 = new Date(year, 0, 4);
    const day = jan4.getDay() || 7; // Sunday = 7
    const mondayWeek1 = new Date(jan4);
    mondayWeek1.setDate(jan4.getDate() - day + 1);
    const targetMonday = new Date(mondayWeek1);
    targetMonday.setDate(mondayWeek1.getDate() + (week - 1) * 7);
    console.log("monday", targetMonday);
    const y = targetMonday.getFullYear();
    const m = String(targetMonday.getMonth() + 1).padStart(2, "0");
    const d = String(targetMonday.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const tableData =
    activeTab === "task"
      ? filteredLogs.length
        ? filteredLogs
        : logs
      : workloadData;

  const safeTableData = Array.isArray(tableData) ? tableData : [];

  const totalItems = safeTableData.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

  const paginatedData = safeTableData.slice(startIndex, endIndex);

  return (
    <div style={{ padding: 20, background: "#f7f9fc", minHeight: "auto" }}>
      <h3 style={{ color: "#3A5FBE", marginBottom: 20 }}>
        {activeTab === "task" ? "Task Log" : "Work Load"}
      </h3>

      {/* SEARCH / FILTER BAR */}
      {activeTab === "task" && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: "20px",
            background: "#fff",
            marginBottom: "20px",
            flexWrap: "wrap",
            ...(isMobile && {
              flexDirection: "row",
              flexWrap: "wrap",
            }),
          }}
        >
          {/* LEFT SIDE */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <b style={{ color: "#3A5FBE", whiteSpace: "nowrap" }}>
              Search by any field
            </b>

            <input
              placeholder="Search by any fe..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: 280,
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #ddd",
                height: "40px",
              }}
            />

            <b style={{ whiteSpace: "nowrap", color: "#3A5FBE" }}>
              Filter by date
            </b>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                width: 280,
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #ddd",
                height: "40px",
              }}
            />
          </div>

          {/* RIGHT SIDE BUTTONS */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleFilter}
              className="btn btn-sm custom-outline-btn"
              style={{ minWidth: 90 }}
            >
              Filter
            </button>

            <button
              onClick={handleReset}
              className="btn btn-sm custom-outline-btn"
              style={{ minWidth: 90 }}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {activeTab === "work" && (
        <div className="workload-filter-wrapper">
          <div className="workload-filter-left">
            <div className="filter-group">
              <span>Workload by date</span>
              <input
                type="date"
                value={workloadDate}
                onChange={(e) => {
                  setWorkloadDate(e.target.value);
                  setWorkloadWeek("");
                  setWorkloadMonth("");
                }}
              />
            </div>

            <div className="filter-group">
              <span>Workload by week</span>
              <input
                type="week"
                value={workloadWeek}
                onChange={(e) => {
                  setWorkloadWeek(e.target.value);
                  setWorkloadDate("");
                  setWorkloadMonth("");
                }}
              />
            </div>

            <div className="filter-group">
              <span>Workload by month</span>
              <input
                type="month"
                value={workloadMonth}
                onChange={(e) => {
                  setWorkloadMonth(e.target.value);
                  setWorkloadDate("");
                  setWorkloadWeek("");
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={gettingWorkload}
              className="btn btn-sm custom-outline-btn"
              style={{ minWidth: 90 }}
            >
              Get Workload
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 32,
          marginTop: 24,
          marginBottom: 18,
        }}
      >
        <span
          onClick={() => {
            setActiveTab("task");
            setCurrentPage(1);
          }}
          style={{
            cursor: "pointer",
            fontSize: 16,
            fontWeight: activeTab === "task" ? 600 : 500,
            color: activeTab === "task" ? "#3A5FBE" : "#4b5563",
            paddingBottom: 6,
            borderBottom: activeTab === "task" ? "3px solid #3A5FBE" : "none",
            transition: "all 0.2s ease",
          }}
        >
          Task Log
        </span>

        <span
          onClick={() => {
            setActiveTab("work");
            setCurrentPage(1);
          }}
          style={{
            cursor: "pointer",
            fontSize: 16,
            fontWeight: activeTab === "work" ? 600 : 500,
            color: activeTab === "work" ? "#3A5FBE" : "#4b5563",
            paddingBottom: 6,
            borderBottom: activeTab === "work" ? "3px solid #3A5FBE" : "none",
            transition: "all 0.2s ease",
          }}
        >
          Work Load
        </span>
      </div>

      {/* TABLE */}

      {activeTab === "task" && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            overflowX: "auto",
          }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}
          >
            <thead>
              <tr
                style={{
                  background: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                {[
                  "Date",
                  "Employee",
                  "Task",
                  "Period",
                  "Working Days",
                  "Hours",
                  "Status",
                  "Action",
                  "Rating",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 || filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 20, textAlign: "center" }}>
                    No data found
                  </td>
                </tr>
              ) : (
                paginatedData.map((log, index) => {
                  const absoluteIndex = startIndex + index;
                  return (
                    <tr
                      key={log._id}
                      onClick={() => {
                        setSelectedRow(log);
                        setViewOpen(true);
                      }}
                      style={{
                        cursor: "pointer",
                        borderBottom: "1px solid #e5e7eb",
                        background: "#fff",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(log.date)}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {log?.employee?.name}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {log?.task?.taskName}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 14 }}>
                        {log?.task?.dateOfTaskAssignment &&
                        log?.task?.dateOfExpectedCompletion ? (
                          <>
                            {/* Period */}
                            <div>
                              {formatDateWithoutYear(
                                log.task.dateOfTaskAssignment
                              )}{" "}
                              →{" "}
                              {formatDateWithoutYear(
                                log.task.dateOfExpectedCompletion
                              )}
                            </div>

                            {/* Day badge ONLY for today's log */}
                            {isToday(log.date) &&
                              (() => {
                                const dayNumber = getTaskDayNumber(
                                  log.task.dateOfTaskAssignment,
                                  log.task.dateOfExpectedCompletion
                                );

                                return (
                                  dayNumber && (
                                    <div
                                      style={{
                                        display: "inline-block",
                                        marginTop: 6,
                                        padding: "2px 8px",
                                        borderRadius: 12,
                                        background: "#e0ecff",
                                        color: "#1d4ed8",
                                        fontSize: 12,
                                        fontWeight: 500,
                                      }}
                                    >
                                      Today • Day {dayNumber}
                                    </div>
                                  )
                                );
                              })()}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 14 }}>
                        {log?.task?.dateOfTaskAssignment &&
                        log?.task?.dateOfExpectedCompletion
                          ? getWorkingDays(
                              log.task.dateOfTaskAssignment,
                              log.task.dateOfExpectedCompletion
                            )
                          : "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDisplayHours(log.totalHours)} hrs
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span style={getStatusColor(log.status)}>
                          {log.status}
                          {log.status === "InProgress" && (
                            <span
                              style={{
                                color: "#92400e",
                                borderRadius: 4,
                                padding: "2px 6px",
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              {log.progressToday}%
                            </span>
                          )}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <button
                          disabled={log.approved}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRow({ ...log, index: absoluteIndex });
                            setApproveOpen(true);
                          }}
                          className="btn btn-sm custom-outline-btn"
                          style={{
                            opacity: log.approved ? 0.6 : 1,
                            cursor: log.approved ? "not-allowed" : "pointer",
                          }}
                        >
                          {log.approved ? "Approved" : "Approve"}
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await rejectTaskLog(log, absoluteIndex);
                              console.log("Task Log rejected successfully");
                            } catch (error) {
                              console.error("Error rejecting task:", error);
                            }
                          }}
                          className="btn btn-outline-danger btn-sm"
                          style={{
                            marginLeft: "10px",
                          }}
                        >
                          Reject
                        </button>
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          verticalAlign: "middle",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {renderStars(log.rating, log?.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW POPUP */}
      {viewOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: 580,
              background: "#fff",
              borderRadius: 10,
              marginTop: "2vh",
              maxHeight: "85vh",
              overflowY: "auto",
              scrollbarWidth: "thin",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                background: "#3f5fbf",
                color: "#fff",
                padding: "12px 16px",
                fontSize: 16,
                fontWeight: 600,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              View Worklog
            </div>

            {/* BODY */}
            <div style={{ padding: 16, fontSize: 14 }}>
              <p>
                <b>Date:</b> {formatDate(selectedRow.date)}
              </p>
              <p>
                <b>Employee:</b> {selectedRow?.employee?.name}
              </p>
              <p>
                <b>Task:</b> {selectedRow?.task?.taskName}
              </p>
              <p>
                <b>Start Time:</b> {selectedRow.startTime}
              </p>
              <p>
                <b>End Time:</b> {selectedRow.endTime}
              </p>
              <p>
                <b>Total Hours:</b> {formatDisplayHours(selectedRow.totalHours)}
              </p>
              <p>
                <b>Status:</b>{" "}
                <span style={getStatusColor(selectedRow.status)}>
                  {selectedRow.status}
                  {selectedRow.status === "InProgress" && (
                    <span
                      style={{
                        color: "#92400e",
                        borderRadius: 4,
                        padding: "2px 6px",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {selectedRow.progressToday}%
                    </span>
                  )}
                </span>
              </p>
              <p>
                <b>Description:</b> {selectedRow.workDescription}
              </p>
              <p>
                <b>Challenges:</b> {selectedRow.challengesFaced}
              </p>
              <p>
                <b>What I Learned:</b> {selectedRow.whatLearnedToday}
              </p>

              {selectedRow.status === "Approved" && (
                <>
                  <p>
                    <b>Remarks:</b> {selectedRow.remarks || "-"}
                  </p>
                  <p>
                    <b>Rating:</b>{" "}
                    {renderStars(selectedRow.rating, selectedRow?.status)}
                  </p>
                </>
              )}
            </div>

            {/* FOOTER */}
            <div
              style={{
                padding: 16,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                onClick={() => setViewOpen(false)}
                className="btn btn-sm custom-outline-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {approveOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div style={{ width: 420, background: "#fff", borderRadius: 8 }}>
            <div
              style={{
                padding: 12,
                background: "#3A5FBE",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              Approve Task Log
            </div>

            <div style={{ padding: 16 }}>
              <label>Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 6,
                }}
              >
                <option value="">Select Rating</option>
                <option value="1">1</option>
                <option value="1.5">1.5</option>
                <option value="2">2</option>
                <option value="2.5">2.5</option>
                <option value="3">3</option>
                <option value="3.5">3.5</option>
                <option value="4">4</option>
                <option value="4.5">4.5</option>
                <option value="5">5</option>
              </select>

              <label>Remarks</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 6,
                }}
              />
            </div>

            <div style={{ padding: 16, textAlign: "right" }}>
              <button
                onClick={() => setApproveOpen(false)}
                className="btn btn-sm custom-outline-btn"
              >
                Cancel
              </button>

              <button
                onClick={handleApproveSubmit}
                className="btn btn-sm custom-outline-btn"
                style={{ marginLeft: 8 }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {activeTab === "work" && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            overflowX: "auto",
          }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}
          >
            <thead>
              <tr
                style={{
                  background: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                {[
                  "Date",
                  "Employee",
                  "Tasks",
                  "Est. Hours",
                  "Logged Hours",
                  "Utilization",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 20, textAlign: "center" }}>
                    No data found
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {workloadRangeLabel || formatDate(date)}
                    </td>

                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.employeeName}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.tasks}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDisplayHours(row.estimatedHours)}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDisplayHours(row.loggedHours)}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.utilization.toFixed(0)}%{" "}
                      <span style={getUtilizationColor(row.status)}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalItems > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 16,
            marginTop: 12,
            fontSize: 14,
            color: "#374151",
          }}
        >
          {/* Rows per page */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: "4px 6px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                cursor: "pointer",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>

          {/* Range text */}
          <span>
            {startIndex + 1}-{endIndex} of {totalItems}
          </span>

          {/* Prev */}
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 18,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.4 : 1,
            }}
          >
            ‹
          </button>

          {/* Next */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 18,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.4 : 1,
            }}
          >
            ›
          </button>
        </div>
      )}
      <div className="text-end mt-3">
        <button
          className="btn btn-sm custom-outline-btn"
          style={{ minWidth: 90 }}
          onClick={() => window.history.go(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ManagerTasklog;
