import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://server-backend-nu.vercel.app/api/projects";

export default function MangerProjectTMS() {
  const [cardCounts, setCardCounts] = useState({
    total: 0,
    ongoing: 0,
    delayed: 0,
    assigned: 0,
  });
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState("");
  const [projectData, setProjectData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [managerList, setManagerList] = useState([]);
  const [errors, setErrors] = useState({});

  const [commentModalProject, setCommentModalProject] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [projectComments, setProjectComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);

  const userRole = localStorage.getItem("role") || "employee";
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    projectCode: "",
    project: "",
    desc: "",
    managers: [],
    clientName: "",
    startDate: "",
    endDate: "",
    due: "",
    status: "",
    priority: "P1",
  });

  const [selectedProject, setSelectedProject] = useState(null);

  // Date format
  const formatDateDisplay = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get("https://server-backend-nu.vercel.app/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error) {
      console.error("Fetch user error:", error);
      return null;
    }
  };

  // Fetch projects for manager
  useEffect(() => {
    const fetchProjectsByManager = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const user = await fetchUser();
        if (!user?._id) return;

        const res = await axios.get(
          `https://server-backend-nu.vercel.app/api/projects/manager/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const projectsData = res.data.data || [];
        setProjectData(projectsData);

        const total = projectsData.length;
        // const ongoing = projectsData.filter(p => p.status?.name === "Ongoing").length;
        const today = new Date();

        const ongoing = projectsData.filter(p => {
          const start = p.startDate ? new Date(p.startDate) : null;
          const due = p.dueDate ? new Date(p.dueDate) : null;

          return start && due && start <= today && due >= today;
        }).length;

        const delayed = projectsData.filter(p => p.status?.name === "Delayed").length;
        const assigned = projectsData.filter(p => p.status?.name === "Assigned").length;

        setCardCounts({
          total,
          ongoing,
          delayed,
          assigned,
        });
      } catch (error) {
        console.error("Project fetch error:", error);
      }
    };

    fetchProjectsByManager();
  }, []);

  useEffect(() => {
    axios
      .get("https://server-backend-nu.vercel.app/managers/list")
      .then(res => {
        console.log("Managers fetched:", res.data);
        setManagerList(res.data);
      })
      .catch(err => {
        console.error("Manager fetch error:", err);
      });
  }, []);



  const fetchProjectComments = async (projectId) => {
    setCommentLoading(true);
    try {
      const response = await axios.get(`https://server-backend-nu.vercel.app/project/${projectId}/comments`);
      setProjectComments(response.data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      alert("Failed to load comments");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleAddComment = (e, project) => {
    e.stopPropagation();
    setCommentModalProject(project);
    setNewComment('');
    fetchProjectComments(project._id);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      alert("Please enter a comment");
      return;
    }

    if (!commentModalProject?._id) {
      alert("Project not selected");
      return;
    }

    try {
      const res = await axios.post(
        `https://server-backend-nu.vercel.app/project/${commentModalProject._id}/comment`,
        { comment: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      if (res.data.success) {
        await fetchProjectComments(commentModalProject._id);
        setNewComment("");
        alert("Comment added successfully");
        setCommentModalProject(null);
      }
    } catch (error) {
      console.error("Add comment error:", error);
      alert(error?.response?.data?.message || "Failed to add comment");
    }
  };


  const openRowPopup = async (item, idx) => {
    setSelectedIndex(idx);
    setSelectedProject(item);
    setSelectedProjectId(item._id);
    setPopupMode("view");
    setForm({
      projectCode: item.projectCode,
      project: item.project || item.name || "",
      description: item.description || item.desc || "",
      managers: item.managers || [],
      clientName: item.clientName || "",
      startDate: item.startDate?.slice(0, 10),
      endDate: item.endDate?.slice(0, 10),
      due: item.dueDate?.slice(0, 10),
      status: item.status?.name || item.status || "",
    });
    setShowPopup(true);

    try {
      const response = await axios.get(`https://server-backend-nu.vercel.app/project/${item._id}/comments`);
      setProjectComments(response.data.comments || []);
    } catch (error) {
      console.error("Error fetching project comments:", error);
      setProjectComments([]);
    }
  };

  const filteredData = projectData.filter(project => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();

    const fields = [
      project.name,
      project.project,        // just in case backend uses this
      project.projectCode,
      project.clientName,
      project.priority,
      project.status?.name,
      formatDateDisplay(project.startDate),
      formatDateDisplay(project.endDate),
      formatDateDisplay(project.dueDate),
    ];

    return fields.some(f => f && f.toString().toLowerCase().includes(q));
  });



  // Pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const resetProjectForm = () => {
    setErrors({});
    setPopupMode("create");
  };


  const getDerivedProjectStatus = (projectData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = projectData.dueDate ? new Date(projectData.dueDate) : null;
    if (dueDate) dueDate.setHours(0, 0, 0, 0);

    const startDate = projectData.startDate ? new Date(projectData.startDate) : null;
    const isCompleted = projectData.status?.name === "Completed";
    // No due date
    if (!dueDate) return "—";

    // Completed cases
    if (isCompleted) {
      if (projectData.completedAt) {
        const completedAt = new Date(projectData.completedAt);
        completedAt.setHours(0, 0, 0, 0);

        if (completedAt <= dueDate) {
          return "Completed";
        } else {
          return "Completed (extra time)";
        }
      }
      return "Completed";
    }

    // Not started
    if (!startDate) {
      return "Not Started";
    }

    // After due date
    if (today > dueDate) {
      return "Delayed";
    }

    // Today is last date
    if (today.getTime() === dueDate.getTime()) {
      return "Today is last date";
    }

    // Future due date
    if (today < dueDate) {
      return "In Progress";
    }

    return "—";
  };

  return (
    <div className="container-fluid">

      <h2 style={{ color: "#3A5FBE", fontSize: "25px" }}>
        Project
      </h2>

      {/* Stats Cards */}
      <div className="row ">
        {[
          { title: "Total Projects", count: cardCounts.total, bg: "#D1ECF1" },
          { title: "Ongoing Projects", count: cardCounts.ongoing, bg: "#FFE493" },
          { title: "Delayed Projects", count: cardCounts.delayed, bg: "#FFB3B3" },
          { title: "Assigned Projects", count: cardCounts.assigned, bg: "#F2A259" },
        ].map((card, i) => (
          <div className="col-md-3 mb-3" key={i}>
            <div className="card shadow-sm h-100 border-0">
              <div
                className="card-body d-flex align-items-center"
                style={{ gap: "20px" }}
              >
                <h4
                  className="mb-0"
                  style={{
                    fontSize: "32px",
                    backgroundColor: card.bg,
                    padding: "10px",
                    textAlign: "center",
                    minWidth: "70px",
                    minHeight: "70px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#3A5FBE",
                  }}
                >
                  {card.count}
                </h4>
                <p
                  className="mb-0 fw-semibold"
                  style={{ fontSize: "18px", color: "#3A5FBE" }}
                >
                  {card.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="card bg-white shadow-sm p-3 mb-4 border-0">
        <div className="d-flex align-items-center justify-content-between flex-wrap">
          <div className="d-flex align-items-center mb-2 flex-grow-1" style={{ minWidth: "200px", gap: "10px" }}>
            <label
              className="fg-label me-3 fw-bold mb-0"
              style={{ fontSize: "16px", color: "#3A5FBE", width: "60px" }}
            >
              Search
            </label>
            <input
              type="text"
              value={searchInput}
              className="form-control"
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by any field..."
              style={{
                width: "280px",          // ✅ fixed width
                height: "38px",
                border: "1px solid #0d6efd",
                borderRadius: "6px",
                padding: "6px 10px",
              }}
            />
          </div>
          <div className="d-flex justify-content-end mb-2 ms-auto">
            <button
              className="btn btn-sm custom-outline-btn me-3"
              style={{ minWidth: 90 }}
              onClick={() => setSearchQuery(searchInput)}
            >
              Filter
            </button>
            <button
              className="btn btn-sm custom-outline-btn"
              style={{ minWidth: 90 }}
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>


      {/* Projects Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive bg-white">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Project Code</th>
                <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Project Name</th>
                <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Start Date</th>
                <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Due Date</th>
                <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Comments</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={item._id || index} onClick={() => openRowPopup(item, index)}>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{item.projectCode}</td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{item.project || item.name}</td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{formatDateDisplay(item.startDate)}</td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{formatDateDisplay(item.dueDate)}</td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{getDerivedProjectStatus(item) || "—"}</td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-sm custom-outline-btn"
                        style={{
                          fontSize: '12px',
                          padding: '4px 12px',
                          borderRadius: '4px'
                        }}
                        onClick={(e) => handleAddComment(e, item)}
                      >
                        Add Comment
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center">
            <span style={{ fontSize: "14px", marginRight: "8px" }}>
              Rows per page:
            </span>
            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
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

          <span style={{ fontSize: "14px" }}>
            {filteredData.length === 0 ? 0 : indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length}
          </span>

          <div>
            <button
              className="btn btn-sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            <button
              className="btn btn-sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </nav>

      {/* Comment Modal */}
      {commentModalProject && (
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
          <div className="modal-dialog" style={{ maxWidth: "500px", width: "95%" }}>
            <div className="modal-content">
              <div className="modal-header text-white" style={{ backgroundColor: "#3A5FBE" }}>
                <h5 className="modal-title mb-0">Add Comment</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setCommentModalProject(null)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Project: {commentModalProject.project || commentModalProject.name}
                  </label>
                </div>

                <div className="mb-3">
                  <label htmlFor="commentText" className="form-label">
                    Comment
                  </label>
                  <textarea
                    id="commentText"
                    className="form-control"
                    rows="4"
                    maxLength={300}
                    placeholder="Enter your comment here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div
                    className="char-count"
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      fontSize: "12px",
                      color: "#6c757d",
                      marginTop: "4px",
                    }}
                  >
                    {newComment.length}/300
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0">
                <button
                  className="btn btn-sm custom-outline-btn"
                  onClick={() => setCommentModalProject(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm custom-outline-btn"
                  onClick={handleSubmitComment}

                >
                  Submit Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Details Popup */}
      {showPopup && (
        <div
          className="popup-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            overflowY: "auto",
            padding: "20px",
          }}
        >
          <div
            className="popup-box bg-white p-4 shadow"
            style={{ width: "600px", borderRadius: "10px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <form>
              {/* HEADER */}
              <div
                className="modal-header"
                style={{
                  backgroundColor: "#3A5FBE",
                  padding: "10px",
                  color: "#fff",
                  margin: "-25px -24px 15px -24px",
                  borderTopLeftRadius: "10px",
                }}
              >
                <h5 className="fw-bold">
                  {popupMode === "view" ? "Project Details" : ""}
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => { setShowPopup(false); resetProjectForm(); }}
                ></button>
              </div>

              {/* Project Code */}
              <div className="mb-1 row align-items-center">
                <label className="col-4 form-label fw-semibold">Project Code</label>
                <div className="col-8">
                  <p>{form.projectCode}</p>
                </div>
              </div>

              {/* Project Title */}
              <div className="mb-1 row align-items-center">
                <label className="col-4 form-label fw-semibold">Project Title</label>
                <div className="col-8">
                  <p>{form.project}</p>
                </div>
              </div>
              <div className="mb-1 row align-items-center">
                <label className="col-4 form-label fw-semibold">Client Name</label>
                <div className="col-8">
                  <p>{form.clientName}</p>
                </div>
              </div>
              <div className="mb-1 row align-items-center">
                <label className="col-4 form-label fw-semibold">Description</label>
                <div className="col-8">
                  <p>{form.description}</p>
                </div>
              </div>

              {/* Dates  */}
              <div className="mb-1 row align-items-center">
                <label className="col-4 form-label fw-semibold">Start Date</label>
                <div className="col-8">
                  <p>{formatDateDisplay(form.startDate)}</p>
                </div>
              </div>

              <div className="mb-1 row align-items-center">
                <label className="col-4 form-label fw-semibold">Due Date</label>
                <div className="col-8">
                  <p>{formatDateDisplay(form.due)}</p>
                </div>
              </div>

              {/* Status  */}
              <div className="mb-1 row align-items-center">
                <label className="col-4 form-label fw-semibold">Status</label>
                <div className="col-8">
                  <p>{getDerivedProjectStatus(selectedProject)}</p>
                </div>
              </div>

              {/* Comments Section */}
              {popupMode === "view" && (
                <div className="row mb-3">
                  <div className="col-4 fw-semibold">Comments</div>
                  <div className="col-8">
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {projectComments && projectComments.length > 0 ? (
                        projectComments.map((comment, index) => (
                          <div key={index} className="mb-2 p-2 border rounded">
                            <div className="d-flex justify-content-between">
                              <span className="text-primary">
                                {comment.user?.name || comment.userId?.name || "Anonymous"}
                                <span className="text-muted ms-1">
                                  ({comment.user?.role || comment.userId?.role || "Unknown"})
                                </span>
                              </span>
                              <small className="text-muted">
                                {comment.createdAt ? formatDateDisplay(comment.createdAt) : ""}
                              </small>
                            </div>
                            <div className="mt-1">{comment.comment || comment.text}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-muted">No comments</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-sm custom-outline-btn"
                  style={{ minWidth: "90px" }}
                  onClick={() => { setShowPopup(false); resetProjectForm(); }}
                >
                  Close
                </button>
              </div>
            </form>
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
}