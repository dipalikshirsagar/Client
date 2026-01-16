import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const ManagerTeamsTMS = ({ role }) => {
  const userRole = role || localStorage.getItem("role");
  const assignRef = useRef(null); //added by aditya
  const [isOpen, setIsOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [teamErrors, setTeamErrors] = useState({});

  const [allTeams, setAllTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [department, setDepartment] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const initialTaskStats = [
    { title: "Total Teams", count: 6 },
    { title: "Total Managers", count: 20 },
    { title: "Total Employees", count: 70 },
    { title: "Total Departments", count: 6 },
  ];
  const [taskStats, setTaskStats] = useState(initialTaskStats);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newTeam, setNewTeam] = useState({
    name: "",
    project: "",
    department: "",
    assignToProject: [],
  });
  const normalizeDepartment = (value) => {
    if (!value) return "";
    const v = String(value).trim().toLowerCase();

    if (v.startsWith("it")) return "IT";
    if (v.includes("finance")) return "Finance";
    if (v.includes("qa") || v.includes("test")) return "QA";
    if (v.includes("ui")) return "UI/UX";

    return value.trim();
  };
  //const assignRef = useRef(null);

  async function fetchUser() {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get("https://server-backend-nu.vercel.app/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data;
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const user = await fetchUser();
      const [teamsRes, managersRes, employeesRes, departmentsRes] =
        await Promise.all([
          axios.get(`https://server-backend-nu.vercel.app/api/teams/createdBy/${user._id}`),
          axios.get("https://server-backend-nu.vercel.app/managers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://server-backend-nu.vercel.app/getAllEmployees", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://server-backend-nu.vercel.app/getAllDepartments"),
        ]);

      const normalizedDepartments = departmentsRes.data.departments.map((d) =>
        normalizeDepartment(d)
      );
      const uniqueDepartments = [...new Set(normalizedDepartments)];
      const totalTeams = teamsRes.data?.data?.length || 0;
      const totalManagers = managersRes.data?.length || 0;
      const totalEmployees = employeesRes.data?.length || 0;
      const totalDepartments = uniqueDepartments?.length || 0;

      setTaskStats([
        { title: "Total Teams", count: totalTeams },
        { title: "Total Managers", count: totalManagers },
        { title: "Total Employees", count: totalEmployees },
        { title: "Total Departments", count: totalDepartments },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard stats", error);
    }
  };
  const fetchTeams = async () => {
    try {
      const user = await fetchUser();
      const res = await axios.get(
        `https://server-backend-nu.vercel.app/api/teams/createdBy/${user._id}`
      );

      setAllTeams(res.data.data || []);
      console.log("Teams created by me:", res.data.data);
    } catch (error) {
      console.error(
        "ERROR FETCHING Teams:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    const fetchAddTaskRequiredDetails = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        console.log("token is " + token);
        const res = await axios.get("https://server-backend-nu.vercel.app/getAllDepartments");
        const user = await fetchUser();
        const empRes = await axios.get(
          `https://server-backend-nu.vercel.app/employees/manager/${user._id}`
        );
        const projectRes = await axios.get(
          `https://server-backend-nu.vercel.app/api/projects/manager/${user._id}`
        );
        const departments = res.data.departments;
        const employeesNames = empRes.data.employees;
        const projectNames = projectRes.data.data;
        const normalizedDepartments = departments.map((d) =>
          normalizeDepartment(d)
        );
        const uniqueDepartments = [...new Set(normalizedDepartments)];
        setProjects(projectNames);
        setDepartment(uniqueDepartments);
        setEmployees(employeesNames);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAddTaskRequiredDetails();
    fetchTeams();
    fetchDashboardStats();
    setFilteredTeams(allTeams);
  }, []);
  useEffect(() => {
    setFilteredTeams(allTeams);
  }, [allTeams]);
  // ---------- Stat Cards Data ----------

  console.log("all teams from use effect", allTeams);
  const validateTeamForm = () => {
    const errors = {};

    if (!newTeam.name || !newTeam.name.trim()) {
      errors.name = "Team name is required";
    }

    if (!newTeam.project) {
      errors.project = "Project is required";
    }

    if (!newTeam.department) {
      errors.department = "Department is required";
    }

    if (!newTeam.assignToProject || newTeam.assignToProject.length === 0) {
      errors.assignToProject = "Please assign at least one employee";
    }

    setTeamErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleAddTeam(e) {
    try {
      const user = await fetchUser();

      if (!user || !user._id) {
        alert("User not found");
        return;
      }
      const payload = {
        name: newTeam.name,
        project: newTeam.project,
        department: newTeam.department,
        assignToProject: newTeam.assignToProject,
        createdBy: user._id,
      };
      let res;
      if (editTaskId) {
        res = await axios.put(
          `https://server-backend-nu.vercel.app/api/teams/${editTaskId}`,
          payload,
          { headers: { "Content-Type": "application/json" } }
        );
        await fetchTeams();
      } else {
        const res = await axios.post(
          "https://server-backend-nu.vercel.app/api/teams",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        await fetchTeams();
      }

      // setAllTeams((prev) => [...prev, res.data.data]);
      setFilteredTeams(allTeams);
      setShowAddTeam(false);

      if (!editTaskId) {
        const lastPage = Math.ceil(allTeams.length / itemsPerPage);
        setCurrentPage(lastPage);
      }

      setShowAddTeam(false);
      setNewTeam({
        name: "",
        project: "",
        department: "",
        assignToProject: [],
      });
      alert(editTaskId ? "Team updated" : "Team created");
      setEditTaskId(null);
    } catch (error) {
      console.error("Submit failed:", error.response?.data || error.message);
      alert("Operation failed");
    }
  }
  const handleAddTeamSubmit = (e) => {
    e.preventDefault();

    if (!validateTeamForm()) return;

    handleAddTeam();
  };

  const resetAddTeamForm = () => {
    setNewTeam({
      name: "",
      project: "",
      department: "",
      assignToProject: [],
    });

    setTeamErrors({});
    setIsOpen(false);
    setEditTaskId(null);
  };

  const updateStats = (teams) => {
    const departments = [...new Set(teams.map((team) => team.department))];
    const totalMembers = teams.reduce(
      (sum, team) => sum + team.totalMembers,
      0
    );
    setTaskStats([
      { title: "Total Teams", count: teams?.length || 0 },
      { title: "Total Managers", count: Math.ceil(teams.length * 2.5) },
      {
        title: "Total Employees",
        count: totalMembers + Math.ceil(teams.length * 3),
      },
      { title: "Total Departments", count: departments.length },
    ]);
  };
  //

  // ================= FILTER LOGIC =================
  const applyFilters = () => {
    if (!searchQuery.trim()) {
      setFilteredTeams(allTeams);
      setCurrentPage(1);
      return;
    }

    const query = searchQuery.toLowerCase();

    const result = allTeams.filter((team) => {
      return (
        team?.name?.toLowerCase().includes(query) ||
        team?.department?.toLowerCase().includes(query) ||
        String(team?.assignToProject?.length || "").includes(query)
      );
    });

    setFilteredTeams(result);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilteredTeams(allTeams);
    setCurrentPage(1);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };
  console.log("filtered teams", filteredTeams);
  // Pagination logic
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const indexOfLastItem = Math.min(
    currentPage * itemsPerPage,
    filteredTeams.length
  );
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentTeams = filteredTeams.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleRowClick = (team) => {
    setSelectedTeam(team);
  };
  console.log("current teams", currentTeams);
  const handleDeleteTeam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axios.delete(`https://server-backend-nu.vercel.app/api/teams/${id}`);
      setAllTeams((prev) => prev.filter((t) => t._id !== id));
      setFilteredTeams((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      alert("Failed to delete task");
      console.log("error", error.message);
    }
  };
  const handleEditTeam = (team) => {
    console.log("team from edit", team);
    setEditMode(true);
    setEditTaskId(team._id);
    setShowAddTeam(true);

    setNewTeam({
      name: team.name || "",
      project: team.project?._id || team.project?.name || "",
      assignToProject: Array.isArray(team.assignToProject)
        ? team.assignToProject.map((emp) => emp._id) // array of employee IDs
        : [],
      department: team.department || "",
    });
  };

  const statCardColors = ["#D1ECF1", "#FFB3B3", "#FFE493", "#D7F5E4"];
  //added by aditya
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (assignRef.current && !assignRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="container-fluid ">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: "#3A5FBE", fontSize: "25px", marginLeft: "15px" }}>
          Teams
        </h2>

        <button
          className="btn btn-sm custom-outline-btn"
          onClick={() => {
            setNewTeam({
              name: "",
              project: "",
              department: "",
              assignToProject: [],
            });
            setShowAddTeam(true);
          }}
        >
          + Create New Team
        </button>
      </div>

      {/* Stat Cards */}

      <div className="row g-3 mb-4">
        {taskStats.map((task, i) => (
          <div className="col-12 col-md-3" key={i}>
            <div className="card shadow-sm h-100 border-0">
              <div
                className="card-body d-flex align-items-center"
                style={{ gap: "20px" }}
              >
                <h4
                  className="mb-0"
                  style={{
                    fontSize: "32px",
                    backgroundColor: statCardColors[i],
                    padding: "15px",
                    textAlign: "center",
                    minWidth: "70px",
                    minHeight: "70px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    color: "#3A5FBE",
                  }}
                >
                  {task.count}
                </h4>
                <p
                  className="mb-0 fw-semibold"
                  style={{ fontSize: "18px", color: "#3A5FBE" }}
                >
                  {task.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      {/* ================= FILTER ================= */}
      <div className="card mb-4 shadow-sm border-0">
        <div className="card-body">
          <form
            className="row g-2 align-items-center"
            onSubmit={handleFilterSubmit}
            style={{ justifyContent: "space-between" }}
          >
            <div className="col-12 col-md-auto d-flex align-items-center gap-2">
              <label
                className="fw-bold mb-0"
                style={{ color: "#3A5FBE", width: 60 }}
              >
                Search
              </label>
              <input
                className="form-control"
                style={{ minWidth: 300 }}
                placeholder="Search by any field..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
            </div>

            <div className="col-auto ms-auto d-flex gap-2">
              <button className="btn btn-sm custom-outline-btn">Filter</button>
              <button
                type="button"
                className="btn btn-sm custom-outline-btn"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
      {showAddTeam && (
        <div
          className="modal fade show"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            inset: 0,
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleAddTeamSubmit}>
                <div
                  className="modal-header"
                  style={{ background: "#3A5FBE", color: "#fff" }}
                >
                  <h5 className="modal-title">
                    {editTaskId ? "Edit Team" : "Add Team"}
                  </h5>

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => {
                      resetAddTeamForm();
                      setShowAddTeam(false);
                    }}
                  />
                </div>

                <div
                  className="modal-body"
                  style={{
                    maxHeight: "70vh", // controls popup height
                    overflowY: "auto", // enables scroll
                  }}
                >
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Team Name</label>
                      <input
                        name="name"
                        className="form-control"
                        placeholder="Enter team Name"
                        value={newTeam.name}
                        disabled={userRole !== "manager"}
                        onChange={(e) => {
                          setNewTeam({ ...newTeam, name: e.target.value });
                          if (teamErrors.name)
                            setTeamErrors({ ...teamErrors, name: "" });
                        }}
                      />
                      {teamErrors.name && (
                        <small className="text-danger">{teamErrors.name}</small>
                      )}
                    </div>

                    {/* Project */}
                    <div className="col-md-6">
                      <label className="form-label">Project</label>
                      <select
                        name="project"
                        className="form-select"
                        value={newTeam.project}
                        onChange={(e) => {
                          setNewTeam({ ...newTeam, project: e.target.value });
                          if (teamErrors.project)
                            setTeamErrors({ ...teamErrors, project: "" });
                        }}
                      >
                        <option value="">Select Project</option>
                        {projects.map((pro) => (
                          <option key={pro._id} value={pro._id}>
                            {pro.name}
                          </option>
                        ))}
                      </select>
                      {teamErrors.project && (
                        <small className="text-danger">
                          {teamErrors.project}
                        </small>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <select
                        name="department"
                        className="form-select"
                        value={newTeam.department}
                        onChange={(e) => {
                          setNewTeam({
                            ...newTeam,
                            department: e.target.value,
                          });
                          if (teamErrors.department)
                            setTeamErrors({ ...teamErrors, department: "" });
                        }}
                      >
                        <option value="">Select Department</option>
                        {department.map((dept, index) => (
                          <option key={index} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                      {teamErrors.department && (
                        <small className="text-danger">
                          {teamErrors.department}
                        </small>
                      )}
                    </div>

                    <div
                      className="col-md-6 position-relative"
                      ref={assignRef}
                      style={{ position: "relative" }} // added  by aditya
                    >
                      <label className="form-label">Assign To</label>
                      {/* Dropdown Header */}
                      <div
                        className="form-control d-flex justify-content-between align-items-center"
                        style={{ cursor: "pointer" }}
                        onClick={() => setIsOpen(!isOpen)}
                      >
                        <span>
                          {newTeam.assignToProject.length > 0
                            ? `${newTeam.assignToProject.length} employee(s) selected`
                            : "Select Employees"}
                        </span>
                        <span>▾</span>
                      </div>

                      {/* Dropdown Menu */}
                      {/* Dropdown Menu */}
                      {isOpen && (
                        <div
                          className="border rounded mt-1 p-2 bg-white"
                          style={{
                            maxHeight: "200px",
                            overflowY: "auto",
                            position: "absolute",
                            width: "100%",
                            zIndex: 1000,
                          }}
                        >
                          {employees.map((emp) => (
                            <div key={emp._id} className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={emp._id}
                                checked={newTeam.assignToProject.includes(
                                  emp._id
                                )}
                                onChange={(e) => {
                                  const updatedList = e.target.checked
                                    ? [...newTeam.assignToProject, emp._id]
                                    : newTeam.assignToProject.filter(
                                        (id) => id !== emp._id
                                      );

                                  setNewTeam({
                                    ...newTeam,
                                    assignToProject: updatedList,
                                  });

                                  if (teamErrors.assignToProject) {
                                    setTeamErrors({
                                      ...teamErrors,
                                      assignToProject: "",
                                    });
                                  }
                                }}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={emp._id}
                              >
                                {emp.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      {teamErrors.assignToProject && (
                        <small className="text-danger">
                          {teamErrors.assignToProject}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-sm custom-outline-btn"
                      style={{ minWidth: "90px" }}
                      onClick={() => {
                        setShowAddTeam(false);
                        setEditTaskId(null);
                        resetAddTeamForm();
                      }}
                    >
                      Cancel
                    </button>

                    {userRole === "manager" && (
                      <button
                        type="submit"
                        className="btn btn-sm custom-outline-btn"
                        style={{ minWidth: "90px" }}
                      >
                        {editTaskId ? "Save Changes" : "Save Team"}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Teams Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive bg-white">
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
                    whiteSpace: "nowrap",
                  }}
                >
                  Team Name
                </th>
                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Project Name
                </th>

                {/* <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Team Lead</th> */}
                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Department
                </th>
                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Members Name
                </th>

                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Total Members
                </th>
                <th
                  style={{
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#6c757d",
                    borderBottom: "2px solid #dee2e6",
                    padding: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTeams.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-4"
                    style={{ color: "#212529" }}
                  >
                    No teams found.
                  </td>
                </tr>
              ) : (
                currentTeams.map((team) => (
                  <tr
                    key={team._id}
                    onClick={() => handleRowClick(team)}
                    style={{ cursor: "pointer" }}
                  >
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                        color: "#212529",
                      }}
                    >
                      <h6 className="mb-0 fw-normal">{team?.name || "-"}</h6>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                        color: "#212529",
                      }}
                    >
                      <span className="fw-normal">
                        {team?.project?.name || "-"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                        color: "#212529",
                      }}
                    >
                      <span className="fw-normal">
                        {team?.department || "-"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                        color: "#212529",
                      }}
                    >
                      <span className="fw-normal">
                        {team?.assignToProject?.length > 0
                          ? team.assignToProject
                              .map((emp) => emp.name)
                              .join(", ")
                          : "NA"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                        color: "#212529",
                      }}
                    >
                      <span className="fw-normal">
                        {team?.assignToProject?.length || 0}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {userRole === "manager" && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm custom-outline-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTeam(team);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTeam(team._id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
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
            {filteredTeams.length === 0
              ? "0–0 of 0"
              : `${indexOfFirstItem + 1}-${indexOfLastItem} of ${
                  filteredTeams.length
                }`}
          </span>

          <div
            className="d-flex align-items-center"
            style={{ marginLeft: "16px" }}
          >
            <button
              className="btn btn-sm border-0"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ fontSize: "18px", padding: "2px 8px", color: "#212529" }}
            >
              ‹
            </button>
            <button
              className="btn btn-sm border-0"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ fontSize: "18px", padding: "2px 8px", color: "#212529" }}
            >
              ›
            </button>
          </div>
        </div>
      </nav>

      {/* Team Detail Modal */}
      {selectedTeam && (
        <div
          className="modal fade show"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            position: "fixed",
            inset: 0,
            zIndex: 1050,
          }}
        >
          <div
            className="modal-dialog modal-dialog-scrollable"
            style={{ maxWidth: "650px", width: "95%", marginTop: "200px" }}
          >
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: "#3A5FBE" }}
              >
                <h5 className="modal-title mb-0">Team Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedTeam(null)}
                />
              </div>

              <div className="modal-body">
                <div className="container-fluid">
                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Team Name
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      {selectedTeam?.name || ""}
                    </div>
                  </div>

                  {/* <div className="row mb-2">
                    <div className="col-5 col-sm-3 fw-semibold" style={{ color: "#212529" }}>Team Lead</div>
                    <div className="col-7 col-sm-9" style={{ color: "#212529" }}>{selectedTeam.teamLead}</div>
                  </div> */}
                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Project Name
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      {selectedTeam?.project?.name || ""}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Total Members
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      {selectedTeam?.assignToProject?.length || 0}
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Team Members
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      {selectedTeam?.assignToProject?.length > 0
                        ? selectedTeam.assignToProject.map((emp) => (
                            <div key={emp._id}>{emp.name}</div>
                          ))
                        : "NA"}
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div
                      className="col-5 col-sm-3 fw-semibold"
                      style={{ color: "#212529" }}
                    >
                      Department
                    </div>
                    <div
                      className="col-7 col-sm-9"
                      style={{ color: "#212529" }}
                    >
                      {selectedTeam?.department || ""}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  className="btn btn-sm custom-outline-btn"
                  style={{ minWidth: 90 }}
                  onClick={() => {
                    setSelectedTeam(null);
                    handleEditTeam(selectedTeam);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm custom-outline-btn"
                  style={{ minWidth: 90 }}
                  onClick={() => setSelectedTeam(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
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
const tdStyle = {
  padding: "12px",
  verticalAlign: "middle",
  fontSize: "14px",
  borderBottom: "1px solid #dee2e6",
  whiteSpace: "nowrap",
};

export default ManagerTeamsTMS;
