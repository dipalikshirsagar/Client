import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const HRScheduleInterview = () => {
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [scheduledInterviews, setScheduledInterviews] = useState([]);

  //console.log("Scheduled Interviews:", scheduledInterviews);

  // ===== TABLE & POPUP STATES =====
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

  const initialFormState = {
    candidateName: "",
    email: "",
    role: "",
    date: "",
    time: "",
    interviewType: "Online",
    interviewer: "",
    resume: null,
    link: "",
    status: "Scheduled"
  };

  const [formData, setFormData] = useState(initialFormState);

  const generateInterviewId = () => "INT-" + Date.now();

  /* ---------------- FETCH EMPLOYEES ---------------- */
  useEffect(() => {
    axios
      .get("https://server-backend-nu.vercel.app/allEmp")
      .then((res) => {
        if (res.data.success) setEmployees(res.data.employees);
      })
      .catch((err) => console.error("Error fetching employees:", err));
  }, []);

  /* ---------------- LOAD INTERVIEWS FROM LOCALSTORAGE ---------------- */
  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("scheduledInterviews")) || [];
    setScheduledInterviews(stored);
    setAllInterviews(stored);
    setInterviews(stored);
    setShowTable(stored.length > 0);
  }, []);

  /* ---------------- VALIDATIONS ---------------- */
  const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const validateFile = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    const maxSize = 2 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) return "Only PDF, DOC or DOCX files are allowed";
    if (file.size > maxSize) return "Resume size must be less than 2MB";
    return null;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "resume") {
      const file = files[0];
      if (file) {
        const fileError = validateFile(file);
        if (fileError) return setErrors((prev) => ({ ...prev, resume: fileError }));
        setErrors((prev) => ({ ...prev, resume: "" }));
        setFormData((prev) => ({ ...prev, resume: file }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "email" && value && !validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid email" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!formData.candidateName.trim()) newErrors.candidateName = "Candidate name is required";
    if (!formData.email || !validateEmail(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.role) newErrors.role = "Please select role";
    if (!formData.date) newErrors.date = "Interview date is required";
    if (!formData.time) newErrors.time = "Interview time is required";
    if (!formData.interviewer) newErrors.interviewer = "Please select interviewer";
    if (!formData.resume) newErrors.resume = "Resume upload is required";
    if (!formData.link.trim()) newErrors.link = "Interview link is required";
    if (!formData.status) newErrors.status = "Select a status";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // 🔥 PREPARE INTERVIEW DATA
    const interviewData = {
      interviewId: generateInterviewId(),
      ...formData,
      employeeName: formData.interviewer,
    };

    // SAVE TO LOCALSTORAGE
    const existing = JSON.parse(localStorage.getItem("scheduledInterviews")) || [];
    existing.push(interviewData);
    localStorage.setItem("scheduledInterviews", JSON.stringify(existing));

    // UPDATE TABLE
    setScheduledInterviews(existing);
    setAllInterviews(existing);
    setInterviews(existing);
    setShowTable(true);
    setCurrentPage(1);

    alert("Interview Scheduled Successfully!");
    setShowForm(false);
    setErrors({});
    setFormData(initialFormState);
  };

  const handleToggleForm = () => {
    if (showForm) {
      setErrors({});
      setFormData(initialFormState);
    }
    setShowForm(!showForm);
  };

  /* ---------------- FILTER HANDLERS ---------------- */
  const applyFilters = () => {
    let filtered = [...allInterviews];

    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (item) => item.status?.toLowerCase().trim() === statusFilter.toLowerCase().trim()
      );
    }
    if (dateFromFilter) filtered = filtered.filter((item) => new Date(item.date) >= new Date(dateFromFilter));
    if (dateToFilter) filtered = filtered.filter((item) => new Date(item.date) <= new Date(dateToFilter));

    setInterviews(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setStatusFilter("All");
    setDateFromFilter("");
    setDateToFilter("");
    setInterviews(allInterviews);
    setCurrentPage(1);
  };

  /* ---------------- PAGINATION ---------------- */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInterviews = interviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(interviews.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  /* ---------------- JSX ---------------- */
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
          HR - Schedule Interview
        </h2>
        <button className="btn btn-sm custom-outline-btn mb-3" onClick={handleToggleForm}>
          {showForm ? "Close Form" : "Schedule Interview"}
        </button>
      </div>

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={handleSubmit} noValidate>
              {/* Candidate + Email */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Candidate Name</label>
                  <input type="text" name="candidateName" className={`form-control ${errors.candidateName ? "is-invalid" : ""}`} value={formData.candidateName} onChange={handleChange} />
                  <div className="invalid-feedback">{errors.candidateName}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className={`form-control ${errors.email ? "is-invalid" : ""}`} value={formData.email} onChange={handleChange} />
                  <div className="invalid-feedback">{errors.email}</div>
                </div>
              </div>

              {/* Role */}
              <div className="mb-3">
                <label className="form-label">Role / Position</label>
                <select name="role" className={`form-select ${errors.role ? "is-invalid" : ""}`} value={formData.role} onChange={handleChange}>
                  <option value="">-- Select Role --</option>
                  <option value="Tester">Tester</option>
                  <option value="Software Developer">Software Developer</option>
                  <option value="Java Developer">Java Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                </select>
                <div className="invalid-feedback">{errors.role}</div>
              </div>

              {/* Date, Time, Type */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Date</label>
                  <input type="date" name="date" className={`form-control ${errors.date ? "is-invalid" : ""}`} value={formData.date} onChange={handleChange} />
                  <div className="invalid-feedback">{errors.date}</div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Time</label>
                  <input type="time" name="time" className={`form-control ${errors.time ? "is-invalid" : ""}`} value={formData.time} onChange={handleChange} />
                  <div className="invalid-feedback">{errors.time}</div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Interview Type</label>
                  <select name="interviewType" className="form-select" value={formData.interviewType} onChange={handleChange}>
                    <option>Online</option>
                    <option>Offline</option>
                  </select>
                </div>
              </div>

              {/* Interviewer */}
              <div className="mb-3">
                <label className="form-label">Interviewer</label>
                <select name="interviewer" className={`form-select ${errors.interviewer ? "is-invalid" : ""}`} value={formData.interviewer} onChange={handleChange}>
                  <option value="">-- Select Interviewer --</option>
                  {employees.map((emp) => <option key={emp.employeeId} value={emp.name}>{emp.name} ({emp.designation})</option>)}
                </select>
                <div className="invalid-feedback">{errors.interviewer}</div>
              </div>

              {/* Resume */}
              <div className="mb-3">
                <label className="form-label">Upload Resume</label>
                <input type="file" name="resume" className={`form-control ${errors.resume ? "is-invalid" : ""}`} accept=".pdf,.doc,.docx" onChange={handleChange} />
                <small className="text-muted">Allowed formats: PDF, DOC, DOCX | Max size: 2MB</small>
                <div className="invalid-feedback">{errors.resume}</div>
              </div>

              {/* Link */}
              <div className="mb-3">
                <label className="form-label">Interview Link</label>
                <input type="text" name="link" className={`form-control ${errors.link ? "is-invalid" : ""}`} value={formData.link} onChange={handleChange} placeholder="Enter meeting link" />
                <div className="invalid-feedback">{errors.link}</div>
              </div>

              {/* Status */}
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select name="status" className={`form-select ${errors.status ? "is-invalid" : ""}`} value={formData.status} onChange={handleChange}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="On-going">On-going</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                  <option value="Not-completed">Not-completed</option>
                </select>
                <div className="invalid-feedback">{errors.status}</div>
              </div>

              <button type="submit" className="btn btn-sm custom-outline-btn mb-3">Schedule Interview</button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MANAGER STYLE TABLE ================= */}
      {showTable && (
        <>
          {/* FILTER */}
          <div className="card mb-4 mt-3 shadow-sm border-0">
            <div className="card-body">
              <form
                className="row g-2 align-items-center"
                onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
              >
                <div className="col-12 col-md-auto d-flex align-items-center gap-2 mb-1 ms-2">
                  <label className="fw-bold mb-0 text-start text-md-end" style={{ fontSize: "16px", color: "#3A5FBE" }}>Status</label>
                  <select className="form-select" style={{ minWidth: 100 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="On-going">On-going</option>
                    <option value="Completed">Completed</option>
                    <option value="Not-completed">Not-completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="col-12 col-md-auto d-flex align-items-center mb-1 ms-2">
                  <label className="fw-bold mb-0 text-start text-md-end" style={{ fontSize: "16px", color: "#3A5FBE", minWidth: "50px", marginRight: "8px" }}>From</label>
                  <input type="date" className="form-control" style={{ minWidth: "140px" }} value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)} />
                </div>

                <div className="col-12 col-md-auto d-flex align-items-center mb-1 ms-2">
                  <label className="fw-bold mb-0 text-start text-md-end" style={{ fontSize: "16px", color: "#3A5FBE", minWidth: "50px", marginRight: "8px" }}>To</label>
                  <input type="date" className="form-control" style={{ minWidth: "140px" }} value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} />
                </div>

                <div className="col-auto ms-auto d-flex gap-2">
                  <button type="submit" className="btn btn-sm custom-outline-btn" style={{ minWidth: 90 }}>Filter</button>
                  <button type="button" className="btn btn-sm custom-outline-btn" style={{ minWidth: 90 }} onClick={resetFilters}>Reset</button>
                </div>
              </form>
            </div>
          </div>

          {/* TABLE */}
          <div className="table-responsive mt-3" style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.1)", borderRadius: "8px" }}>
            <table className="table table-hover align-middle mb-0 bg-white">
              <thead style={{ backgroundColor: "#ffffff" }}>
                <tr>
                  {["Interview ID", "Candidate", "Email", "Role", "Date", "Time", "Type", "Interviewer", "Link", "Status"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentInterviews.length === 0 ? (
                  <tr><td colSpan="10" className="text-center py-4" style={{ color: "#6c757d" }}>No interviews scheduled.</td></tr>
                ) : currentInterviews.map((item, i) => (
                  <tr key={i} onClick={() => setSelected(item)} style={{ cursor: "pointer" }}>
                    <td style={tdStyle("#3A5FBE", 500)}>{item.interviewId}</td>
                    <td style={tdStyle()}>{item.candidateName}</td>
                    <td style={tdStyle()}>{item.email}</td>
                    <td style={tdStyle()}>{item.role}</td>
                    <td style={tdStyle()}>{item.date}</td>
                    <td style={tdStyle()}>{item.time}</td>
                    <td style={tdStyle()}>{item.interviewType}</td>
                    <td style={tdStyle()}>{item.interviewer}</td>
                    <td style={tdStyle()}>{item.link ? <a href={item.link} target="_blank" rel="noreferrer">Join</a> : "-"}</td>
                    <td style={tdStyle()}>
                      <span style={{
                        backgroundColor: item.status === "Completed" ? "#d1f2dd" : item.status === "Cancelled" ? "#f8d7da" : "#FFE493",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        fontSize: "13px",
                        fontWeight: 500,
                        display: "inline-block",
                        width: "100px",
                        textAlign: "center"
                      }}>{item.status}</span>
                    </td>
                  </tr>
                ))}
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

export default HRScheduleInterview;