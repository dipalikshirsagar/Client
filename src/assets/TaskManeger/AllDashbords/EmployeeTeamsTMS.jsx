import React, { useState, useEffect } from "react";

const EmployeeTeamsTMS = ({ user }) => {

  // ---------- Stat Cards Data ----------
  const initialTaskStats = [
    { title: "Total Teams", color: "#D1ECF1" },
    { title: "Total Managers", color: "#FFB3B3" },
    { title: "Total Employees", color: "#FFE493" },
    { title: "Total Departments", color: "#D7F5E4" },
  ];

  // ---------- Teams Table Data ----------
  const initialTeamsData = [
    //   { _id: 1, teamName: "Frontend Team", teamLead: "Amit Sharma", totalMembers: 6, department: "UI/UX" },
    //   { _id: 2, teamName: "Backend Team", teamLead: "Rohit Deshmukh", totalMembers: 5, department: "Development" },
    //   { _id: 3, teamName: "Design Team", teamLead: "Neha Joshi", totalMembers: 4, department: "Creative" },
    //   { _id: 4, teamName: "QA Team", teamLead: "Sneha Patil", totalMembers: 3, department: "Testing" },
    //   { _id: 5, teamName: "DevOps Team", teamLead: "Rajesh Kumar", totalMembers: 4, department: "Operations" },
    //   { _id: 6, teamName: "Mobile Team", teamLead: "Anita Singh", totalMembers: 5, department: "Development" },
    //   { _id: 7, teamName: "Support Team", teamLead: "Karan Verma", totalMembers: 6, department: "Customer Support" },
    //   { _id: 8, teamName: "Marketing Team", teamLead: "Riya Sharma", totalMembers: 4, department: "Marketing" },
  ];

  const [allTeams, setAllTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [taskStats, setTaskStats] = useState(initialTaskStats);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    console.log("useEffect runs. User is:", user);

    if (!user || !user._id) {
      console.log("No user or user._id found. Skipping API fetch.");
      return;
    }

    fetch(`https://server-backend-nu.vercel.app/api/teams/employee/${user._id}/teams`)
      .then(res => res.json())
      .then(response => {
        console.log("API response received:", response);

        if (response.success) {
          const teams = response.data.map(team => ({
            _id: team._id,
            teamName: team.name,
            teamLead:
              Array.isArray(team.project?.managers) && team.project.managers.length
                ? team.project.managers.map(m => m.name).join(", ")
                : "N/A",
            totalMembers: team.assignToProject?.length || 0,
            assignToProject: team.assignToProject || [],
            department: team.department,
          }));

          setAllTeams(teams);
          setFilteredTeams(teams);
          updateStats(teams);
        } else {
          console.log("API response success = false");
        }
      })
      .catch(error => console.error("API Error:", error));
  }, [user]);










  const applyFilters = () => {
    let temp = [...allTeams];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      temp = temp.filter((team) => {
        return (
          team.teamName.toLowerCase().includes(query) ||
          team.teamLead.toLowerCase().includes(query) ||
          team.department.toLowerCase().includes(query) ||
          team.totalMembers.toString().includes(query)
        );
      });
    } else {
      temp = [...allTeams];
    }

    setFilteredTeams(temp);
    setCurrentPage(1);

    // Update stats based on filtered results
    updateStats(temp);
  };

  const updateStats = (teams) => {
    const departments = [...new Set(teams.map(team => team.department))];
    const totalMembers = teams.reduce((sum, team) => sum + team.totalMembers, 0);


    //added by Mrudal Color code changes
    setTaskStats([
      { title: "Total Teams", count: teams.length, color: "#D1ECF1" },
      { title: "Total Managers", count: Math.ceil(teams.length * 2.5), color: "#D7F5E4" },
      { title: "Total Employees", count: totalMembers + Math.ceil(teams.length * 3), color: "#FFE493" },
      { title: "Total Departments", count: departments.length, color: "#FFB3B3" }
    ]);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilteredTeams([...allTeams]);
    setTaskStats(initialTaskStats);
    setCurrentPage(1);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, filteredTeams.length);
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

  return (
    <div className="container-fluid" >
      <h2 style={{ color: "#3A5FBE", fontSize: "25px" }}>Teams</h2>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {taskStats.map((task, i) => (
          <div className="col-12 col-md-3" key={i}>
            <div
              className="p-3 rounded shadow-sm border-0"
              style={{
                backgroundColor: "#fff",
                height: "100%",
              }}
            >
              <div
                className="d-flex align-items-center"
                style={{ gap: "16px" }}
              >

                <h4
                  className="mb-0"
                  style={{
                    fontSize: "32px",
                    backgroundColor: task.color,
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

                {/* Title */}
                <p
                  className="mb-0 fw-semibold"
                  style={{
                    fontSize: "18px",
                    color: "#3A5FBE",
                    textAlign: "left",
                  }}
                >
                  {task.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      <div className="card mb-4 shadow-sm border-0">
        <div className="card-body">
          <form
            className="row g-2 align-items-center"
            onSubmit={handleFilterSubmit}
            style={{ justifyContent: "space-between" }}
          >
            {/* Search Input - Search by any field */}
            <div className="col-12 col-md-auto d-flex align-items-center gap-2 mb-1">
              <label htmlFor="searchQuery" className="fw-bold mb-0" style={{ fontSize: "16px", color: "#3A5FBE", width: "60px" }}>Search</label>
              <input
                id="searchQuery"
                type="text"
                className="form-control"
                placeholder="Search by any field..."
                style={{ minWidth: 300 }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
            </div>

            {/* Filter and Reset Buttons */}
            <div className="col-auto ms-auto d-flex gap-2">
              <button
                type="submit"
                style={{ minWidth: 90 }}
                className="btn btn-sm custom-outline-btn"
              >
                Filter
              </button>
              <button
                type="button"
                style={{ minWidth: 90 }}
                className="btn btn-sm custom-outline-btn"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Teams Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive bg-white">
          <table className="table table-hover mb-0">
            <thead style={{ backgroundColor: "#ffffffff" }}>
              <tr>
                <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Team Name</th>
                <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Team Lead</th>
                <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Total Members</th>
                <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Department</th>
              </tr>
            </thead>
            <tbody>
              {currentTeams.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4" style={{ color: "#212529" }}>
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
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap', color: "#212529" }}>
                      <h6 className="mb-0 fw-normal">{team.teamName}</h6>
                    </td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap', color: "#212529" }}>
                      <span className="fw-normal">{team.teamLead}</span>
                    </td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap', color: "#212529" }}>
                      <span className="fw-normal">{team.totalMembers}</span>
                    </td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap', color: "#212529" }}>
                      <span className="fw-normal">{team.department}</span>
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
            <span style={{ fontSize: "14px", marginRight: "8px", color: "#212529" }}>Rows per page:</span>
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

          <span style={{ fontSize: "14px", marginLeft: "16px", color: "#212529" }}>
            {filteredTeams.length === 0
              ? "0–0 of 0"
              : `${indexOfFirstItem + 1}-${indexOfLastItem} of ${filteredTeams.length}`}
          </span>

          <div className="d-flex align-items-center" style={{ marginLeft: "16px" }}>
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
          onClick={() => setSelectedTeam(null)}
        >
          <div className="modal-dialog modal-dialog-scrollable"
            style={{ maxWidth: "650px", width: "95%", marginTop: "200px" }}>
            <div className="modal-content">
              <div className="modal-header text-white" style={{ backgroundColor: "#3A5FBE" }}>
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
                    <div className="col-5 col-sm-3 fw-semibold" style={{ color: "#212529" }}>Team Name</div>
                    <div className="col-7 col-sm-9" style={{ color: "#212529" }}>{selectedTeam.teamName}</div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-5 col-sm-3 fw-semibold" style={{ color: "#212529" }}>Team Lead</div>
                    <div className="col-7 col-sm-9" style={{ color: "#212529" }}>{selectedTeam.teamLead}</div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-5 col-sm-3 fw-semibold" style={{ color: "#212529" }}>Total Members</div>
                    <div className="col-7 col-sm-9" style={{ color: "#212529" }}>{selectedTeam.totalMembers}</div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-5 col-sm-3 fw-semibold" style={{ color: "#212529" }}>
                      Team Members
                    </div>
                    <div className="col-7 col-sm-9" style={{ color: "#212529" }}>
                      {selectedTeam.assignToProject?.length > 0 ? (
                        selectedTeam.assignToProject.map((emp) => (
                          <div key={emp._id}>
                            {emp.name}
                          </div>
                        ))
                      ) : (
                        "NA"
                      )}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-5 col-sm-3 fw-semibold" style={{ color: "#212529" }}>Department</div>
                    <div className="col-7 col-sm-9" style={{ color: "#212529" }}>{selectedTeam.department}</div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  className="btn btn-sm custom-outline-btn"
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

export default EmployeeTeamsTMS;