import React, { useEffect, useState, useMemo } from "react";
import AllEmployeesTable from "./AllEmployeesTable";
import AllProjectsTable from "./AllProjectsTable";
import DelayedTasksTable from "./DelayedTasksTable";
import UpcomingTasksTable from "./UpcomingTasksTable";
import EmployeeTasksView from "./EmployeeTasksView";
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
function HRReportTMS() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showCardList, setShowCardList] = useState("allEmployees");

  // State for API data
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //shivani report
  const [projects, setProjects] = useState([]);
  const [tableProjects, setTableProjects] = useState([]);
  const [projectRange, setProjectRange] = useState("all");
  const [allTasks, setAllTasks] = useState([]);
  const [selectedTaskMonth, setSelectedTaskMonth] = useState("all");

  const TASK_COLORS = {
    Completed: "#198754",
    Assigned: "#3A5FBE",
    "Assignment Pending": "#ffc107",
    "In Progress": "#0d6efd",
    Hold: "#6c757d",
    Cancelled: "#adb5bd",
    Delayed: "#dc3545",
  };

  const taskMonthOptions = useMemo(() => {
    const months = [];
    const today = new Date();

    // include next month + past 5 months
    for (let i = -1; i < 5; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);

      months.push({
        label: d.toLocaleString("en-US", { month: "short", year: "numeric" }),
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
            const dateStr = task.dateOfTaskAssignment; // ✅ correct field
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
    return allTasks.length;
  }, [allTasks]);

  {
    /* 
  useEffect(() => {
    const fetchTasks = async () => {
      const res = await axios.get("https://server-backend-nu.vercel.app/task/getall");
      setAllTasks(res.data || []);
    };

    fetchTasks();
  }, []);
*/
  }
  const TaskStatusTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const statusName = payload[0].name;

    const filteredTasks = allTasks.filter((task) => {
      // ✅ Status match
      const statusMatch =
        task?.status?.name?.trim().toLowerCase() ===
        statusName.trim().toLowerCase();

      if (!statusMatch) return false;

      // ✅ Month filter
      if (selectedTaskMonth === "all") return true;

      const dateStr = task.dateOfTaskAssignment; // ✅ correct field
      if (!dateStr) return false;

      const d = new Date(dateStr);
      if (isNaN(d)) return false;

      const taskMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;

      return taskMonth === selectedTaskMonth;
    });

    // ✅ Employee-wise task count
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
  {
    /*
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("https://server-backend-nu.vercel.app/api/projects");
        setProjects(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Project fetch error:", err);
      }
    };

    fetchProjects();
  }, []);
 */
  }
  const getLatestMonthDate = (projects) => {
    return projects.reduce((latest, p) => {
      const status = p.status?.name?.toLowerCase();

      let dateStr = null;

      if (status === "assigned") {
        dateStr = p.startDate;
      } else if (status === "completed" || status === "delayed") {
        dateStr = p.dueDate;
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

    const months = [];
    const total = range === "all" ? 12 : Number(range);

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
    if (!projects.length) return [];

    const statusKeyMap = {
      assigned: "Assigned",
      completed: "Completed",
      delayed: "Delayed",
    };

    // ✅ Generate months FIRST
    const baseMonths =
      projectRange === "all"
        ? getLastMonths(projects, 12)
        : getLastMonths(projects, projectRange);

    const monthMap = {};
    baseMonths.forEach((m) => {
      monthMap[m.key] = m;
    });

    // ✅ Fill data
    projects.forEach((project) => {
      const rawStatus = project.status?.name?.toLowerCase();
      const statusName = statusKeyMap[rawStatus];
      if (!statusName) return;

      let dateToUse = null;

      if (statusName === "Assigned") {
        dateToUse = project.startDate || project.createdAt;
      } else {
        dateToUse = project.dueDate;
      }

      if (!dateToUse) return;

      const d = new Date(dateToUse);
      if (isNaN(d)) return;

      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthMap[key]) return;

      monthMap[key][statusName]++;
    });

    return Object.values(monthMap).sort((a, b) => a.sortDate - b.sortDate);
  }, [projects, projectRange]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem("accessToken");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // Fetch all data using your existing APIs
        const [employeesRes, tasksRes, projectsRes] = await Promise.all([
          fetch("https://server-backend-nu.vercel.app/getAllEmployees", { headers }),
          fetch("https://server-backend-nu.vercel.app/task/getall", { headers }),
          fetch("https://server-backend-nu.vercel.app/api/projects", { headers }),
        ]);

        if (!employeesRes.ok || !tasksRes.ok || !projectsRes.ok) {
          throw new Error("Failed to fetch data from server");
        }

        const employeesData = await employeesRes.json();
        const tasksData = await tasksRes.json();
        setAllTasks(tasksData);
        const projectsData = await projectsRes.json();

        // Transform employee data to match your component structure
        const formattedEmployees = employeesData.map((emp) => ({
          id: emp._id,
          name: emp.name,
          role: emp.role,
          managerId: emp.reportingManager,
          managerName: emp.reportingManager?.name || "N/A",
          department: emp.department,
          designation: emp.designation,
          email: emp.email,
          contact: emp.contact,
        }));

        // Transform task data
        const formattedTasks = tasksData.map((task) => ({
          id: task._id,
          title: task.taskName,
          employeeId: task.assignedTo?._id,
          employeeName: task.assignedTo?.name || task.assignedTo?.username,
          status: task.status?.name || "Unknown",
          project: task.projectName?.name || task.projectName,
          dueDate: task.dateOfExpectedCompletion,
        }));
        setTasks(formattedTasks);
        // Transform project data
        const formattedProjects = projectsData.map((proj) => ({
          id: proj._id,
          name: proj.name,
          status: proj.status?.name || "Unknown",
          managerId: proj.managers?.[0]?._id,
          managerName: proj.managers?.[0]?.name || "N/A",
          deliveryDate: proj.dueDate,
        }));

        setEmployees(formattedEmployees);
        setTasks(formattedTasks);
        setProjects(projectsData?.data || projectsData);
        setTableProjects(formattedProjects);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate counts
  const totalEmployees = employees.length;
  const projectCount = projects.length;
  const activeProjectCount = projects.filter(
    (p) =>
      p.status === "Active" ||
      p.status === "In Progress" ||
      p.status === "Ongoing"
  ).length;

  // Fixed delayed tasks calculation
  const today = new Date().toISOString().slice(0, 10);
  const delayedTasks = tasks.filter((task) => {
    // Check if dueDate exists and is valid
    if (!task.dueDate) return false;

    // Normalize dates for comparison (remove time part)
    const taskDueDate = new Date(task.dueDate).toISOString().slice(0, 10);

    // Task is delayed if due date is before today
    const isPastDue = taskDueDate < today;

    // Check if task is NOT completed or cancelled
    const statusLower = (task.status || "").toLowerCase();
    const isNotCompleted =
      statusLower !== "completed" &&
      statusLower !== "cancelled" &&
      statusLower !== "done" &&
      statusLower !== "closed";

    return isPastDue && isNotCompleted;
  });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().slice(0, 10);
  const upcomingTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const taskDueDate = new Date(t.dueDate).toISOString().slice(0, 10);
    return taskDueDate >= today && taskDueDate <= nextWeekStr;
  });

  // Loading state
  if (loading) {
    return (
      <div className="container-fluid p-4" style={{ marginTop: "-25px" }}>
        <h3
          className="mb-4 fw-bold"
          style={{ color: "#3A5FBE", fontSize: "25px" }}
        >
          Organization Reports
        </h3>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container-fluid p-4" style={{ marginTop: "-25px" }}>
        <h3
          className="mb-4 fw-bold"
          style={{ color: "#3A5FBE", fontSize: "25px" }}
        >
          Organization Reports
        </h3>
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Error loading data</h5>
          <p>{error}</p>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ marginTop: "-25px" }}>
      <h3
        className="mb-4 fw-bold"
        style={{ color: "#3A5FBE", fontSize: "25px" }}
      >
        Organization Reports
      </h3>

      {/* Top Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div
            className="card shadow-sm h-100 border-0"
            style={{ borderRadius: "7px", cursor: "pointer" }}
            onClick={() => {
              setSelectedEmployee(null);
              setShowCardList("allEmployees");
            }}
          >
            <div
              className="card-body d-flex align-items-center"
              style={{ gap: "20px" }}
            >
              <h4
                className="mb-0  d-flex align-items-center justify-content-center"
                style={{
                  fontSize: "32px",
                  backgroundColor: "#D1ECF1",
                  minWidth: "70px",
                  minHeight: "70px",
                  color: "#3A5FBE",
                  fontWeight: "600px",
                }}
              >
                {totalEmployees}
              </h4>
              <div>
                <div
                  className="mb-0 fw-semibold"
                  style={{ color: "#3A5FBE", fontSize: "18px" }}
                >
                  All Employees
                </div>
                <small style={{ color: "#9e9e9e", fontSize: "12px" }}>
                  Click to view list
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow-sm h-100 border-0"
            style={{ borderRadius: "7px", cursor: "pointer" }}
            onClick={() => {
              setSelectedEmployee(null);
              setShowCardList("allProjects");
            }}
          >
            <div
              className="card-body d-flex align-items-center"
              style={{ gap: "20px" }}
            >
              <h4
                className="mb-0  d-flex align-items-center justify-content-center"
                style={{
                  fontSize: "32px",
                  backgroundColor: "#D1ECF1",
                  minWidth: "70px",
                  minHeight: "70px",
                  color: "#3A5FBE",
                  fontWeight: "600px",
                }}
              >
                {projectCount}
              </h4>
              <div>
                <div
                  className="mb-0 fw-semibold"
                  style={{ color: "#3A5FBE", fontSize: "18px" }}
                >
                  All Projects
                </div>
                <small style={{ color: "#9e9e9e", fontSize: "12px" }}>
                  Click to view list
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow-sm h-100 border-0"
            style={{ borderRadius: "7px", cursor: "pointer" }}
            onClick={() => {
              setSelectedEmployee(null);
              setShowCardList("delayedTasks");
            }}
          >
            <div
              className="card-body d-flex align-items-center"
              style={{ gap: "20px" }}
            >
              <h4
                className="mb-0  d-flex align-items-center justify-content-center"
                style={{
                  fontSize: "32px",
                  backgroundColor: "#D1ECF1",
                  minWidth: "70px",
                  minHeight: "70px",
                  color: "#3A5FBE",
                  fontWeight: "600px",
                }}
              >
                {delayedTasks.length}
              </h4>
              <div>
                <div
                  className="mb-0 fw-semibold"
                  style={{ color: "#3A5FBE", fontSize: "18px" }}
                >
                  Delayed Tasks
                </div>
                <small style={{ color: "#9e9e9e", fontSize: "12px" }}>
                  Click to view list
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow-sm h-100 border-0"
            style={{ borderRadius: "7px", cursor: "pointer" }}
            onClick={() => {
              setSelectedEmployee(null);
              setShowCardList("upcomingTasks");
            }}
          >
            <div
              className="card-body d-flex align-items-center"
              style={{ gap: "20px" }}
            >
              <h4
                className="mb-0  d-flex align-items-center justify-content-center"
                style={{
                  fontSize: "32px",
                  backgroundColor: "#D1ECF1",
                  minWidth: "70px",
                  minHeight: "70px",
                  color: "#3A5FBE",
                  fontWeight: "600px",
                }}
              >
                {upcomingTasks.length}
              </h4>
              <div>
                <div
                  className="mb-0 fw-semibold"
                  style={{ color: "#3A5FBE", fontSize: "18px" }}
                >
                  Upcoming Tasks (Next 7 days)
                </div>
                <small style={{ color: "#9e9e9e", fontSize: "12px" }}>
                  Click to view list
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conditional Rendering */}
      {selectedEmployee && (
        <EmployeeTasksView
          selectedEmployee={selectedEmployee}
          allTasks={tasks}
          onBack={() => setSelectedEmployee(null)}
        />
      )}

      {showCardList === "allEmployees" && !selectedEmployee && (
        <AllEmployeesTable
          employees={employees}
          onClose={() => setShowCardList(null)}
          onViewTasks={(emp) => setSelectedEmployee(emp)}
        />
      )}

      {showCardList === "allProjects" && (
        <AllProjectsTable
          projects={tableProjects}
          onClose={() => setShowCardList(null)}
        />
      )}

      {showCardList === "delayedTasks" && (
        <DelayedTasksTable
          delayedTasks={delayedTasks}
          allEmployees={employees}
          onClose={() => setShowCardList(null)}
        />
      )}

      {showCardList === "upcomingTasks" && (
        <UpcomingTasksTable
          upcomingTasks={upcomingTasks}
          allEmployees={employees}
          onClose={() => setShowCardList(null)}
        />
      )}

      <div className="row g-4 mt-4 align-items-stretch">
        {/* TASK STATUS DONUT */}
        <div className="col-lg-4 col-md-5">
          <div className="card shadow-sm border-0 rounded-4 h-100">
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
                      maxWidth: "120px",
                      minWidth: "100px",
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
                    style={{ minWidth: "120px" }}
                  >
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => setSelectedTaskMonth("all")}
                      >
                        All Months
                      </button>
                    </li>

                    {taskMonthOptions.map((m) => (
                      <li key={m.value}>
                        <button
                          className="dropdown-item"
                          onClick={() => setSelectedTaskMonth(m.value)}
                        >
                          {m.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <ResponsiveContainer
                width="100%"
                height={300}
                style={{ outline: "none" }}
              >
                <PieChart tabIndex={-1}>
                  <Pie
                    data={taskStatusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    stroke="none"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {taskStatusChartData.map((entry) => (
                      <Cell
                        stroke="none"
                        key={entry.name}
                        fill={TASK_COLORS[entry.name] || "#adb5bd"}
                      />
                    ))}
                  </Pie>

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
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: "13px",
                      fill: "#6c757d",
                    }}
                  >
                    Total Tasks
                  </text>

                  <Tooltip
                    content={<TaskStatusTooltip />}
                    cursor={{ fill: "transparent" }}
                  />
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

        {/* PROJECT STATUS LINE */}
        <div className="col-lg-8 col-md-7">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-semibold text-primary mb-0">
                  📈 Project Status Trend
                </h6>
                <small className="text-muted">Month-wise overview</small>

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
                    }}
                  >
                    {projectRange === "all"
                      ? "All"
                      : projectRange === "3"
                      ? "Last 3 Months"
                      : "Last 6 Months"}
                  </button>

                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    style={{ minWidth: "140px" }}
                  >
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => setProjectRange("all")}
                      >
                        All
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => setProjectRange("3")}
                      >
                        Last 3 Months
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => setProjectRange("6")}
                      >
                        Last 6 Months
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={projectStatusLineData}>
                  <CartesianGrid stroke="#e9ecef" strokeDasharray="4 4" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend iconType="circle" />

                  <Line
                    dataKey="Assigned"
                    stroke="#0d6efd"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
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

export default HRReportTMS;
