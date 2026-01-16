import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./ReportTMSGraph.css";

// Mock data
const MOCK_TEAM_EMPLOYEES = [
  { id: 1, name: "Dipali", role: "Developer", managerId: 1 },
  { id: 2, name: "Harshda", role: "QA Engineer", managerId: 1 },
  { id: 3, name: "Adesh", role: "Junior Developer", managerId: 1 },
];

const DASHBOARD_CARD_BG = "#fff";
const DASHBOARD_CARD_TEXT = "#3A5FBE";
const DASHBOARD_CARD_HOVER = "rgba(58, 95, 190, 0.08)";

// Reusable footer (same design everywhere)
function PaginationFooter({
  totalItems,
  currentPage,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const from = totalItems === 0 ? 0 : indexOfFirstItem + 1;
  const to = Math.min(indexOfLastItem, totalItems);

  const goTo = (p) => setCurrentPage(Math.min(Math.max(p, 1), totalPages));

  const isPrevDisabled = currentPage <= 1 || totalItems === 0;
  const isNextDisabled = currentPage >= totalPages || totalItems === 0;

  return (
    <nav className="d-flex align-items-center justify-content-end text-muted">
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center">
          <span
            style={{ fontSize: "14px", marginRight: "8px", color: "#212529" }}
          >
            Rows per page:
          </span>
          <select
            className="form-select form-select-sm"
            style={{ width: "auto", fontSize: "14px" }}
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>

        <span
          style={{ fontSize: "14px", marginLeft: "16px", color: "#212529" }}
        >
          {from}-{to} of {totalItems}
        </span>

        <div
          className="d-flex align-items-center"
          style={{ marginLeft: "16px" }}
        >
          <button
            className="btn btn-sm border-0"
            type="button"
            onClick={() => goTo(currentPage - 1)}
            disabled={isPrevDisabled}
            style={{
              fontSize: "18px",
              padding: "2px 8px",
              color: isPrevDisabled ? "#c0c4cc" : "#212529",
            }}
            aria-label="Previous page"
          >
            ‹
          </button>

          <button
            className="btn btn-sm border-0"
            type="button"
            onClick={() => goTo(currentPage + 1)}
            disabled={isNextDisabled}
            style={{
              fontSize: "18px",
              padding: "2px 8px",
              color: isNextDisabled ? "#c0c4cc" : "#212529",
            }}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </nav>
  );
}

function ManagerReportTMS({ user }) {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showCardList, setShowCardList] = useState("teamMembers");
  const [teamEmployees, setTeamEmployees] = useState([]);
  const [employeesTasks, setEmployeesTasks] = useState([]);
  const [managerProjects, setManagerProjects] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  const [allTasks, setAllTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [monthRange, setMonthRange] = useState(0);
  const [selectedTaskMonth, setSelectedTaskMonth] = useState("all");

  const TASK_COLORS = {
    Completed: "#198754",
    Assigned: "#3A5FBE",
    "Assignment Pending": "#ffc107",
    "In Progress": "#0d6efd",
    Hold: "#fd7e14",
    Cancelled: "#adb5bd",
    Delayed: "#dc3545",
  };

  const taskMonthOptions = useMemo(() => {
    const months = [];
    const today = new Date();

    // 1 future month + current + 4 past = 6 months
    for (let i = 1; i >= -4; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);

      months.push({
        label: d.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        }),
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`,
      });
    }

    return months;
  }, []);

  const taskStatusChartData = useMemo(() => {
    const counts = {
      Completed: 0,
      Assigned: 0,
      "Assignment Pending": 0,
      "In Progress": 0,
      Hold: 0,
      Cancelled: 0,
      Delayed: 0,
    };

    const filteredTasks =
      selectedTaskMonth === "all"
        ? allTasks
        : allTasks.filter((task) => {
            const dateStr = task.dateOfTaskAssignment; // ✅ FIX
            if (!dateStr) return false;

            const d = new Date(dateStr);
            if (isNaN(d)) return false;

            const taskMonth = `${d.getFullYear()}-${String(
              d.getMonth() + 1
            ).padStart(2, "0")}`;

            return taskMonth === selectedTaskMonth;
          });

    filteredTasks.forEach((task) => {
      const statusName = task?.status?.name;
      if (counts[statusName] !== undefined) {
        counts[statusName]++;
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);
  }, [allTasks, selectedTaskMonth]);

  const totalTasks = useMemo(() => {
    return taskStatusChartData.reduce((sum, item) => sum + item.value, 0);
  }, [taskStatusChartData]);

  const TaskStatusTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const statusName = payload[0].name;

    const filteredTasks = allTasks.filter((task) => {
      const statusMatch =
        task?.status?.name?.trim().toLowerCase() ===
        statusName.trim().toLowerCase();

      if (!statusMatch) return false;

      //  month filter
      if (selectedTaskMonth === "all") return true;

      const dateStr = task.dateOfTaskAssignment;
      if (!dateStr) return false;

      const d = new Date(dateStr);
      if (isNaN(d)) return false;

      const taskMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;

      return taskMonth === selectedTaskMonth;
    });

    const employeeTaskCountMap = {};

    filteredTasks.forEach((task) => {
      const empName = task?.assignedTo?.name || "Unassigned";
      employeeTaskCountMap[empName] = (employeeTaskCountMap[empName] || 0) + 1;
    });

    const employeeEntries = Object.entries(employeeTaskCountMap);

    return (
      <div
        style={{
          background: "#fff",
          padding: "10px 12px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          fontSize: "13px",
          minWidth: "260px",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: "6px" }}>
          {statusName} Tasks
        </div>

        <div style={{ marginBottom: "6px" }}>
          <strong>Total:</strong> {payload[0].value}
        </div>

        <div>
          <strong>Employees:</strong>
          {employeeEntries.length ? (
            <ul style={{ paddingLeft: "16px", margin: "4px 0 0" }}>
              {employeeEntries.map(([name, count]) => (
                <li key={name}>
                  {name} <span style={{ color: "#6c757d" }}>({count})</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted">No tasks</div>
          )}
        </div>
      </div>
    );
  };

  const getLatestMonthDate = (projects) => {
    return projects.reduce((latest, p) => {
      const status = p.status?.name?.toLowerCase();

      let dateStr = null;
      if (status === "assigned") {
        dateStr = p.startDate;
      } else if (status === "completed" || status === "delayed") {
        dateStr = p.deliveryDate || p.dueDate;
      }

      if (!dateStr) return latest;

      const date = new Date(dateStr);
      if (isNaN(date)) return latest;

      return !latest || date > latest ? date : latest;
    }, null);
  };

  const getLastMonths = (projects, range) => {
    const latest = getLatestMonthDate(projects);
    if (!latest) return [];

    // 0 = ALL (12 months)
    const total = !range || range === 0 ? 12 : Number(range);
    const months = [];

    for (let i = total - 1; i >= 0; i--) {
      const d = new Date(latest.getFullYear(), latest.getMonth() - i, 1);

      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: d.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        }),
        sortDate: d,
        Assigned: 0,
        Completed: 0,
        Delayed: 0,
      });
    }

    return months;
  };

  const projectStatusLineData = useMemo(() => {
    //  Create exact month buckets (3 / 6)
    const months = getLastMonths(projects, monthRange);

    //  Convert to map
    const monthMap = {};
    months.forEach((m) => {
      monthMap[m.key] = m;
    });

    //  Fill counts
    projects.forEach((project) => {
      const status = project.status?.name?.toLowerCase();

      let dateStr = null;
      let chartStatus = null;

      if (status === "assigned") {
        dateStr = project.startDate;
        chartStatus = "Assigned";
      } else if (status === "completed") {
        dateStr = project.deliveryDate || project.dueDate;
        chartStatus = "Completed";
      } else if (status === "delayed") {
        dateStr = project.deliveryDate || project.dueDate;
        chartStatus = "Delayed";
      }

      if (!dateStr || !chartStatus) return;

      const d = new Date(dateStr);
      if (isNaN(d)) return;

      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (!monthMap[key]) return;

      monthMap[key][chartStatus]++;
    });

    //  IMPORTANT: return ALL months (even zero values)
    return Object.values(monthMap).sort((a, b) => a.sortDate - b.sortDate);
  }, [projects, monthRange]);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: "12px", fontWeight: 600 }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  //graph api
  useEffect(() => {
    const fetchTasks = async () => {
      const res = await axios.get("https://server-backend-nu.vercel.app/task/getall");
      setAllTasks(res.data || []);
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        // get logged-in manager
        const userRes = await axios.get("https://server-backend-nu.vercel.app/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const managerId = userRes.data?._id;
        if (!managerId) return;

        // SAME API AS MANAGER PROJECT FILE
        const res = await axios.get(
          `https://server-backend-nu.vercel.app/api/projects/manager/${managerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProjects(res.data.data || []);
      } catch (err) {
        console.error("Project fetch error:", err);
      }
    };

    fetchProjects();
  }, []);

  async function fetchRequiredDetails() {
    try {
      const empResponse = await axios.get(
        `https://server-backend-nu.vercel.app/employees/manager/${user._id}`
      );
      const employeeList = empResponse.data.employees;
      const taskResponse = await axios.get("https://server-backend-nu.vercel.app/task/getall");
      const tasks = taskResponse.data.map(
        ({
          _id,
          taskName,
          projectName,
          status,
          assignedTo,
          dateOfExpectedCompletion,
        }) => ({
          _id,
          taskName,
          projectName,
          status,
          assignedTo,
          dateOfExpectedCompletion,
        })
      );
      const projectsResponse = await axios.get(
        `https://server-backend-nu.vercel.app/api/projects/manager/${user._id}`
      );
      const projects = projectsResponse.data.data;
      setEmployeesTasks(tasks);
      setTeamEmployees(employeeList);
      setManagerProjects(projects);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }
  useEffect(() => {
    fetchRequiredDetails();
  }, []);
  // const formatDate = (dateString) =>
  // new Intl.DateTimeFormat("en-GB", {
  //   day: "2-digit",
  //   month: "short",
  //   year: "numeric"
  // }).format(new Date(dateString));
  const managerProjectSet = useMemo(() => {
    return new Set(managerProjects.map((p) => p.name)); // or p.projectName if that’s what task uses
  }, [managerProjects]);
  const managerEmployeeSet = useMemo(() => {
    return new Set(teamEmployees.map((e) => e._id));
  }, [teamEmployees]);

  useEffect(() => {
    if (!managerProjects.length || !teamEmployees.length) return;

    const filtered = employeesTasks.filter(
      (t) =>
        managerProjectSet.has(t.projectName) &&
        managerEmployeeSet.has(t.assignedTo?._id || t.assignedTo)
    );

    setEmployeesTasks(filtered);
  }, [managerProjects, teamEmployees]);

  console.log("managerProjectSet", managerProjectSet);

  console.log("Teamemployees", teamEmployees);
  // Filter states
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Applied filter values
  const [appliedStatus, setAppliedStatus] = useState("All");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  // Calculate counts
  const teamCount = teamEmployees.length;

  const myProjects = managerProjects;
  const projectCount = managerProjects.length;
  // const activeProjectCount = myProjects.filter((p) => p.status === "Active").length;
  const activeProjectCount = myProjects.filter(
    (p) => p?.status?.name !== "Completed"
  ).length;

  //const delayedTasks = employeesTasks.filter((t) => t?.status?.name === "Delayed");
  const delayedTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return employeesTasks.filter((t) => {
      if (!t.dateOfExpectedCompletion) return false;
      const due = new Date(t.dateOfExpectedCompletion);

      if (isNaN(due)) return false;
      due.setHours(0, 0, 0, 0);

      return today > due;
    });
  }, [employeesTasks]);

  const delayedCount = delayedTasks.length;

  // Upcoming tasks (next 7 days)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  const todayStr = today.toISOString().slice(0, 10);
  const nextWeekStr = nextWeek.toISOString().slice(0, 10);

  const upcomingTasks = employeesTasks.filter(
    (t) =>
      t.dateOfExpectedCompletion >= todayStr &&
      t.dateOfExpectedCompletion <= nextWeekStr
  );
  const upcomingCount = upcomingTasks.length;

  // Get employee tasks with filters
  function getEmployeeTasks() {
    if (!selectedEmployee) return [];
    console.log("employeesTasks", employeesTasks);
    console.log("selectedEmployee", selectedEmployee);
    let tasks = employeesTasks.filter(
      (t) => t?.assignedTo?._id === selectedEmployee._id
    );
    console.log("tasks", tasks);
    if (appliedStatus !== "All")
      tasks = tasks.filter((t) => t.status === appliedStatus);
    if (appliedFromDate)
      tasks = tasks.filter((t) => t.dueDate >= appliedFromDate);
    if (appliedToDate) tasks = tasks.filter((t) => t.dueDate <= appliedToDate);

    return tasks;
  }

  const employeeTasks = getEmployeeTasks();

  function handleFilter() {
    setAppliedStatus(statusFilter);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
  }

  function handleReset() {
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
    setAppliedStatus("All");
    setAppliedFromDate("");
    setAppliedToDate("");
  }

  function getStatusStyle(status) {
    if (status === "Completed")
      return { backgroundColor: "#d1f2dd", color: "#0f5132" };
    if (status === "Assignment Pending")
      return { backgroundColor: "#fff3cd", color: "#856404" };
    if (status === "Assigned")
      return { backgroundColor: "#cfe2ff", color: "#084298" };
    if (status === "Delayed" || status === "Hold")
      return { backgroundColor: "#f8d7da", color: "#842029" };
    if (status === "In Progress")
      return { backgroundColor: "#d1e7ff", color: "#0d6efd" };
    return { backgroundColor: "#e2e3e5", color: "#495057" };
  }

  // ================= Pagination (ONLY ADDITION) =================
  const [teamPage, setTeamPage] = useState(1);
  const [teamRows, setTeamRows] = useState(5);

  const [projPage, setProjPage] = useState(1);
  const [projRows, setProjRows] = useState(5);

  const [delayedPage, setDelayedPage] = useState(1);
  const [delayedRows, setDelayedRows] = useState(5);

  const [upcomingPage, setUpcomingPage] = useState(1);
  const [upcomingRows, setUpcomingRows] = useState(5);

  const [taskPage, setTaskPage] = useState(1);
  const [taskRows, setTaskRows] = useState(5);

  useEffect(() => {
    // reset page when switching cards
    setTeamPage(1);
    setProjPage(1);
    setDelayedPage(1);
    setUpcomingPage(1);
  }, [showCardList]);

  useEffect(() => {
    // reset page when changing selected employee or applying filters
    setTaskPage(1);
  }, [selectedEmployee, appliedStatus, appliedFromDate, appliedToDate]);

  const paginatedTeamEmployees = useMemo(() => {
    const start = (teamPage - 1) * teamRows;
    return teamEmployees.slice(start, start + teamRows);
  }, [teamPage, teamRows, teamEmployees]);
  console.log("paginatedTeamEmployees", paginatedTeamEmployees);

  const paginatedMyProjects = useMemo(() => {
    const start = (projPage - 1) * projRows;
    return myProjects.slice(start, start + projRows);
  }, [myProjects, projPage, projRows]);

  const paginatedDelayedTasks = useMemo(() => {
    const start = (delayedPage - 1) * delayedRows;
    return delayedTasks.slice(start, start + delayedRows);
  }, [delayedTasks, delayedPage, delayedRows]);

  const paginatedUpcomingTasks = useMemo(() => {
    const start = (upcomingPage - 1) * upcomingRows;
    return upcomingTasks.slice(start, start + upcomingRows);
  }, [upcomingTasks, upcomingPage, upcomingRows]);

  const paginatedEmployeeTasks = useMemo(() => {
    const start = (taskPage - 1) * taskRows;
    return employeeTasks.slice(start, start + taskRows);
  }, [employeeTasks, taskPage, taskRows]);
  // =============================================================
  //Date format
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="container-fluid ">
      <h2 style={{ color: "#3A5FBE", fontSize: "25px" }}>Reports</h2>

      {/* Top Cards */}
      <div className="row mb-4">
        {/* Team Members Card */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card shadow-sm border-0 h-100"
            style={{ cursor: "pointer", backgroundColor: "#3A5FBE" }}
            onClick={() => {
              setSelectedEmployee(null);
              setShowCardList("teamMembers");
            }}
          >
            <div className="card-body">
              <div
                className="mb-1 fw-semibold"
                style={{ fontSize: "16px", color: "#fff" }}
              >
                My Team Members
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div>
                  <div className="h4 mb-0 text-white">{teamCount}</div>
                  <small className="text-white-50">Click to view list</small>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: "rgba(255,255,255,0.18)",
                    color: "#fff",
                    fontSize: 18,
                  }}
                >
                  👥
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Projects Card */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card shadow-sm border-0 h-100"
            style={{ cursor: "pointer", backgroundColor: "#3A5FBE" }}
            onClick={() => setShowCardList("myProjects")}
          >
            <div className="card-body">
              <div
                className="mb-1 fw-semibold"
                style={{ fontSize: "16px", color: "#fff" }}
              >
                My Projects
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div>
                  <div className="h4 mb-0 text-white">{projectCount}</div>
                  <small className="text-white-50">
                    {activeProjectCount} active
                  </small>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: "rgba(255,255,255,0.18)",
                    color: "#fff",
                    fontSize: 18,
                  }}
                >
                  📁
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delayed Tasks Card */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card shadow-sm border-0 h-100"
            style={{ cursor: "pointer", backgroundColor: "#3A5FBE" }}
            onClick={() => setShowCardList("delayedTasks")}
          >
            <div className="card-body">
              <div
                className="mb-1 fw-semibold"
                style={{ fontSize: "16px", color: "#fff" }}
              >
                Delayed Tasks
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div>
                  <div className="h4 mb-0 text-white">{delayedCount}</div>
                  <small className="text-white-50">Require attention</small>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: "rgba(255,255,255,0.18)",
                    color: "#fff",
                    fontSize: 18,
                  }}
                >
                  ⚠️
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks Card */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="card shadow-sm border-0 h-100"
            style={{ cursor: "pointer", backgroundColor: "#3A5FBE" }}
            onClick={() => setShowCardList("upcomingTasks")}
          >
            <div className="card-body">
              <div
                className="mb-1 fw-semibold"
                style={{ fontSize: "16px", color: "#fff" }}
              >
                Upcoming Tasks (Next 7 days)
              </div>
              <div className="d-flex justify-content-between align-items-end">
                <div>
                  <div className="h4 mb-0 text-white">{upcomingCount}</div>
                  <small className="text-white-50">Click to view list</small>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: "rgba(255,255,255,0.18)",
                    color: "#fff",
                    fontSize: 18,
                  }}
                >
                  📅
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Detail View */}
      {selectedEmployee && (
        <>
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <div>
                <div
                  className="fw-semibold"
                  style={{ color: "#3A5FBE", fontSize: "20px" }}
                >
                  {selectedEmployee.name} - {selectedEmployee.role}
                </div>
                <small className="text-muted">
                  Task report for selected date range
                </small>
              </div>
              <button
                className="btn btn-sm custom-outline-btn"
                onClick={() => {
                  setSelectedEmployee(null);
                  handleReset();
                }}
              >
                Back to List
              </button>
            </div>

            <div className="card-body pt-3">
              {/* Filter Section */}
              <div className="card bg-white shadow-sm p-3 mb-4 border-0">
                <div className="row g-3 align-items-end">
                  <div className="col-12 col-md-3">
                    <label
                      className="form-label mb-1 fw-bold"
                      style={{ fontSize: 14, color: "#3A5FBE" }}
                    >
                      Status
                    </label>
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Completed">Completed</option>
                      <option value="Assignment Pending">
                        Assignment Pending
                      </option>
                      <option value="Assigned">Assigned</option>
                      <option value="Delayed">Delayed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Hold">Hold</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-3">
                    <label
                      className="form-label mb-1 fw-bold"
                      style={{ fontSize: 14, color: "#3A5FBE" }}
                    >
                      From
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <label
                      className="form-label mb-1 fw-bold"
                      style={{ fontSize: 14, color: "#3A5FBE" }}
                    >
                      To
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-md-3 d-flex gap-2">
                    <button
                      className="btn btn-sm custom-outline-btn flex-fill"
                      onClick={handleFilter}
                    >
                      Filter
                    </button>
                    <button
                      className="btn btn-sm custom-outline-btn flex-fill"
                      onClick={handleReset}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Task Table */}
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ backgroundColor: "#ffffffff" }}>
                    <tr>
                      <th
                        style={{
                          fontWeight: "500",
                          fontSize: "14px",
                          color: "#6c757d",
                          borderBottom: "2px solid #dee2e6",
                          padding: "12px",
                        }}
                      >
                        Task
                      </th>
                      <th
                        style={{
                          fontWeight: "500",
                          fontSize: "14px",
                          color: "#6c757d",
                          borderBottom: "2px solid #dee2e6",
                          padding: "12px",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          fontWeight: "500",
                          fontSize: "14px",
                          color: "#6c757d",
                          borderBottom: "2px solid #dee2e6",
                          padding: "12px",
                        }}
                      >
                        Project
                      </th>
                      <th
                        style={{
                          fontWeight: "500",
                          fontSize: "14px",
                          color: "#6c757d",
                          borderBottom: "2px solid #dee2e6",
                          padding: "12px",
                        }}
                      >
                        Due Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {employeeTasks.length > 0 ? (
                      paginatedEmployeeTasks.map((task) => (
                        <tr key={task._id}>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "14px",
                              borderBottom: "1px solid #dee2e6",
                              color: "#212529",
                            }}
                          >
                            {task.taskName}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "14px",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            <span
                              style={{
                                ...getStatusStyle(task?.status?.name),
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "500",
                                display: "inline-block",
                              }}
                            >
                              {task?.status?.name}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "14px",
                              borderBottom: "1px solid #dee2e6",
                              color: "#212529",
                            }}
                          >
                            {task.projectName}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "14px",
                              borderBottom: "1px solid #dee2e6",
                              color: "#212529",
                            }}
                          >
                            {formatDate(task.dateOfExpectedCompletion)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-3 text-muted">
                          No tasks found for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <PaginationFooter
              totalItems={employeeTasks.length}
              currentPage={taskPage}
              itemsPerPage={taskRows}
              setCurrentPage={setTaskPage}
              setItemsPerPage={setTaskRows}
            />
          </div>
        </>
      )}

      {/* Team Members List */}
      {showCardList === "teamMembers" && !selectedEmployee && (
        <>
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <span
                className="fw-semibold"
                style={{ color: "#3A5FBE", fontSize: "20px" }}
              >
                My Team Members
              </span>
              <button
                className="btn btn-sm custom-outline-btn"
                onClick={() => setShowCardList(null)}
              >
                Close
              </button>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: "#ffffffff" }}>
                  <tr>
                    <th
                      style={{
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#6c757d",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px",
                      }}
                    >
                      Name
                    </th>
                    <th
                      style={{
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#6c757d",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px",
                      }}
                    >
                      Role
                    </th>
                    <th
                      style={{
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#6c757d",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px",
                      }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTeamEmployees.map((emp) => (
                    <tr key={emp._id}>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          color: "#212529",
                        }}
                      >
                        {emp.name}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          color: "#212529",
                        }}
                      >
                        {emp.designation}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                        }}
                      >
                        <button
                          className="btn btn-sm custom-outline-btn"
                          onClick={() => {
                            setSelectedEmployee(emp);
                          }}
                        >
                          View Tasks
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <PaginationFooter
              totalItems={teamEmployees.length}
              currentPage={teamPage}
              itemsPerPage={teamRows}
              setCurrentPage={setTeamPage}
              setItemsPerPage={setTeamRows}
            />
          </div>
        </>
      )}

      {/* My Projects List */}
      {showCardList === "myProjects" && (
        <>
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <span
                className="fw-semibold"
                style={{ color: "#3A5FBE", fontSize: "20px" }}
              >
                My Projects
              </span>
              <button
                className="btn btn-sm custom-outline-btn"
                onClick={() => setShowCardList(null)}
              >
                Close
              </button>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: "#ffffffff" }}>
                  <tr>
                    <th
                      style={{
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#6c757d",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px",
                      }}
                    >
                      Project Name
                    </th>
                    <th
                      style={{
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#6c757d",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#6c757d",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px",
                      }}
                    >
                      Delivery Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMyProjects.map((proj) => (
                    <tr key={proj._id}>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          color: "#212529",
                        }}
                      >
                        {proj.name}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                        }}
                      >
                        <span
                          style={{
                            ...getStatusStyle(
                              proj?.status?.name ? "Delayed" : "Completed"
                            ),
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          {proj?.status?.name === "Delayed"
                            ? "Delayed"
                            : proj?.status?.name}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          color: "#212529",
                        }}
                      >
                        {formatDate(proj.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <PaginationFooter
              totalItems={myProjects.length}
              currentPage={projPage}
              itemsPerPage={projRows}
              setCurrentPage={setProjPage}
              setItemsPerPage={setProjRows}
            />
          </div>
        </>
      )}

      {/* Delayed Tasks List */}
      {showCardList === "delayedTasks" && (
        <>
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <span
                className="fw-semibold"
                style={{ color: "#3A5FBE", fontSize: "20px" }}
              >
                Delayed Tasks
              </span>
              <button
                className="btn btn-sm custom-outline-btn"
                onClick={() => setShowCardList(null)}
              >
                Close
              </button>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: "#ffffffff" }}>
                  <tr>
                    <th
                      style={{
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#6c757d",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px",
                      }}
                    >
                      Task
                    </th>
                    <th
                      style={{
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#6c757d",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px",
                      }}
                    >
                      Employee
                    </th>
                    <th
                      style={{
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#6c757d",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px",
                      }}
                    >
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDelayedTasks.map((task) => {
                    const emp = MOCK_TEAM_EMPLOYEES.find(
                      (e) => e.id === task.employeeId
                    );
                    return (
                      <tr key={task._id}>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "14px",
                            borderBottom: "1px solid #dee2e6",
                            color: "#212529",
                          }}
                        >
                          {task.taskName}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "14px",
                            borderBottom: "1px solid #dee2e6",
                            color: "#212529",
                          }}
                        >
                          {task?.assignedTo?.name || "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "14px",
                            borderBottom: "1px solid #dee2e6",
                            color: "#212529",
                          }}
                        >
                          {formatDate(task.dateOfExpectedCompletion)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <PaginationFooter
              totalItems={delayedTasks.length}
              currentPage={delayedPage}
              itemsPerPage={delayedRows}
              setCurrentPage={setDelayedPage}
              setItemsPerPage={setDelayedRows}
            />
          </div>
        </>
      )}

      {/* Upcoming Tasks List */}
      {showCardList === "upcomingTasks" && (
        <>
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <span
                className="fw-semibold"
                style={{ color: "#3A5FBE", fontSize: "20px" }}
              >
                Upcoming Tasks (Next 7 days)
              </span>
              <button
                className="btn btn-sm custom-outline-btn"
                onClick={() => setShowCardList(null)}
              >
                Close
              </button>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: "#ffffffff" }}>
                  <tr>
                    <th
                      style={{
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#6c757d",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px",
                      }}
                    >
                      Task
                    </th>
                    <th
                      style={{
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#6c757d",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px",
                      }}
                    >
                      Employee
                    </th>
                    <th
                      style={{
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#6c757d",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px",
                      }}
                    >
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUpcomingTasks.map((task) => {
                    return (
                      <tr key={task._id}>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "14px",
                            borderBottom: "1px solid #dee2e6",
                            color: "#212529",
                          }}
                        >
                          {task.taskName}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "14px",
                            borderBottom: "1px solid #dee2e6",
                            color: "#212529",
                          }}
                        >
                          {task?.assignedTo?.name || "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            fontSize: "14px",
                            borderBottom: "1px solid #dee2e6",
                            color: "#212529",
                          }}
                        >
                          {formatDate(task.dateOfExpectedCompletion)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <PaginationFooter
              totalItems={upcomingTasks.length}
              currentPage={upcomingPage}
              itemsPerPage={upcomingRows}
              setCurrentPage={setUpcomingPage}
              setItemsPerPage={setUpcomingRows}
            />
          </div>
        </>
      )}

      <div className="row g-4 mt-4 align-items-stretch">
        {/* TASK STATUS (DONUT) */}
        <div className="col-lg-4 col-md-5">
          <div className="card shadow-sm border-0 h-100 rounded-4">
            <div className="card-body d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-semibold mb-0 text-primary">
                  📊 Task Status Overview
                </h6>

                <div className="dropdown">
                  <button
                    className="form-select form-select-sm text-start"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                      width: "100%",
                      maxWidth: "140px",
                      minWidth: "110px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedTaskMonth === "all"
                      ? "All Months"
                      : taskMonthOptions.find(
                          (m) => m.value === selectedTaskMonth
                        )?.label}
                  </button>

                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    style={{
                      minWidth: "160px",
                      maxWidth: "90vw",
                      overflowX: "hidden",
                    }}
                  >
                    <li>
                      <button
                        className="dropdown-item text-wrap"
                        onClick={() => setSelectedTaskMonth("all")}
                      >
                        All Months
                      </button>
                    </li>

                    {taskMonthOptions.map((m) => (
                      <li key={m.value}>
                        <button
                          className="dropdown-item text-wrap"
                          onClick={() => setSelectedTaskMonth(m.value)}
                        >
                          {m.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={taskStatusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {taskStatusChartData.map((entry, i) => (
                      <Cell key={i} fill={TASK_COLORS[entry.name]} />
                    ))}
                  </Pie>

                  {/*  CENTER TOTAL TASKS */}
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: "22px",
                      fontWeight: "700",
                      fill: "#212529",
                    }}
                  >
                    {totalTasks}
                  </text>

                  <text
                    x="50%"
                    y="43%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: "13px", fill: "#6c757d" }}
                  >
                    Total Tasks
                  </text>

                  <Tooltip content={<TaskStatusTooltip />} />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "13px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* PROJECT STATUS (LINE) */}
        <div className="col-lg-8 col-md-7">
          <div className="card shadow border-0 h-100 rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-semibold mb-0 text-primary">
                  📈 Project Status Trend
                </h6>

                <small className="text-muted">Monthly overview</small>
                <div className="d-flex align-items-center gap-2">
                  <div className="dropdown">
                    <button
                      className="form-select form-select-sm text-start"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{
                        width: "100%",
                        maxWidth: "120px",
                        minWidth: "100px",
                      }}
                    >
                      {monthRange === 0
                        ? "All"
                        : monthRange === 3
                        ? "Last 3 Months"
                        : "Last 6 Months"}
                    </button>

                    <ul
                      className="dropdown-menu dropdown-menu-end"
                      style={{
                        minWidth: "120px",
                      }}
                    >
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => setMonthRange(0)}
                        >
                          All
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => setMonthRange(3)}
                        >
                          Last 3 Months
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => setMonthRange(6)}
                        >
                          Last 6 Months
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={projectStatusLineData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid stroke="#e9ecef" strokeDasharray="4 4" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" />

                  <Line
                    dataKey="Assigned"
                    stroke="#0d6efd"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="Completed"
                    stroke="#198754"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Delayed"
                    stroke="#dc3545"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

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
}

export default ManagerReportTMS;
