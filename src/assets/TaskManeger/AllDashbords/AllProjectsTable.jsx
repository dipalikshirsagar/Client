import React, { useEffect, useMemo, useState } from "react";

function getStatusStyle(status) {
  if (status === "Completed") {
    return { backgroundColor: "#d1f2dd", color: "#0f5132" };
  } else if (status === "Active") {
    return { backgroundColor: "#d1e7ff", color: "#0d6efd" };
  } else {
    return { backgroundColor: "#e2e3e5", color: "#495057" };
  }
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AllProjectsTable({ projects, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projPage, setProjPage] = useState(1);
  const [projRows, setProjRows] = useState(5);

  useEffect(() => setProjPage(1), [searchQuery, statusFilter]);

  const filteredProjects = useMemo(() => {
    let result = projects;

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (proj) =>
          proj.name.toLowerCase().includes(query) ||
          proj.managerName.toLowerCase().includes(query) ||
          proj.status.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      result = result.filter((proj) => proj.status === statusFilter);
    }

    return result;
  }, [projects, searchQuery, statusFilter]);

  const paginatedProjects = useMemo(() => {
    const start = (projPage - 1) * projRows;
    return filteredProjects.slice(start, start + projRows);
  }, [filteredProjects, projPage, projRows]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / projRows));
  const indexOfLastItem = projPage * projRows;
  const indexOfFirstItem = indexOfLastItem - projRows;
  const from = filteredProjects.length === 0 ? 0 : indexOfFirstItem + 1;
  const to = Math.min(indexOfLastItem, filteredProjects.length);
  const goTo = (p) => setProjPage(Math.min(Math.max(p, 1), totalPages));
  const isPrevDisabled = projPage <= 1 || filteredProjects.length === 0;
  const isNextDisabled = projPage >= totalPages || filteredProjects.length === 0;

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setProjPage(1);
  };

  return (
    <>
      {/* Title outside table with Close button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-semibold" style={{ color: "#3A5FBE", fontSize: "20px" }}>
          All Projects
        </h5>
        <button className="btn btn-sm custom-outline-btn" onClick={onClose}>
          Close
        </button>
      </div>

      {/* Filter Section with inline layout */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body p-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            {/* Search Label and Input inline */}
            <div className="d-flex align-items-center gap-2" style={{ minWidth: "300px" }}>
              <label className="mb-0 fw-bold" style={{ fontSize: 14, color: "#3A5FBE", whiteSpace: "nowrap" }}>
                Search
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by any field..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>

            {/* Status Label and Select inline */}
            <div className="d-flex align-items-center gap-2" style={{ minWidth: "250px" }}>
              <label className="mb-0 fw-bold" style={{ fontSize: 14, color: "#3A5FBE", whiteSpace: "nowrap" }}>
                Status
              </label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Filter and Reset buttons at the end */}
            <div className="d-flex gap-2 ms-auto">
              <button className="btn btn-sm custom-outline-btn" onClick={() => setProjPage(1)}>
                Filter
              </button>
              <button className="btn btn-sm custom-outline-btn" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card without header */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body p-0">
          <div className="table-responsive bg-white">
          <table className="table table-hover mb-0">
            <thead style={{ backgroundColor: "#ffffffff" }}>
              <tr>
                <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>
                  Project Name
                </th>
                <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>
                  Status
                </th>
                <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>
                  Manager
                </th>
                <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>
                  Delivery Date
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.length > 0 ? (
                paginatedProjects.map((proj) => (
                  <tr key={proj.id}>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap', color: "#212529" }}>
                      {proj.name}
                    </td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap', color: "#212529" }}>
                      <span
                        // style={{
                        //   ...getStatusStyle(proj.status),
                        //   padding: "6px 12px",
                        //   borderRadius: "6px",
                        //   fontSize: "13px",
                        //   fontWeight: "500",
                        // }}
                      >
                        {proj.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap', color: "#212529" }}>
                      {proj.managerName}
                    </td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap', color: "#212529" }}>
                      {formatDate(proj.deliveryDate)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-3 text-muted">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Inline Pagination */}
      <div className="d-flex justify-content-end mt-3">
        <nav className="d-flex align-items-center justify-content-end text-muted">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center">
              <span style={{ fontSize: "14px", marginRight: "8px", color: "#212529" }}>
                Rows per page:
              </span>
              <select
                className="form-select form-select-sm"
                style={{ width: "auto", fontSize: "14px" }}
                value={projRows}
                onChange={(e) => {
                  setProjRows(Number(e.target.value));
                  setProjPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>

            <span style={{ fontSize: "14px", marginLeft: "16px", color: "#212529" }}>
              {from}-{to} of {filteredProjects.length}
            </span>

            <div className="d-flex align-items-center" style={{ marginLeft: "16px" }}>
              <button
                className="btn btn-sm border-0"
                type="button"
                onClick={() => goTo(projPage - 1)}
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
                onClick={() => goTo(projPage + 1)}
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
      </div>
    </>
  );
}

export default AllProjectsTable;
