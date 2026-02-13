import React, { useState, useEffect } from "react";
import RichTextEditor from "./RichTextEditor";
import "./AdminCareer.css";
import axios from "axios";

function AdminCareer({ user }) {
  const [formErrors, setFormErrors] = useState({}); //Added by Rutuja
  const userRole = user.role || localStorage.getItem("role");

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("inhouse");

  const [showAddJob, setShowAddJob] = useState(false);
  const [editJobId, setEditJobId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [viewJob, setViewJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  // View popup tabs
  const [activeViewTab, setActiveViewTab] = useState("details");
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [openStatusId, setOpenStatusId] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assignDateFromFilter, setAssignDateFromFilter] = useState("");
  const [assignDateToFilter, setAssignDateToFilter] = useState("");
  const [newJob, setNewJob] = useState({
    jobTitle: "",
    department: "",
    grade: "",
    location: "",
    hiringType: "",
    jobType: "",
    noOfOpenings: 1,
    dueOn: "",
    jobDescription: "",
    ctc: {
      min: "",
      max: "",
    },
    experience: {
      min: "",
      max: "",
    },
    importantSkills: [],
    status: "Active",
  });
  const [expandedJobId, setExpandedJobId] = useState(null); //Added bu samiksha

  useEffect(() => {
    fetchJobs();
    setFilteredJobs(jobs);
  }, []);
  useEffect(() => {
    applyFilters();
  }, [activeTab, jobs]);

  const fetchJobs = async () => {
    try {
      const res = await fetch("https://server-backend-ems.vercel.app/api/jobs/");
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
    }
  };

  // useEffect(() => {
  //   const temp = jobs.filter(
  //     (j) => j.jobType === activeTab || j.jobType === "both",
  //   );
  //   setFilteredJobs(temp);
  // }, [activeTab, jobs]);
  const formatDate = (dateString) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));

  //Addeed by Rutuja
  const validateForm = () => {
    const errors = {};

    if (!newJob.jobTitle.trim()) {
      errors.jobTitle = "Job Title is required";
    }

    if (!newJob.location) {
      errors.location = "Location is required";
    }

    if (!newJob.hiringType) {
      errors.hiringType = "Hiring Type is required";
    }

    if (!newJob.jobType) {
      errors.jobType = "Job Type is required";
    }

    if (!newJob.noOfOpenings || newJob.noOfOpenings < 1) {
      errors.noOfOpenings = "Number of openings must be at least 1";
    }

    if (!newJob.jobDescription || newJob.jobDescription.trim() === "") {
      errors.jobDescription = "Job Description is required";
    }

    if (
      !newJob.importantSkills ||
      newJob.importantSkills.length === 0 ||
      (Array.isArray(newJob.importantSkills) &&
        newJob.importantSkills.length === 0) ||
      (typeof newJob.importantSkills === "string" &&
        newJob.importantSkills.trim() === "")
    ) {
      errors.importantSkills = "Important Skills are required";
    }

    if (!newJob.dueOn) {
      errors.dueOn = "Due date is required";
    } else {
      const dueDate = new Date(newJob.dueOn);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        errors.dueOn = "Due date cannot be in the past";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleSaveJob(e) {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill all required fields correctly");
      return;
    }
    try {
      let processedSkills = [];
      if (Array.isArray(newJob.importantSkills)) {
        processedSkills = newJob.importantSkills;
      } else if (typeof newJob.importantSkills === "string") {
        processedSkills = newJob.importantSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill !== "");
      }
      const payload = {
        jobTitle: newJob.jobTitle,
        department: newJob.department,
        grade: newJob.grade,
        location: newJob.location,
        hiringType: newJob.hiringType,
        jobType: newJob.jobType,
        // noOfOpenings: newJob.noOfOpenings,
        // dueOn: newJob.dueOn,
        // jobDescription: newJob.jobDescription,
        // ctc: {
        //   min: newJob.ctc.min,
        //   max: newJob.ctc.max,
        // },
        // experience: {
        //   min: newJob.experience.min,
        //   max: newJob.experience.max,
        // },
        // importantSkills: newJob.importantSkills,
        // status: "Active",
        //Added by Samiksha
        noOfOpenings: Number(newJob.noOfOpenings),

        dueOn: newJob.dueOn,
        jobDescription: newJob.jobDescription,

        ctc: {
          min: Number(newJob.ctc.min),
          max: Number(newJob.ctc.max),
        },

        experience: {
          min: Number(newJob.experience.min),
          max: Number(newJob.experience.max),
        },

        importantSkills: Array.isArray(newJob.importantSkills)
          ? newJob.importantSkills
          : [],

        status: "Active",
      };
      console.log("payload", payload);
      let res;
      if (editJobId) {
        res = await axios.put(
          `https://server-backend-ems.vercel.app/api/jobs/${editJobId}`,
          payload,
          { headers: { "Content-Type": "application/json" } },
        );
        await fetchJobs();
      } else {
        const res = await axios.post(
          "https://server-backend-ems.vercel.app/api/jobs/",
          payload,
          { headers: { "Content-Type": "application/json" } },
        );
        await fetchJobs();
      }
      setFilteredJobs(jobs);
      setShowAddJob(false);

      if (!editJobId) {
        const lastPage = Math.ceil(jobs.length / itemsPerPage);
        setCurrentPage(lastPage);
      }

      setShowAddJob(false);
      setNewJob({
        jobTitle: "",
        department: "",
        grade: "",
        location: "",
        hiringType: "",
        jobType: "",
        noOfOpenings: 1,
        dueOn: "",
        jobDescription: "",
        ctc: {
          min: "",
          max: "",
        },
        experience: {
          min: "",
          max: "",
        },
        importantSkills: [],
        status: "",
      });
      alert(editJobId ? "Job updated" : "Job created");
      setEditJobId(null);
    } catch (error) {
      console.error("Submit failed:", error.response?.data || error.message);
      // alert("Operation failed");
      alert(error.response?.data?.error || "Operation failed"); //Added by Samiksha
    }
  }

  const handleEdit = (job) => {
    console.log("jobs from handle edit", job);
    setEditJobId(job._id);
    setShowAddJob(true);
    setEditMode(true);
    setNewJob({
      jobTitle: job?.jobTitle || "",
      department: job?.department || "",
      grade: job?.grade || "",
      location: job?.location || "",
      hiringType: job?.hiringType || "",
      jobType: job?.jobType || "",
      noOfOpenings: job?.noOfOpenings || "",
      dueOn: job?.dueOn ? new Date(job.dueOn).toISOString().split("T")[0] : "",
      jobDescription: job?.jobDescription || "",
      ctc: {
        min: job?.ctc?.min || "",
        max: job?.ctc?.max || "",
      },
      experience: {
        min: job?.experience?.min || "",
        max: job?.experience?.max || "",
      },
      importantSkills: Array.isArray(job?.importantSkills)
        ? job.importantSkills
        : typeof job?.importantSkills === "string"
          ? job.importantSkills.split(",").map((s) => s.trim())
          : [],
      status: job?.status || "",
    });
    setFormErrors({});
    console.log("new Job from edit", newJob);
  };

  async function handleDelete(id, e) {
    if (e) e.stopPropagation(); //Added by Rutuja
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(`https://server-backend-ems.vercel.app/api/jobs/${id}`);
      setJobs((prev) => prev.filter((t) => t._id !== id));
      setFilteredJobs((prev) => prev.filter((t) => t._id !== id));

      alert("Job deleted Successfully!!"); //Added by Rutuja
    } catch (error) {
      alert("Failed to delete job");
      console.log("error", error.message);
    }
  }

  //   const applyFilters = () => {
  //   let temp = [...jobs];

  //   if (statusFilter !== "All") {
  //     temp = temp.filter(job => job?.status === statusFilter);
  //   }

  //   if (assignDateFromFilter) {
  //     temp = temp.filter(job => new Date(job?.createdAt));
  //   }

  //   if (assignDateToFilter) {
  //     temp = temp.filter(job => new Date(job?.dueOn));
  //   }

  //   // temp.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  //   setFilteredJobs(temp);
  //   setCurrentPage(1);
  // };
  const applyFilters = () => {
    let temp = jobs.filter(
      (job) => job.jobType === activeTab || job.jobType === "both",
    );

    // Status Filter
    if (statusFilter !== "All") {
      temp = temp.filter((job) => job.status === statusFilter);
    }

    // Created Date Filter
    if (assignDateFromFilter) {
      const fromDate = new Date(assignDateFromFilter);
      fromDate.setHours(0, 0, 0, 0);

      temp = temp.filter((job) => {
        const created = new Date(job.createdAt);
        created.setHours(0, 0, 0, 0);
        return created >= fromDate;
      });
    }

    // Due Date Filter
    if (assignDateToFilter) {
      const toDate = new Date(assignDateToFilter);
      toDate.setHours(23, 59, 59, 999);

      temp = temp.filter((job) => {
        const due = new Date(job.dueOn);
        due.setHours(0, 0, 0, 0);
        return due <= toDate;
      });
    }

    // ✅ LIFO SORT (LATEST FIRST)
    temp.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredJobs(temp);
    setCurrentPage(1);
  };
  const getApplicantsInfo = async (jobId) => {
    try {
      setLoadingApplicants(true);
      const res = await fetch(`https://server-backend-ems.vercel.app/api/apply/job/${jobId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch applicants");
      }

      const data = await res.json();
      setApplicants(data);
    } catch (err) {
      console.error("Error fetching applicants:", err.message);
    } finally {
      setLoadingApplicants(false);
    }
  };

  // const resetFilters = () => {
  //   setStatusFilter("All");
  //   setAssignDateFromFilter("");
  //   setAssignDateToFilter("");
  //   setFilteredJobs([...jobs]);
  //   setCurrentPage(1);
  // };
  const resetFilters = () => {
    setStatusFilter("All");
    setAssignDateFromFilter("");
    setAssignDateToFilter("");

    const temp = jobs.filter(
      (job) => job.jobType === activeTab || job.jobType === "both",
    );

    setFilteredJobs(temp);
    setCurrentPage(1);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };
  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const indexOfLastItem = Math.min(
    currentPage * itemsPerPage,
    filteredJobs.length,
  );
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };
  console.log("applicants ", applicants);
  async function handleStatusChange(applicationId, newStatus) {
    try {
      await axios.put(`https://server-backend-ems.vercel.app/api/apply/${applicationId}`, {
        status: newStatus,
      });

      setApplicants((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app,
        ),
      );
    } catch (err) {
      alert("Failed to update status");
    }

    // popup close
    setOpenStatusId(null);
  }

  //Added by Tanvi
  // tanvi
  const isAnyPopupOpen = !!showViewPopup || viewJob;
  useEffect(() => {
    if (isAnyPopupOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden"; // 🔑 important
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isAnyPopupOpen]);

  // mahesh code
  const isExpired = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    return due <= today;
  };
  // mahesh code

  return (
    <div className="container-fluid ">
      <div className="d-flex justify-content-between mb-3">
        <h2 style={{ color: "#3A5FBE", fontSize: "25px", marginLeft: "15px" }}>
          Jobs
        </h2>
        {["hr", "admin"].includes(userRole) && (
          <button
            className="btn btn-sm custom-outline-btn"
            onClick={() => {
              setNewJob({
                jobTitle: "",
                department: "",
                grade: "",
                location: "",
                hiringType: "",
                jobType: "",
                noOfOpenings: 1,
                dueOn: "",
                jobDescription: "",
                ctc: {
                  min: "",
                  max: "",
                },
                experience: {
                  min: "",
                  max: "",
                },
                importantSkills: [],
                status: "",
              });
              setShowAddJob(true);
            }}
            style={{ minWidth: 90, height: 30 }}
          >
            + Add Job
          </button>
        )}
      </div>

      <div className="card mb-4 shadow-sm border-0">
        <div className="card-body">
          <form
            className="row g-2 align-items-center"
            onSubmit={handleFilterSubmit}
            style={{ justifyContent: "space-between" }}
          >
            <div className="col-12 col-md-auto d-flex align-items-center gap-2 mb-1  ms-2">
              <label
                htmlFor="employeeNameFilter"
                className="fw-bold mb-0 text-start text-md-end"
                style={{
                  fontSize: "16px",
                  color: "#3A5FBE",
                  width: "50px",
                  minWidth: "50px",
                  marginRight: "2px",
                }}
              >
                Search
              </label>
              <input
                id="employeeNameFilter"
                type="text"
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by any feild"
              />
            </div>

            <div className="col-12 col-md-auto d-flex align-items-center mb-1 ms-2">
              <label
                htmlFor="assignDateFromFilter"
                className="fw-bold mb-0 text-start text-md-end"
                style={{
                  fontSize: "16px",
                  color: "#3A5FBE",
                  width: "50px",
                  minWidth: "50px",
                  marginRight: "8px",
                }}
              >
                Date
              </label>
              <input
                type="date"
                id="assignDateFromFilter"
                value={assignDateFromFilter}
                onChange={(e) => setAssignDateFromFilter(e.target.value)}
                placeholder="dd-mm-yyyy"
                className="form-control"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (e.target.type = "text")}
              />
            </div>

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

      <div className="d-flex flex-row justify-content-start justify-content-md-center gap-2 mb-3 list-unstyled flex-wrap">
        <button
          className={`btn btn-sm job-tab-btn ${
            activeTab === "inhouse" ? "active" : ""
          }`}
          onClick={() => setActiveTab("inhouse")}
        >
          {" "}
          In-House Jobs
        </button>
        <button
          className={`btn btn-sm job-tab-btn ${
            activeTab === "referral" ? "active" : ""
          }`}
          onClick={() => setActiveTab("referral")}
        >
          {" "}
          Open for Referral
        </button>
      </div>

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
                  Openings
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
                  Description
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
                  Created
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
                  Due On
                </th>
                {/* {["hr", "admin"].includes(userRole) && (
                    <>  */}
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
                {/* </>
              )} */}
              </tr>
            </thead>
            <tbody>
              {" "}
              {currentJobs.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-4"
                    style={{ color: "#212529" }}
                  >
                    No jobs found.
                  </td>
                </tr>
              ) : (
                currentJobs.map((job) => (
                  // mahesh tr code
                  <tr
                    key={job._id}
                    style={{
                      cursor: isExpired(job.dueOn) ? "not-allowed" : "pointer",
                      backgroundColor: isExpired(job.dueOn) ? "#f5f5f5" : "",
                      opacity: isExpired(job.dueOn) ? 0.6 : 1,
                    }}
                    onClick={() => {
                      setApplicants([]);
                      setViewJob(job);
                      setActiveViewTab("details");
                      setShowViewPopup(true);
                      getApplicantsInfo(job._id);
                    }}
                  >
                    <td
                      style={{
                        padding: "12px",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        maxWidth: "200px",
                      }}
                    >
                      <div
                        style={{
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                        title={job.jobTitle}
                      >
                        {job.jobTitle.length > 50
                          ? job.jobTitle.substring(0, 50) + "..."
                          : job.jobTitle}
                      </div>
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
                      {job.department}
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
                      {job.location}
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
                      {job.noOfOpenings}
                    </td>
                    {/* //Added by Samiksha */}

                    {/* mahesh code */}
                    <td
                      style={{
                        padding: "12px",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        color: "#212529",
                        cursor: isExpired(job) ? "not-allowed" : "pointer",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        maxWidth: "250px",
                      }}
                      onClick={() => {
                        if (isExpired(job)) return;
                        e.stopPropagation();
                        setExpandedJobId(
                          expandedJobId === job._id ? null : job._id,
                        );
                      }}
                    >
                      <div
                        style={{
                          maxHeight:
                            expandedJobId === job._id ? "150px" : "20px",
                          overflowY:
                            expandedJobId === job._id ? "auto" : "hidden",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {job.jobDescription
                          ? expandedJobId === job._id
                            ? job.jobDescription.replace(/<[^>]+>/g, "")
                            : job.jobDescription
                                .replace(/<[^>]+>/g, "")
                                .substring(0, 50) +
                              (job.jobDescription.length > 50 ? "..." : "")
                          : "-"}
                      </div>
                    </td>
                    {/* mahesh code */}
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
                      {formatDate(job.createdAt)}
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
                      {formatDate(job.dueOn)}
                    </td>
                    <td>
                      {/* <button
                        className="btn btn-sm custom-outline-btn"
                        style={{ marginRight: "10px" }}
                        onClick={() => {
                          // console.log("VIEW CLICKED", job);
                          // setViewJob(job);
                          // getApplicantsInfo(job._id);
                          // setShowViewPopup(true);
                          setApplicants([]);
                          setViewJob(job);
                          setActiveViewTab("details");
                          setShowViewPopup(true);
                          getApplicantsInfo(job._id);
                        }}
                      >
                        View
                      </button> */}
                      {["hr", "admin"].includes(userRole) && (
                        <>
                          {/* mahesh code */}
                          <button
                            className="btn btn-sm custom-outline-btn me-2"
                            disabled={isExpired(job.dueOn)}
                            style={{
                              opacity: isExpired(job.dueOn) ? 0.5 : 1,
                              cursor: isExpired(job.dueOn)
                                ? "not-allowed"
                                : "pointer",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isExpired(job.dueOn)) return;
                              handleEdit(job);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            disabled={isExpired(job.dueOn)}
                            style={{
                              opacity: isExpired(job.dueOn) ? 0.5 : 1,
                              cursor: isExpired(job.dueOn)
                                ? "not-allowed"
                                : "pointer",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isExpired(job.dueOn)) return;
                              handleDelete(job._id);
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
        <div className="d-flex align-items-center gap-3">
          {/* Rows per page */}
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

          {/* Range display */}
          <span
            style={{ fontSize: "14px", marginLeft: "16px", color: "#212529" }}
          >
            {filteredJobs.length === 0
              ? "0–0 of 0"
              : `${indexOfFirstItem + 1}-${indexOfLastItem} of ${
                  filteredJobs.length
                }`}
          </span>

          {/* Arrows */}
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

      {/* //added by Mahesh*/}
      <div className="text-end mt-3">
        <button
          className="btn btn-sm custom-outline-btn"
          style={{ minWidth: 90 }}
          onClick={() => window.history.go(-1)}
        >
          Back
        </button>
      </div>

      {/* //added by Rushikesh */}
      {showAddJob && (
        <div class="job-module">
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header-custom">
                {editJobId ? "Edit Job" : "Add Job"}

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => {
                    setShowAddJob(false);
                    setEditJobId(null);
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body job-form">
                <form onSubmit={handleSaveJob}>
                  <h5 className="section-title">Basic Information</h5>

                  <div className="row">
                    <div className="field">
                      <label>Job Title *</label>
                      <input
                        type="text"
                        placeholder="Enter title"
                        value={newJob.jobTitle}
                        onChange={(e) =>
                          setNewJob({ ...newJob, jobTitle: e.target.value })
                        }
                        className={formErrors.jobTitle ? "is-invalid" : ""}
                      />
                      {formErrors.jobTitle && (
                        <div className="text-danger small mt-1">
                          {formErrors.jobTitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row two-col">
                    <div className="field">
                      <label>Department</label>
                      <select
                        value={newJob.department}
                        onChange={(e) =>
                          setNewJob({ ...newJob, department: e.target.value })
                        }
                      >
                        <option value="">Select Department</option>
                        <option>IT</option>
                        <option>QA</option>
                        <option>HR</option>
                        <option>Finance</option>
                      </select>
                    </div>

                    <div className="field">
                      <label>Grade</label>
                      <select
                        value={newJob.grade}
                        onChange={(e) =>
                          setNewJob({ ...newJob, grade: e.target.value })
                        }
                      >
                        <option value="">Select Grade</option>
                        <option>G4</option>
                        <option>G5</option>
                        <option>G6</option>
                      </select>
                    </div>
                  </div>

                  <div className="row two-col">
                    <div className="field">
                      <label>Location *</label>
                      <select
                        value={newJob.location}
                        onChange={(e) =>
                          setNewJob({ ...newJob, location: e.target.value })
                        }
                        className={formErrors.location ? "is-invalid" : ""}
                      >
                        <option value="">Select Location</option>
                        <option>Bangalore</option>
                        <option>Hyderabad</option>
                        <option>Chennai</option>
                      </select>
                      {formErrors.location && (
                        <div className="text-danger small mt-1">
                          {formErrors.location}
                        </div>
                      )}
                    </div>

                    <div className="field">
                      <label>Hiring Type *</label>
                      <select
                        value={newJob.hiringType}
                        onChange={(e) =>
                          setNewJob({ ...newJob, hiringType: e.target.value })
                        }
                        className={formErrors.hiringType ? "is-invalid" : ""}
                      >
                        <option value="">Select Type</option>
                        <option>Full-Time</option>
                        <option>Contract</option>
                      </select>
                      {formErrors.hiringType && (
                        <div className="text-danger small mt-1">
                          {formErrors.hiringType}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row two-col">
                    <div className="field">
                      <label>Job Type *</label>
                      <select
                        value={newJob.jobType}
                        onChange={(e) =>
                          setNewJob({ ...newJob, jobType: e.target.value })
                        }
                        className={formErrors.jobType ? "is-invalid" : ""}
                      >
                        <option value="">Select Job Type</option>
                        <option value="inhouse">In-House</option>
                        <option value="referral">Open for Referral</option>
                      </select>
                      {formErrors.jobType && (
                        <div className="text-danger small mt-1">
                          {formErrors.jobType}
                        </div>
                      )}
                    </div>

                    <div className="field">
                      <label>No of Openings *</label>
                      <input
                        type="number"
                        min="1"
                        value={newJob.noOfOpenings}
                        onChange={(e) =>
                          setNewJob({ ...newJob, noOfOpenings: e.target.value })
                        }
                        className={formErrors.noOfOpenings ? "is-invalid" : ""}
                      />
                      {formErrors.noOfOpenings && (
                        <div className="text-danger small mt-1">
                          {formErrors.noOfOpenings}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="field">
                    <label>Job Description *</label>
                    <RichTextEditor
                      value={newJob.jobDescription}
                      onChange={(value) =>
                        setNewJob((prev) => ({
                          ...prev,
                          jobDescription: value,
                        }))
                      }
                    />
                    {formErrors.jobDescription && (
                      <div className="text-danger small mt-1">
                        {formErrors.jobDescription}
                      </div>
                    )}
                  </div>

                  <h5 className="section-title">CTC Details (₹)</h5>

                  <div className="row two-col">
                    <div className="field">
                      <label>Min CTC</label>
                      <input
                        type="number"
                        min="0"
                        value={newJob.ctc?.min || ""}
                        onChange={(e) =>
                          setNewJob({
                            ...newJob,
                            ctc: { ...newJob.ctc, min: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="field">
                      <label>Max CTC</label>
                      <input
                        type="number"
                        min="0"
                        value={newJob.ctc?.max || ""}
                        onChange={(e) =>
                          setNewJob({
                            ...newJob,
                            ctc: { ...newJob.ctc, max: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <h5 className="section-title">Experience & Skills</h5>

                  <div className="row two-col">
                    <div className="field">
                      <label>Min Experience (Years)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={newJob.experience?.min || ""}
                        onChange={(e) =>
                          setNewJob({
                            ...newJob,
                            experience: {
                              ...newJob.experience,
                              min: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="field">
                      <label>Max Experience (Years)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={newJob.experience?.max || ""}
                        onChange={(e) =>
                          setNewJob({
                            ...newJob,
                            experience: {
                              ...newJob.experience,
                              max: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Important Skills *</label>
                    <input
                      type="text"
                      value={newJob.importantSkills.join(", ") || ""}
                      placeholder="Java, React, MongoDB..."
                      onChange={(e) =>
                        setNewJob({
                          ...newJob,
                          importantSkills: e.target.value
                            .split(",")
                            .map((s) => s.trim()),
                        })
                      }
                      className={formErrors.importantSkills ? "is-invalid" : ""}
                    />
                    {formErrors.importantSkills && (
                      <div className="text-danger small mt-1">
                        {formErrors.importantSkills}
                      </div>
                    )}
                    <small className="text-muted">
                      Separate skills with commas
                    </small>
                  </div>

                  <div className="row two-col mt-2">
                    <div className="field">
                      <label>Due On *</label>
                      <input
                        type="date"
                        value={newJob.dueOn || ""}
                        onChange={(e) =>
                          setNewJob({ ...newJob, dueOn: e.target.value })
                        }
                        className={formErrors.dueOn ? "is-invalid" : ""}
                      />
                      {formErrors.dueOn && (
                        <div className="text-danger small mt-1">
                          {formErrors.dueOn}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowAddJob(false);
                        setEditJobId(null);
                        setFormErrors({});
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editJobId ? "Save Changes" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {showViewPopup && viewJob && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: "#3A5FBE" }}
              >
                <h5 className="modal-title mb-0">{viewJob.jobTitle}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewPopup(false)}
                ></button>
              </div>

              <div className="px-3 pt-3 d-flex gap-2">
                <button
                  className={`btn btn-sm custom-outline-btn ${
                    activeViewTab === "details" ? "active" : ""
                  }`}
                  onClick={() => setActiveViewTab("details")}
                >
                  Job Details
                </button>

                <button
                  className={`btn btn-sm custom-outline-btn ${
                    activeViewTab === "candidates" ? "active" : ""
                  }`}
                  onClick={() => setActiveViewTab("candidates")}
                >
                  Candidates
                </button>
              </div>

              <div className="modal-body">
                {activeViewTab === "details" && (
                  <div className="job-details-wrapper">
                    <div className="job-card">
                      <h6 className="job-card-title">Job Info</h6>

                      <div className="job-info-grid">
                        <div>
                          <span className="label">Job ID</span>
                          <p>{viewJob._id?.slice(-4)}</p>
                        </div>

                        <div>
                          <span className="label">Location</span>
                          <p>{viewJob.location}</p>
                        </div>

                        <div>
                          <span className="label">Department</span>
                          <p>{viewJob.department}</p>
                        </div>

                        <div>
                          <span className="label">Job Type</span>
                          <p>{viewJob.hiringType}</p>
                        </div>

                        <div>
                          <span className="label">Experience</span>
                          <p>
                            {viewJob.experience?.min} –{" "}
                            {viewJob.experience?.max} Years
                          </p>
                        </div>

                        <div>
                          <span className="label">Posted</span>
                          <p>{formatDate(viewJob.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="job-card">
                      <h6 className="job-card-title">Job Details</h6>

                      <div className="job-section">
                        <b>Key Skills:</b>
                        <ul>
                          {viewJob.importantSkills?.map((skill, i) => (
                            <li key={i}>{skill}</li>
                          ))}
                        </ul>

                        {viewJob.otherSkills &&
                          viewJob.otherSkills.length > 0 && (
                            <>
                              <h6
                                style={{ marginTop: "16px", color: "#3A5FBE" }}
                              >
                                Other Skills:
                              </h6>
                              <ul
                                style={{
                                  paddingLeft: "20px",
                                  marginTop: "6px",
                                }}
                              >
                                {viewJob.otherSkills.map((skill, index) => (
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
                                ))}
                              </ul>
                            </>
                          )}
                      </div>

                      <div className="job-section">
                        <b>Description:</b>
                        <div
                          className="job-desc"
                          dangerouslySetInnerHTML={{
                            __html: viewJob.jobDescription,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeViewTab === "candidates" && (
                  <div style={{ marginTop: "16px" }}>
                    {applicants.length === 0 ? (
                      <p>No applicants found.</p>
                    ) : (
                      applicants.map((app) => (
                        <div key={app._id} className="candidate-card">
                          <div className="candidate-name">
                            {app?.candidate?.name}
                          </div>

                          <div className="candidate-grid">
                            <div>
                              <span className="label">Email:</span>
                              <span className="value">
                                {app?.candidate?.email}
                              </span>
                            </div>

                            <div>
                              <span className="label">Phone:</span>
                              <span className="value">
                                {app?.candidate?.phone}
                              </span>
                            </div>

                            <div>
                              <span className="label">Experience:</span>
                              <span className="value">
                                {app?.candidate?.experience} Years
                              </span>
                            </div>

                            <div>
                              <span className="label">Current Location:</span>
                              <span className="value">
                                {app?.candidate?.city}
                              </span>
                            </div>

                            {/* <div>
            <span className="label">Status:</span>
            <span className={`status-badge ${app.status.toLowerCase()}`}>
              {app?.status}
            </span>
          </div> */}
                            <div
                              style={{
                                position: "relative",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  color: "#fff",
                                  background: "#668ceeff",
                                  padding: "4px 12px",
                                  borderRadius: "999px",
                                  display: "inline-block",
                                }}
                              >
                                {app.status || "Applied"}
                              </span>

                              {["hr", "admin"].includes(userRole) && (
                                <span
                                  style={{
                                    cursor: "pointer",
                                    marginLeft: "4px",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenStatusId(app._id);
                                  }}
                                >
                                  ✏️
                                </span>
                              )}

                              {openStatusId === app._id && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "0",
                                    left: "45%",
                                    marginLeft: "8px",
                                    background: "#fbfaffff",
                                    borderRadius: "8px",
                                    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                                    minWidth: "160px",
                                    zIndex: 200,
                                    padding: "6px 0",
                                    fontFamily: "Inter, system-ui, sans-serif",
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {[
                                    "Shortlisted",
                                    "Interview",
                                    "Hired",
                                    "Rejected",
                                  ].map((status) => {
                                    const isActive = app.status === status;

                                    return (
                                      <div
                                        key={status}
                                        onClick={() => {
                                          handleStatusChange(app._id, status);
                                          setOpenStatusId(null);
                                        }}
                                        style={{
                                          padding: "10px 14px",
                                          cursor: "pointer",
                                          fontSize: "14px",
                                          fontWeight: isActive ? 700 : 400,
                                          backgroundColor: isActive
                                            ? "#7e9cfdff"
                                            : "transparent",
                                          color: "#111827",
                                        }}
                                      >
                                        {status}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            <div>
                              <span className="label">Applied Date:</span>
                              <span className="value">
                                {new Date(app?.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {app.referredBy && (
                              <div>
                                <span className="label">Reffered By</span>
                                <span className="value">
                                  {app?.referredBy?.name}
                                </span>
                              </div>
                            )}

                            <div>
                              <span className="label">Resume:</span>

                              {app?.candidate?.resumeUrl ? (
                                <>
                                  <a
                                    href={app.candidate.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="resume-link"
                                    style={{ marginRight: "10px" }}
                                  >
                                    View
                                  </a>

                                  <a
                                    href={app.candidate.resumeUrl}
                                    className="resume-link"
                                    download
                                  >
                                    Download
                                  </a>
                                </>
                              ) : (
                                <span className="value">Not uploaded</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-sm custom-outline-btn"
                  style={{ marginRight: "45px", marginBottom: "10px" }}
                  onClick={() => setShowViewPopup(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCareer;
