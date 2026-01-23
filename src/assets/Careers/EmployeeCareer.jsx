import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./EmployeeCareer.css";
import axios from "axios";
import TablePagination from "./TablePagination";

const EmployeeCareer = ({ user }) => {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  console.log("loggedInUser", user);
  const [activeTab, setActiveTab] = useState("Jobs");
  const [jobsPage, setJobsPage] = useState(0);
  const [appliedPage, setAppliedPage] = useState(0);
  const [referralPage, setReferralPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [workModeFilter, setWorkModeFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [postedFilter, setPostedFilter] = useState("All");
  const [jobCategoryView, setJobCategoryView] = useState("ALL");

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeViewTab, setActiveViewTab] = useState("DESC");
  const [appliedJobs, setAppliedJobs] = useState([]);

  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralSuccess, setReferralSuccess] = useState(false);
  const [referredCandidates, setReferredCandidates] = useState([]);
  const [activeReferralTab, setActiveReferralTab] = useState("DESC");

  const [jobs, setJobs] = useState([]);
  const [appliedJob, setAppliedJob] = useState([]);
  const [referralJobs, setReferralJobs] = useState([]);
  useEffect(() => {
    setJobsPage(0);
    setAppliedPage(0);
    setReferralPage(0);
  }, [activeTab]);

  const fetchJobs = async () => {
    try {
      const res = await fetch("https://server-backend-nu.vercel.app/api/jobs/");
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
    }
  };
  const fetchAppliedJobs = async () => {
    try {
      const res = await fetch(
        `https://server-backend-nu.vercel.app/api/apply/employee/${user._id}?applicantType=inhouse`
      );

      if (!res.ok) throw new Error("Failed to fetch applied jobs");

      const data = await res.json();

      console.log("API DATA:", data);
      setAppliedJob(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };
  const fetchRefferedJobs = async () => {
    try {
      const res = await fetch(
        `https://server-backend-nu.vercel.app/api/apply/employee/${user._id}?applicantType=referral`
      );

      if (!res.ok) throw new Error("Failed to fetch applied jobs");

      const data = await res.json();

      console.log("API DATA:", data);
      setReferralJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };
  const createApplication = (formData) =>
    axios.post("https://server-backend-nu.vercel.app/api/apply", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

  console.log("appliedJob from ", appliedJob);
  const formatDate = (dateString) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  const getDaysAgo = (createdAt) => {
    if (!createdAt) return 9999;

    const today = new Date().setHours(0, 0, 0, 0);
    const created = new Date(createdAt).setHours(0, 0, 0, 0);

    if (isNaN(created)) return 9999;

    return Math.floor((today - created) / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
    fetchRefferedJobs();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Applied":
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
      case "Shortlisted":
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
      case "Interview":
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
      case "Hired":
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
  const getJobTypeColor = (jobType) => {
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
    switch (jobType) {
      case "inhouse":
        return {
          ...baseStyle,
          backgroundColor: "#d1f2dd",
          color: "#0f5132",
        };
      case "referral":
        return {
          ...baseStyle,
          backgroundColor: "#d1e7ff",
          color: "#0d6efd",
        };
      default:
        return baseStyle;
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const categoryMatch =
      jobCategoryView === "ALL" ||
      (jobCategoryView === "INHOUSE" && job.jobType === "inhouse") ||
      (jobCategoryView === "REFERRAL" && job.jobType === "referral");

    return (
      categoryMatch &&
      (locationFilter === "All" || job.location === locationFilter) &&
      (workModeFilter === "All" || job.hiringType === workModeFilter) &&
      (departmentFilter === "All" || job.department === departmentFilter) &&
      (postedFilter === "All" ||
        getDaysAgo(job.createdAt) <= Number(postedFilter)) &&
      job.jobTitle.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const paginatedJobs = filteredJobs.slice(
    jobsPage * rowsPerPage,
    jobsPage * rowsPerPage + rowsPerPage
  );

  const appliedData = appliedJob;

  const paginatedApplied = appliedData.slice(
    appliedPage * rowsPerPage,
    appliedPage * rowsPerPage + rowsPerPage
  );

  const paginatedReferrals = referralJobs.slice(
    referralPage * rowsPerPage,
    referralPage * rowsPerPage + rowsPerPage
  );

  const resetJobFilters = () => {
    setSearchText("");
    setLocationFilter("All");
    setWorkModeFilter("All");
    setDepartmentFilter("All");
    setPostedFilter("All");
    setJobCategoryView("ALL");
  };

  return (
    <div className="container-fluid mt-4">
      <h2
        style={{
          color: "#3A5FBE",
          marginTop: "-30px",
          fontSize: "25px",
          marginLeft: "15px",
          marginBottom: "40px",
        }}
      >
        {activeTab}
      </h2>

      <div className="container-fluid pt-1 px-3">
        {/* ===== TOP TABS ===== */}
        <ul className="career-tabs mb-5 ">
          {["Jobs", "Applied", "My Referral"].map((tab) => (
            <li key={tab}>
              <button
                type="button"
                className={`career-tab-btn ${
                  activeTab === tab ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>

        {/* ===== JOBS filter ===== */}
        {activeTab === "Jobs" && (
          <>
            <div className="card mb-5 mt-5 shadow-sm border-0">
              <div className="card-body">
                <div className="row g-2 align-items-center">
                  {/* Search */}
                  <div className="col-12 col-md-auto d-flex align-items-center gap-2 mb-1">
                    <label htmlFor="leaveStatusFilter" className="filter-label">
                      Job title
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Job title"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>

                  {/* Location */}
                  <div className="col-12 col-md-auto d-flex align-items-center gap-2 mb-1">
                    <label className="filter-label">Location</label>
                    <select
                      className="form-select form-select-sm"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option>Bangalore</option>
                      <option>Pune</option>
                      <option>Mumbai</option>
                      <option>Remote</option>
                    </select>
                  </div>

                  {/* Department */}
                  <div className="col-12 col-md-auto d-flex align-items-center gap-2 mb-1">
                    <label className="filter-label">Department</label>
                    <select
                      className="form-select form-select-sm"
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option>IT</option>
                      <option>HR</option>
                      <option>Finance</option>
                      <option>Marketing</option>
                    </select>
                  </div>

                  {/* Posted */}
                  <div className="col-12 col-md-auto d-flex align-items-center gap-2 mb-1">
                    <label className=" filter-label">Posted</label>
                    <select
                      className="form-select form-select-sm"
                      value={postedFilter}
                      onChange={(e) => setPostedFilter(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="1">Today</option>
                      <option value="7">7 Days</option>
                      <option value="30">30 Days</option>
                    </select>
                  </div>

                  {/* Reset */}
                  <div className="col-md-1 text-end">
                    <button
                      className="btn btn-sm btn-outline-primary px-4"
                      onClick={resetJobFilters}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* filter code end*/}

            {/* Category */}
            <div className="d-flex gap-4 mb-3 px-2">
              {[
                { label: "All Jobs", value: "ALL" },
                { label: "In-house Jobs", value: "INHOUSE" },
                { label: "Referral Jobs", value: "REFERRAL" },
              ].map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`btn fw-semibold ${
                    jobCategoryView === cat.value
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setJobCategoryView(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Job Table */}
            <div className="card shadow-sm border-0">
              <div
                className="table-responsive mt-3 "
                style={{
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  borderRadius: "8px",
                }}
              >
                <table
                  className="table table-hover mb-0"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
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
                        Job ID
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
                        Job Title
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
                        Location
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
                        Posted
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
                    {paginatedJobs.length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          style={{
                            textAlign: "center",
                            padding: "20px",
                            fontStyle: "italic",
                            color: "#888",
                          }}
                        >
                          No Job records available.
                        </td>
                      </tr>
                    ) : (
                      paginatedJobs.map((job) => (
                        <tr key={job._id}>
                          <td
                            style={{
                              padding: "12px",
                              verticalAlign: "middle",
                              fontSize: "14px",
                              borderBottom: "1px solid #dee2e6",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {job._id?.slice(-4)}
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
                            {job.jobTitle}{" "}
                            {jobCategoryView === "ALL" && (
                              <span style={getJobTypeColor(job.jobType)}>
                                {job.jobType}
                              </span>
                            )}
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
                            {job.location}
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
                            {getDaysAgo(job.createdAt) === 0
                              ? "Today"
                              : `${getDaysAgo(job.createdAt)} days ago`}
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
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                setSelectedJob(job);
                                if (job.jobType === "referral") {
                                  setShowReferralModal(true);
                                  setReferralSuccess(false);
                                } else {
                                  setShowViewModal(true);
                                  setActiveViewTab("DESC");
                                }
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <TablePagination
              page={jobsPage}
              setPage={setJobsPage}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              totalCount={filteredJobs.length}
            />
          </>
        )}

        {/* ===== Applied Tab ===== */}
        {activeTab === "Applied" && (
          <>
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
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
                        Job ID
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
                        Job Title
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
                        Applied On
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
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedApplied.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          No jobs found.
                        </td>
                      </tr>
                    ) : (
                      paginatedApplied.map((app) => (
                        <tr key={app._id}>
                          <td
                            style={{
                              padding: "12px",
                              verticalAlign: "middle",
                              fontSize: "14px",
                              borderBottom: "1px solid #dee2e6",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {app?.job?._id.slice(-4)}
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
                            {app.job?.jobTitle}
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
                            {formatDate(app.createdAt) || "Self"}
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
                            <span style={getStatusColor(app.status)}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ===== MY REFERRAL TAB ===== */}
        {activeTab === "My Referral" && (
          <>
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
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
                        Job ID
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
                        Candidate Name
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
                        Job Title
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
                        Referred On
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
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedReferrals.length > 0 ? (
                      paginatedReferrals.map((ref) => (
                        <tr key={ref._id}>
                          <td
                            style={{
                              padding: "12px",
                              verticalAlign: "middle",
                              fontSize: "14px",
                              borderBottom: "1px solid #dee2e6",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ref?.job?._id?.slice(-4)}{" "}
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
                            {ref?.candidate?.name}
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
                            {ref?.job?.jobTitle}
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
                            {formatDate(ref?.createdAt)}
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
                            <span style={getStatusColor(ref.status)}>
                              {ref.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No referral data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ===== View Modal ===== */}
        {showViewModal && selectedJob && (
          <div
            className="modal fade show d-block"
            style={{ background: "#00000080" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{selectedJob.jobTitle}</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowViewModal(false)}
                  />
                </div>
                <div className="modal-body">
                  {/* Modal Tabs */}
                  <div className="d-flex gap-3 mb-3">
                    <button
                      className={`btn btn-sm ${
                        activeViewTab === "DESC"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => setActiveViewTab("DESC")}
                    >
                      Job Description
                    </button>
                    <button
                      className={`btn btn-sm ${
                        activeViewTab === "APPLY"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => setActiveViewTab("APPLY")}
                    >
                      Application Form
                    </button>
                  </div>
                  {activeViewTab === "DESC" && (
                    <div className="job-details-wrapper">
                      <div className="job-card">
                        <h6 className="job-card-title">Job Info</h6>

                        <div className="job-info-grid">
                          <div>
                            <span className="label">Job ID</span>
                            <p>{selectedJob._id?.slice(-4)}</p>
                          </div>

                          <div>
                            <span className="label">Location</span>
                            <p>{selectedJob.location}</p>
                          </div>

                          <div>
                            <span className="label">Department</span>
                            <p>{selectedJob.department}</p>
                          </div>

                          <div>
                            <span className="label">Job Type</span>
                            <p>{selectedJob.hiringType}</p>
                          </div>

                          <div>
                            <span className="label">Experience</span>
                            <p>
                              {selectedJob.experience?.min} –{" "}
                              {selectedJob.experience?.max} Years
                            </p>
                          </div>

                          <div>
                            <span className="label">Posted</span>
                            <p>{formatDate(selectedJob.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="job-card">
                        <h6 className="job-card-title">Job Details</h6>

                        <div className="job-section">
                          <b>Key Skills:</b>
                          <ul>
                            {selectedJob.importantSkills?.map((skill, i) => (
                              <li key={i}>{skill}</li>
                            ))}
                          </ul>

                          {selectedJob.otherSkills &&
                            selectedJob.otherSkills.length > 0 && (
                              <>
                                <h6
                                  style={{
                                    marginTop: "16px",
                                    color: "#3A5FBE",
                                  }}
                                >
                                  Other Skills:
                                </h6>
                                <ul
                                  style={{
                                    paddingLeft: "20px",
                                    marginTop: "6px",
                                  }}
                                >
                                  {selectedJob.otherSkills.map(
                                    (skill, index) => (
                                      <li
                                        key={index}
                                        style={{
                                          fontSize: "14px",
                                          color: "#212529",
                                          marginBottom: "4px",
                                        }}
                                      >
                                        {skill}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </>
                            )}
                        </div>

                        <div className="job-section">
                          <b>Description:</b>
                          <div
                            className="job-desc"
                            dangerouslySetInnerHTML={{
                              __html: selectedJob.jobDescription,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Application Form */}
                  {activeViewTab === "APPLY" && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target;

                        const formData = new FormData();
                        formData.append("job", selectedJob._id);
                        formData.append("applicantType", "inhouse");
                        formData.append("employee", user._id);
                        formData.append(
                          "name",
                          `${form.firstName.value}${form.middleName.value} ${form.lastName.value}`
                        );
                        formData.append("email", form.email.value);
                        formData.append("experience", form.experience.value);
                        formData.append("city", form.city.value);
                        formData.append("phone", form.phone.value);
                        formData.append("resumeUrl", form.resume.files[0]);

                        try {
                          await createApplication(formData);
                          alert("Application submitted successfully!");
                          await fetchAppliedJobs();
                          setShowViewModal(false);
                        } catch (err) {
                          alert(
                            err.response?.data?.message || "Application failed"
                          );
                        }
                      }}
                    >
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          First Name:
                        </label>
                        <input
                          className="form-control"
                          name="firstName"
                          placeholder="Enter First Name"
                          required
                        />
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          Middle Name:
                        </label>
                        <input
                          className="form-control"
                          name="middleName"
                          placeholder="Enter Middle Name"
                        />
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          Last Name:
                        </label>
                        <input
                          className="form-control"
                          name="lastName"
                          placeholder="Enter Last Name"
                          required
                        />
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          Email ID:
                        </label>
                        <input
                          className="form-control"
                          name="email"
                          type="email"
                          placeholder="Enter Email"
                          required
                        />
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          Experience (Years):
                        </label>
                        <input
                          className="form-control"
                          name="experience"
                          type="number"
                          min="0"
                          placeholder="Enter Experience"
                          required
                        />
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          Current City:
                        </label>
                        <input
                          className="form-control"
                          name="city"
                          placeholder="Enter Current City"
                          required
                        />
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          Phone Number:
                        </label>
                        <input
                          className="form-control"
                          name="phone"
                          type="tel"
                          placeholder="Enter Phone Number"
                          required
                        />
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          Resume:
                        </label>
                        <input
                          className="form-control"
                          name="resume"
                          type="file"
                          accept=".doc,.docx,.pdf"
                          required
                        />
                      </div>
                      <button className="btn btn-primary w-100">
                        Apply Job
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Referral Modal (Like In-house Application Form) ===== */}
        {showReferralModal && selectedJob && (
          <div
            className="modal fade show d-block"
            style={{ background: "#00000080" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Refer Candidate for {selectedJob.jobTitle}
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowReferralModal(false)}
                  />
                </div>
                <div className="modal-body">
                  {/* Modal Tabs */}
                  <div className="d-flex gap-3 mb-3">
                    <button
                      className={`btn btn-sm ${
                        activeReferralTab === "DESC"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => setActiveReferralTab("DESC")}
                    >
                      Job Description
                    </button>
                    <button
                      className={`btn btn-sm ${
                        activeReferralTab === "APPLY"
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => setActiveReferralTab("APPLY")}
                    >
                      Application Form
                    </button>
                  </div>
                  {activeReferralTab === "DESC" && (
                    <div className="job-details-wrapper">
                      <div className="job-card">
                        <h6 className="job-card-title">Job Info</h6>

                        <div className="job-info-grid">
                          <div>
                            <span className="label">Job ID</span>
                            <p>{selectedJob._id?.slice(-4)}</p>
                          </div>

                          <div>
                            <span className="label">Location</span>
                            <p>{selectedJob.location}</p>
                          </div>

                          <div>
                            <span className="label">Department</span>
                            <p>{selectedJob.department}</p>
                          </div>

                          <div>
                            <span className="label">Job Type</span>
                            <p>{selectedJob.hiringType}</p>
                          </div>

                          <div>
                            <span className="label">Experience</span>
                            <p>
                              {selectedJob.experience?.min} –{" "}
                              {selectedJob.experience?.max} Years
                            </p>
                          </div>

                          <div>
                            <span className="label">Posted</span>
                            <p>{formatDate(selectedJob.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="job-card">
                        <h6 className="job-card-title">Job Details</h6>

                        <div className="job-section">
                          <b>Key Skills:</b>
                          <ul>
                            {selectedJob.importantSkills?.map((skill, i) => (
                              <li key={i}>{skill}</li>
                            ))}
                          </ul>

                          {selectedJob.otherSkills &&
                            selectedJob.otherSkills.length > 0 && (
                              <>
                                <h6
                                  style={{
                                    marginTop: "16px",
                                    color: "#3A5FBE",
                                  }}
                                >
                                  Other Skills:
                                </h6>
                                <ul
                                  style={{
                                    paddingLeft: "20px",
                                    marginTop: "6px",
                                  }}
                                >
                                  {selectedJob.otherSkills.map(
                                    (skill, index) => (
                                      <li
                                        key={index}
                                        style={{
                                          fontSize: "14px",
                                          color: "#212529",
                                          marginBottom: "4px",
                                        }}
                                      >
                                        {skill}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </>
                            )}
                        </div>

                        <div className="job-section">
                          <b>Description:</b>
                          <div
                            className="job-desc"
                            dangerouslySetInnerHTML={{
                              __html: selectedJob.jobDescription,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Referral Application Form */}
                  {!referralSuccess && activeReferralTab === "APPLY" && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target;

                        const formData = new FormData();
                        formData.append("job", selectedJob._id);
                        formData.append("applicantType", "referral"); // or inhouse
                        formData.append("referredBy", user._id); // logged-in employee id
                        formData.append(
                          "name",
                          `${form.firstName.value} ${form.middleName.value} ${form.lastName.value}`
                        );
                        formData.append("email", form.email.value);
                        formData.append("experience", form.experience.value);
                        formData.append("city", form.city.value);
                        formData.append("phone", form.phone.value);
                        formData.append("resumeUrl", form.resume.files[0]);
                        const candidate = {
                          name: `${form.firstName.value}${form.middleName.value} ${form.lastName.value}`,
                          email: form.email.value,
                          experience: form.experience.value,
                          city: form.city.value,
                          phone: form.phone.value,
                        };
                        try {
                          await createApplication(formData);
                          alert("Application submitted successfully!");
                          await fetchRefferedJobs();
                          setReferredCandidates([
                            ...referredCandidates,
                            candidate,
                          ]);
                          setReferralSuccess(true);
                          setShowViewModal(false);
                        } catch (err) {
                          alert(
                            err.response?.data?.message || "Application failed"
                          );
                        }
                      }}
                    >
                      {/* Candidate Info (Same as In-house Form) */}
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          First Name:
                        </label>
                        <input
                          className="form-control"
                          name="firstName"
                          placeholder="Enter First Name"
                          required
                        />
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          Middle Name:
                        </label>
                        <input
                          className="form-control"
                          name="middleName"
                          placeholder="Enter Middle Name"
                        />
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          Last Name:
                        </label>
                        <input
                          className="form-control"
                          name="lastName"
                          placeholder="Enter Last Name"
                          required
                        />
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          Email ID:
                        </label>
                        <input
                          className="form-control"
                          name="email"
                          type="email"
                          placeholder="Enter Email"
                          required
                        />
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          Experience (Years):
                        </label>
                        <input
                          className="form-control"
                          name="experience"
                          type="number"
                          min="0"
                          placeholder="Enter Experience"
                          required
                        />
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          Current City:
                        </label>
                        <input
                          className="form-control"
                          name="city"
                          placeholder="Enter Current City"
                          required
                        />
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          Phone Number:
                        </label>
                        <input
                          className="form-control"
                          name="phone"
                          type="tel"
                          placeholder="Enter Phone Number"
                          required
                        />
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <label
                          className="form-label me-2"
                          style={{ minWidth: "150px" }}
                        >
                          Resume:
                        </label>
                        <input
                          className="form-control"
                          name="resume"
                          type="file"
                          accept=".doc,.docx,.pdf"
                          required
                        />
                      </div>

                      <button className="btn btn-primary w-100">
                        Submit Referral
                      </button>
                    </form>
                  )}

                  {referralSuccess && (
                    <div className="text-center">
                      <h5 className="text-success mb-3">
                        Referral submitted successfully!
                      </h5>
                      <button
                        className="btn btn-outline-primary me-2"
                        onClick={() => setReferralSuccess(false)}
                      >
                        Refer More Candidates
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          alert(JSON.stringify(referredCandidates))
                        }
                      >
                        View Applications
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeCareer;
