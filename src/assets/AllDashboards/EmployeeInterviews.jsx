import React, { useState } from "react";
import { useParams } from "react-router-dom";

const EmployeeInterviews = () => {
  const { username } = useParams(); // logged-in employee
  const [allInterviews, setAllInterviews] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [selected, setSelected] = useState(null);

  // ===== FILTER STATES =====
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  // ===== PAGINATION STATES =====
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleView = () => {
    const all = JSON.parse(localStorage.getItem("scheduledInterviews")) || [];
    const filtered = all.filter((item) => item.employeeName === username);

    setAllInterviews(filtered);
    setInterviews(filtered);
    setShowTable(true);
    setCurrentPage(1);
  };

  // ===== APPLY FILTERS =====
  const applyFilters = () => {
    let filtered = [...allInterviews];

    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (item) =>
          item.status &&
          item.status.toLowerCase().trim() ===
          statusFilter.toLowerCase().trim()
      );
    }

    if (dateFromFilter) {
      filtered = filtered.filter(
        (item) => new Date(item.date) >= new Date(dateFromFilter)
      );
    }

    if (dateToFilter) {
      filtered = filtered.filter(
        (item) => new Date(item.date) <= new Date(dateToFilter)
      );
    }

    setInterviews(filtered);
    setCurrentPage(1);
  };

  // ===== RESET =====
  const resetFilters = () => {
    setStatusFilter("All");
    setDateFromFilter("");
    setDateToFilter("");
    setInterviews(allInterviews);
    setCurrentPage(1);
  };

  // ===== PAGINATION LOGIC =====
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInterviews = interviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(interviews.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          style={{
            color: "#3A5FBE",
            fontSize: "25px",
            marginLeft: "15px",
            marginBottom: "0",
          }}
        >
          My Scheduled Interviews
        </h2>

        <button
          className="btn btn-sm custom-outline-btn mb-3"
          onClick={handleView}
        >
          View Scheduled Interviews
        </button>
      </div>

      {/* ================= FILTER CARD ================= */}
      {showTable && (
        <div className="card mb-4 mt-3 shadow-sm border-0">
          <div className="card-body">
            <form
              className="row g-2 align-items-center"
              onSubmit={(e) => {
                e.preventDefault();
                applyFilters();
              }}
            >
              {/* STATUS */}
              <div className="col-12 col-md-auto d-flex align-items-center gap-2 mb-1 ms-2">
                <label
                  htmlFor="statusFilter"
                  className="fw-bold mb-0 text-start text-md-end"
                  style={{ fontSize: "16px", color: "#3A5FBE" }}
                >
                  Status
                </label>
                <select
                  id="statusFilter"
                  className="form-select"
                  style={{ minWidth: 100 }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="On-going">On-going</option>
                  <option value="Completed">Completed</option>
                  <option value="Not-completed">Not-completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* FROM */}
              <div className="col-12 col-md-auto d-flex align-items-center mb-1 ms-2">
                <label
                  htmlFor="dateFromFilter"
                  className="fw-bold mb-0 text-start text-md-end"
                  style={{
                    fontSize: "16px",
                    color: "#3A5FBE",
                    width: "50px",
                    minWidth: "50px",
                    marginRight: "8px",
                  }}
                >
                  From
                </label>
                <input
                  id="dateFromFilter"
                  type="date"
                  className="form-control"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  style={{ minWidth: "140px" }}
                />
              </div>

              {/* TO */}
              <div className="col-12 col-md-auto d-flex align-items-center mb-1 ms-2">
                <label
                  htmlFor="dateToFilter"
                  className="fw-bold mb-0 text-start text-md-end"
                  style={{
                    fontSize: "16px",
                    color: "#3A5FBE",
                    minWidth: "50px",
                    marginRight: "8px",
                  }}
                >
                  To
                </label>
                <input
                  id="dateToFilter"
                  type="date"
                  className="form-control"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  style={{ minWidth: "140px" }}
                />
              </div>

              {/* BUTTONS */}
              <div className="col-auto ms-auto d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-sm custom-outline-btn"
                  style={{ minWidth: 90 }}
                >
                  Filter
                </button>
                <button
                  type="button"
                  className="btn btn-sm custom-outline-btn"
                  style={{ minWidth: 90 }}
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TABLE ================= */}
      {showTable && (
        <>
          <div
            className="table-responsive mt-3"
            style={{
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              borderRadius: "8px",
            }}
          >
            <table className="table table-hover align-middle mb-0 bg-white">
              <thead style={{ backgroundColor: "#ffffff" }}>
                <tr>
                  {[
                    "Interview ID",
                    "Candidate",
                    "Email",
                    "Role",
                    "Date",
                    "Time",
                    "Type",
                    "Interviewer",
                    "Link",
                    "Status",
                  ].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {currentInterviews.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4" style={{ color: "#6c757d" }}>
                      No interviews scheduled.
                    </td>
                  </tr>
                ) : (
                  currentInterviews.map((item, i) => (
                    <tr key={i} onClick={() => setSelected(item)} style={{ cursor: "pointer" }}>
                      <td style={tdStyle("#3A5FBE", 500)}>
                        <a
                          href="#"
                          className="text-primary text-decoration-underline"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelected(item);
                          }}
                        >
                          {item.interviewId}
                        </a>
                      </td>
                      <td style={tdStyle()}>{item.candidateName}</td>
                      <td style={tdStyle()}>{item.email}</td>
                      <td style={tdStyle()}>{item.role}</td>
                      <td style={tdStyle()}>{item.date}</td>
                      <td style={tdStyle()}>{item.time}</td>
                      <td style={tdStyle()}>{item.interviewType}</td>
                      <td style={tdStyle()}>{item.interviewer}</td>
                      <td style={tdStyle()}>
                        {item.link ? (
                          <a href={item.link} target="_blank" rel="noreferrer">
                            Join
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={tdStyle()}>
                        <span
                          style={{
                            backgroundColor:
                              item.status === "Completed"
                                ? "#d1f2dd"
                                : item.status === "Cancelled"
                                  ? "#f8d7da"
                                  : "#FFE493",
                            padding: "8px 16px",
                            borderRadius: "4px",
                            fontSize: "13px",
                            fontWeight: 500,
                            display: "inline-block",
                            width: "100px",
                            textAlign: "center",
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ===== PAGINATION UI ===== */}
          <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <span style={{ fontSize: "14px", marginRight: "8px" }}>
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

              <span style={{ fontSize: "14px", marginLeft: "16px" }}>
                {interviews.length === 0
                  ? "0–0 of 0"
                  : `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, interviews.length)} of ${interviews.length}`}
              </span>

              <div className="d-flex align-items-center" style={{ marginLeft: "16px" }}>
                <button
                  className="btn btn-sm border-0"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{ fontSize: "18px", padding: "2px 8px" }}
                >
                  ‹
                </button>
                <button
                  className="btn btn-sm border-0"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{ fontSize: "18px", padding: "2px 8px" }}
                >
                  ›
                </button>
              </div>
            </div>
          </nav>
        </>
      )}


      {/* ================= MODAL ================= */}
      {selected && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-scrollable" style={{ maxWidth: "650px", marginTop: "60px" }}>
            <div className="modal-content">
              <div className="modal-header text-white" style={{ backgroundColor: "#3A5FBE" }}>
                <h5 className="modal-title mb-0">Interview Details</h5>
                <button className="btn-close btn-close-white" onClick={() => setSelected(null)} />
              </div>

              <div className="modal-body">
                {Object.entries({
                  "Interview ID": selected.interviewId,
                  Candidate: selected.candidateName,
                  Email: selected.email,
                  Role: selected.role,
                  Date: selected.date,
                  Time: selected.time,
                  Type: selected.interviewType,
                  Interviewer: selected.interviewer,
                }).map(([k, v]) => (
                  <div className="row mb-2" key={k}>
                    <div className="col-4 fw-semibold">{k}</div>
                    <div className="col-8">{v}</div>
                  </div>
                ))}

                <div className="row mb-2">
                  <div className="col-4 fw-semibold">Status</div>
                  <div className="col-8">
                    <span
                      className={
                        "badge text-capitalize " +
                        (selected.status === "Completed"
                          ? "bg-success"
                          : selected.status === "Cancelled"
                            ? "bg-danger"
                            : "bg-warning text-dark")
                      }
                      style={{ padding: "8px 16px", fontSize: "13px", fontWeight: 500, borderRadius: "4px" }}
                    >
                      {selected.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button className="btn custom-outline-btn" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== COMMON BUTTON STYLE ===== */}
      <style>{`
        .custom-outline-btn {
          border: 1px solid #3A5FBE;
          color: #3A5FBE;
          background: transparent;
        }
        .custom-outline-btn:hover {
          background: #3A5FBE;
          color: #fff;
        }
      `}</style>
    </div>
  );
};

const thStyle = {
  fontWeight: 500,
  fontSize: "14px",
  color: "#6c757d",
  borderBottom: "2px solid #dee2e6",
  padding: "12px",
  whiteSpace: "nowrap",
};

const tdStyle = (color = "#212529", weight = 400) => ({
  padding: "12px",
  fontSize: "14px",
  borderBottom: "1px solid #dee2e6",
  whiteSpace: "nowrap",
  color,
  fontWeight: weight,
});

export default EmployeeInterviews;
