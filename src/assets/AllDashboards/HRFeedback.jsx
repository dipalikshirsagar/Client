import React, { useEffect, useState } from "react";
import axios from "axios";

const HRFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Pagination state
  const [currentPageSent, setCurrentPageSent] = useState(1);
  const [currentPageReceived, setCurrentPageReceived] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    receiverId: "",
    title: "",
    message: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        );
        const userData = JSON.parse(jsonPayload);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchEmployees();
      fetchFeedbacks();
    }
  }, [currentUser]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await axios.get(
        "https://server-backend-nu.vercel.app/getAllEmployees",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data) {
        const nonHREmployees = response.data.filter(
          (emp) => emp.role !== "hr" && emp._id !== currentUser?._id,
        );
        setEmployees(nonHREmployees || []);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token || !currentUser?._id) {
        console.log("Missing token or user ID");
        return;
      }

      const response = await axios.get(
        `https://server-backend-nu.vercel.app/feedback/employee/${currentUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.success) {
        const apiFeedbacks = (response.data.feedbacks || []).map((fb) => {
          const isSent = fb.sender?._id === currentUser._id;

          return {
            id: fb._id,
            feedbackId:
              fb.feedbackId ||
              `FDB${fb._id ? fb._id.toString().slice(-6) : "000000"}`,
            employeeName: !isSent ? fb.sender?.name : fb.receiver?.name,
            designation: !isSent
              ? fb.sender?.designation
              : fb.receiver?.designation,
            assignedTo: fb.receiver?.name,
            date: fb.createdAt
              ? new Date(fb.createdAt).toLocaleDateString("en-GB")
              : new Date().toLocaleDateString("en-GB"),
            status: fb.status === "viewed" ? "Viewed" : "Pending",
            title: fb.title || "No Title",
            description: fb.message || "No Message",
            type: isSent ? "sent" : "received",
            receiverId: fb.receiver?._id,
            receiverName: fb.receiver?.name,
            senderName: fb.sender?.name,
            senderId: fb.sender?._id,
            readAt: fb.readAt
              ? new Date(fb.readAt).toLocaleString("en-GB")
              : null,
            originalStatus: fb.status,
          };
        });

        setFeedbacks(apiFeedbacks);
      } else {
        setFeedbacks([]);
      }
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setFeedbacks([]);
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!editId && !formData.receiverId) {
      newErrors.receiverId = "Please select an employee or manager";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const markAsViewed = async (feedbackId) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return;
      }

      const response = await axios.put(
        `https://server-backend-nu.vercel.app/feedback/view/${feedbackId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        setFeedbacks((prevFeedbacks) =>
          prevFeedbacks.map((fb) =>
            fb.id === feedbackId
              ? {
                  ...fb,
                  status: "Viewed",
                  readAt: new Date().toLocaleString("en-GB"),
                  originalStatus: "viewed",
                }
              : fb,
          ),
        );

        if (selectedFeedback && selectedFeedback.id === feedbackId) {
          setSelectedFeedback((prev) => ({
            ...prev,
            status: "Viewed",
            readAt: new Date().toLocaleString("en-GB"),
          }));
        }
      }
    } catch (err) {
      console.error("Error marking feedback as viewed:", err);
    }
  };

  const handleSearch = () => setSearchQuery(searchText);

  const handleReset = () => {
    setSearchText("");
    setSearchQuery("");
    setStatusFilter("All");
  };

  const sentFeedbacks = feedbacks.filter((fb) => fb.type === "sent");
  const receivedFeedbacks = feedbacks.filter((fb) => fb.type === "received");

  const filteredReceivedFeedbacks = receivedFeedbacks.filter((fb) => {
    const q = searchQuery.toLowerCase();
    const matchesText =
      q === "" ||
      (fb.feedbackId && fb.feedbackId.toLowerCase().includes(q)) ||
      (fb.employeeName && fb.employeeName.toLowerCase().includes(q)) ||
      (fb.designation && fb.designation.toLowerCase().includes(q)) ||
      (fb.title && fb.title.toLowerCase().includes(q)) ||
      (fb.status && fb.status.toLowerCase().includes(q));
    const matchesStatus = statusFilter === "All" || fb.status === statusFilter;
    return matchesText && matchesStatus;
  });

  const filteredSentFeedbacks = sentFeedbacks.filter((fb) => {
    const q = searchQuery.toLowerCase();
    const matchesText =
      q === "" ||
      (fb.feedbackId && fb.feedbackId.toLowerCase().includes(q)) ||
      (fb.employeeName && fb.employeeName.toLowerCase().includes(q)) ||
      (fb.designation && fb.designation.toLowerCase().includes(q)) ||
      (fb.title && fb.title.toLowerCase().includes(q)) ||
      (fb.status && fb.status.toLowerCase().includes(q));
    return matchesText;
  });

  const totalPagesReceived = Math.ceil(
    filteredReceivedFeedbacks.length / itemsPerPage,
  );
  const indexOfLastItemReceived = Math.min(
    currentPageReceived * itemsPerPage,
    filteredReceivedFeedbacks.length,
  );
  const indexOfFirstItemReceived = (currentPageReceived - 1) * itemsPerPage;
  const currentReceivedFeedbacks = filteredReceivedFeedbacks.slice(
    indexOfFirstItemReceived,
    indexOfLastItemReceived,
  );

  const totalPagesSent = Math.ceil(filteredSentFeedbacks.length / itemsPerPage);
  const indexOfLastItemSent = Math.min(
    currentPageSent * itemsPerPage,
    filteredSentFeedbacks.length,
  );
  const indexOfFirstItemSent = (currentPageSent - 1) * itemsPerPage;
  const currentSentFeedbacks = filteredSentFeedbacks.slice(
    indexOfFirstItemSent,
    indexOfLastItemSent,
  );

  const handlePageChangeSent = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPagesSent) return;
    setCurrentPageSent(pageNumber);
  };

  const handlePageChangeReceived = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPagesReceived) return;
    setCurrentPageReceived(pageNumber);
  };

  const renderPagination = (
    currentPage,
    totalPages,
    totalItems,
    indexOfFirstItem,
    indexOfLastItem,
    setPage,
  ) => (
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
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>

        <span style={{ fontSize: "14px", marginLeft: "16px" }}>
          {totalItems === 0
            ? "0–0 of 0"
            : `${indexOfFirstItem + 1}-${Math.min(
                indexOfLastItem,
                totalItems,
              )} of ${totalItems}`}
        </span>

        <div
          className="d-flex align-items-center"
          style={{ marginLeft: "16px" }}
        >
          <button
            className="btn btn-sm border-0"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ fontSize: "18px", padding: "2px 8px" }}
          >
            ‹
          </button>
          <button
            className="btn btn-sm border-0"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ fontSize: "18px", padding: "2px 8px" }}
          >
            ›
          </button>
        </div>
      </div>
    </nav>
  );

  const openAddForm = () => {
    setEditId(null);
    setFormData({ receiverId: "", title: "", message: "" });
    setShowForm(true);
  };

  const openEditForm = (fb, e) => {
    if (e) e.stopPropagation();
    setEditId(fb.id);
    setFormData({
      receiverId: fb.receiverId || "",
      title: fb.title,
      message: fb.description,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!formData.title || !formData.message || !formData.receiverId) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setSending(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("Please login first");
        setSending(false);
        return;
      }

      let response;

      if (editId) {
        response = await axios.put(
          `https://server-backend-nu.vercel.app/feedback/edit/${editId}`,
          {
            title: formData.title,
            message: formData.message,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
      } else {
        response = await axios.post(
          "https://server-backend-nu.vercel.app/feedback/send",
          {
            receiverId: formData.receiverId,
            title: formData.title,
            message: formData.message,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
      }

      if (response.data.success) {
        await fetchFeedbacks();
        alert(
          editId
            ? "Feedback updated successfully"
            : "Feedback sent successfully",
        );
        setShowForm(false);
        setEditId(null);
        setCurrentPageSent(1);
      } else {
        alert(
          response.data.message ||
            (editId ? "Failed to update feedback" : "Failed to send feedback"),
        );
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert(
        err.response?.data?.message ||
          (editId ? "Failed to update feedback" : "Failed to send feedback"),
      );
    } finally {
      setSending(false);
    }
  };

  const openFeedbackModal = async (feedback) => {
    setSelectedFeedback(feedback);

    if (feedback.type === "received" && feedback.status === "Pending") {
      await markAsViewed(feedback.id);
    }
  };

  const handleRowClick = (feedback) => {
    setSelectedFeedback(feedback);
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this feedback?"))
      return;

    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await axios.delete(`https://server-backend-nu.vercel.app/feedback/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFeedbacks(feedbacks.filter((f) => f.id !== id));
        setCurrentPageSent(1);
        alert("Feedback deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting feedback:", err);
      alert("Failed to delete feedback");
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: "#3A5FBE", fontSize: "25px", marginLeft: "15px" }}>
          Employee Feedback Management
        </h2>
        <button
          className="btn btn-sm custom-outline-btn"
          onClick={openAddForm}
          style={{ minWidth: 140 }}
        >
          Add New Feedback
        </button>
      </div>

      {/* Searchfilter  */}
      <div className="card mb-4 shadow-sm border-0">
        <div className="card-body">
          <form
            className="row g-2 align-items-center"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            style={{ justifyContent: "space-between" }}
          >
            <div className="col-12 col-md-auto d-flex align-items-center gap-2 mb-1">
              <label
                htmlFor="statusFilter"
                className="fw-bold mb-0"
                style={{
                  fontSize: "16px",
                  color: "#3A5FBE",
                  marginRight: "5px",
                  minWidth: "50px",
                }}
              >
                Status
              </label>
              <select
                id="statusFilter"
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Viewed">Viewed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="col-12 col-md-auto d-flex align-items-center gap-2 mb-1">
              <label
                htmlFor="searchInput"
                className="fw-bold mb-0"
                style={{
                  fontSize: "16px",
                  color: "#3A5FBE",
                  marginRight: "5px",
                  minWidth: "120px",
                }}
              >
                Search Feedback
              </label>
              <input
                id="searchInput"
                type="text"
                className="form-control"
                placeholder="Search by any field..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-auto ms-md-auto d-flex gap-2 justify-content-end">
              <button
                type="submit"
                className="btn btn-sm custom-outline-btn"
                style={{ minWidth: 90 }}
              >
                Search
              </button>
              <button
                type="button"
                className="btn btn-sm custom-outline-btn"
                onClick={handleReset}
                style={{ minWidth: 90 }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Received Feedback */}
      <h2 style={{ color: "#3A5FBE", fontSize: "25px", marginLeft: "15px" }}>
        Received Feedback
      </h2>

      {filteredReceivedFeedbacks.length === 0 ? (
        <div className="text-center py-4">
          <p style={{ color: "#6c757d", fontSize: "16px" }}>
            No feedback received yet.
          </p>
        </div>
      ) : (
        <>
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
                      padding: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Feedback ID
                  </th>
                  <th
                    style={{
                      fontWeight: "500",
                      fontSize: "14px",
                      color: "#6c757d",
                      borderBottom: "2px solid #dee2e6",
                      padding: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    From
                  </th>
                  <th
                    style={{
                      fontWeight: "500",
                      fontSize: "14px",
                      color: "#6c757d",
                      borderBottom: "2px solid #dee2e6",
                      padding: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Designation
                  </th>
                  <th
                    style={{
                      fontWeight: "500",
                      fontSize: "14px",
                      color: "#6c757d",
                      borderBottom: "2px solid #dee2e6",
                      padding: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      fontWeight: "500",
                      fontSize: "14px",
                      color: "#6c757d",
                      borderBottom: "2px solid #dee2e6",
                      padding: "10px",
                      whiteSpace: "nowrap",
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
                      padding: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Title
                  </th>
                  <th
                    style={{
                      fontWeight: "500",
                      fontSize: "14px",
                      color: "#6c757d",
                      borderBottom: "2px solid #dee2e6",
                      padding: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentReceivedFeedbacks.map((fb) => (
                  <tr key={fb.id}>
                    <td
                      style={{
                        padding: "10px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fb.feedbackId}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fb.employeeName}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fb.designation || "N/A"}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fb.date}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fb.status === "Viewed" ? (
                        <span
                          style={{
                            backgroundColor: "#d1f2dd",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            fontSize: "13px",
                            fontWeight: "500",
                            display: "inline-block",
                            width: "100px",
                            textAlign: "center",
                          }}
                        >
                          Viewed
                        </span>
                      ) : (
                        <span
                          style={{
                            backgroundColor: "#fff3cd",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            fontSize: "13px",
                            fontWeight: "500",
                            display: "inline-block",
                            width: "100px",
                            textAlign: "center",
                          }}
                        >
                          Pending
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fb.title}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <button
                        className="btn btn-sm custom-outline-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFeedbackModal(fb);
                        }}
                        style={{ minWidth: "80px", padding: "5px 10px" }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination(
            currentPageReceived,
            totalPagesReceived,
            filteredReceivedFeedbacks.length,
            indexOfFirstItemReceived,
            indexOfLastItemReceived,
            handlePageChangeReceived,
          )}
        </>
      )}

      {/* Sent Feedback */}
      <h2 style={{ color: "#3A5FBE", fontSize: "25px", marginLeft: "15px" }}>
        Sent Feedback
      </h2>

      {filteredSentFeedbacks.length === 0 ? (
        <div className="text-center py-4">
          <p style={{ color: "#6c757d", fontSize: "16px" }}>
            No feedback sent yet.
          </p>
        </div>
      ) : (
        <>
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
                      padding: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Feedback ID
                  </th>
                  <th
                    style={{
                      fontWeight: "500",
                      fontSize: "14px",
                      color: "#6c757d",
                      borderBottom: "2px solid #dee2e6",
                      padding: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    To
                  </th>
                  <th
                    style={{
                      fontWeight: "500",
                      fontSize: "14px",
                      color: "#6c757d",
                      borderBottom: "2px solid #dee2e6",
                      padding: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Designation
                  </th>
                  <th
                    style={{
                      fontWeight: "500",
                      fontSize: "14px",
                      color: "#6c757d",
                      borderBottom: "2px solid #dee2e6",
                      padding: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      fontWeight: "500",
                      fontSize: "14px",
                      color: "#6c757d",
                      borderBottom: "2px solid #dee2e6",
                      padding: "10px",
                      whiteSpace: "nowrap",
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
                      padding: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Title
                  </th>
                  <th
                    style={{
                      fontWeight: "500",
                      fontSize: "14px",
                      color: "#6c757d",
                      borderBottom: "2px solid #dee2e6",
                      padding: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentSentFeedbacks.map((fb) => (
                  <tr
                    key={fb.id}
                    style={{
                      cursor: "pointer",
                      backgroundColor: "transparent",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e9ecef";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    onClick={() => handleRowClick(fb)}
                  >
                    <td
                      style={{
                        padding: "10px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fb.feedbackId}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fb.employeeName}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fb.designation || "N/A"}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fb.date}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fb.status === "Viewed" ? (
                        <span
                          style={{
                            backgroundColor: "#d1f2dd",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            fontSize: "13px",
                            fontWeight: "500",
                            display: "inline-block",
                            width: "100px",
                            textAlign: "center",
                          }}
                        >
                          Viewed
                        </span>
                      ) : (
                        <span
                          style={{
                            backgroundColor: "#fff3cd",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            fontSize: "13px",
                            fontWeight: "500",
                            display: "inline-block",
                            width: "100px",
                            textAlign: "center",
                          }}
                        >
                          Pending
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fb.title}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        verticalAlign: "middle",
                        fontSize: "14px",
                        borderBottom: "1px solid #dee2e6",
                        whiteSpace: "nowrap",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm custom-outline-btn"
                          onClick={(e) => {
                            if (fb.status === "Pending") {
                              openEditForm(fb, e);
                            }
                          }}
                          style={{
                            padding: "5px 10px",
                            minWidth: "70px",
                            opacity: fb.status === "Viewed" ? 0.6 : 1,
                            cursor:
                              fb.status === "Viewed"
                                ? "not-allowed"
                                : "pointer",
                          }}
                          disabled={fb.status === "Viewed"}
                        >
                          {fb.status === "Viewed" ? "Edit" : "Edit"}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => handleDelete(fb.id, e)}
                          style={{ padding: "5px 10px", minWidth: "70px" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination(
            currentPageSent,
            totalPagesSent,
            filteredSentFeedbacks.length,
            indexOfFirstItemSent,
            indexOfLastItemSent,
            handlePageChangeSent,
          )}
        </>
      )}

      {/* Modal */}
      {showForm && (
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
            className="modal-dialog"
            style={{ maxWidth: "500px", width: "95%" }}
          >
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: "#3A5FBE" }}
              >
                <h5 className="modal-title mb-0">
                  {editId ? "Edit Feedback" : "Send New Feedback"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                    setFormData({ receiverId: "", title: "", message: "" });
                    setErrors({});
                  }}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      setErrors({ ...errors, title: "" });
                    }}
                    placeholder="Enter feedback title"
                  />

                  {errors.title && (
                    <small className="text-danger">{errors.title}</small>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Send To</label>
                  {editId ? (
                    <div className="form-control bg-light">
                      {employees.find((emp) => emp._id === formData.receiverId)
                        ?.name || "Employee"}
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      value={formData.receiverId}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          receiverId: e.target.value,
                        });
                        setErrors({ ...errors, receiverId: "" });
                      }}
                    >
                      <option value="">Select Employee/Manager</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} - {emp.designation || "No Designation"}
                        </option>
                      ))}
                    </select>
                  )}

                  {errors.receiverId && (
                    <small className="text-danger">{errors.receiverId}</small>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Message</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    maxLength={300}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      setErrors({ ...errors, message: "" });
                    }}
                    placeholder="Enter feedback message"
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
                    {formData.message.length}/300
                  </div>

                  {errors.message && (
                    <small className="text-danger">{errors.message}</small>
                  )}
                </div>
              </div>

              <div className="modal-footer border-0">
                <button
                  className="btn custom-outline-btn"
                  onClick={handleSubmit}
                  disabled={sending || (!editId && employees.length === 0)}
                >
                  {sending
                    ? editId
                      ? "Updating..."
                      : "Sending..."
                    : editId
                      ? "Update Feedback"
                      : "Send Feedback"}
                </button>
                <button
                  className="btn custom-outline-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                    setErrors({});
                    setFormData({ receiverId: "", title: "", message: "" });
                  }}
                  disabled={sending}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedFeedback && (
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
            className="modal-dialog"
            style={{ maxWidth: "600px", width: "95%" }}
          >
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: "#3A5FBE" }}
              >
                <h5 className="modal-title mb-0">Feedback Details</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedFeedback(null)}
                />
              </div>

              <div className="modal-body">
                <div className="container-fluid">
                  <div className="row mb-2">
                    <div className="col-5 col-sm-4 fw-semibold">
                      Feedback ID
                    </div>
                    <div className="col-sm-8 col-5">
                      {selectedFeedback.feedbackId}
                    </div>
                  </div>

                  {selectedFeedback.type === "received" ? (
                    <div className="row mb-2">
                      <div className="col-5 col-sm-4 fw-semibold">From</div>
                      <div className="col-sm-8 col-5">
                        {selectedFeedback.employeeName}
                      </div>
                    </div>
                  ) : (
                    <div className="row mb-2">
                      <div className="col-5 col-sm-4 fw-semibold">To</div>
                      <div className="col-sm-8 col-5">
                        {selectedFeedback.employeeName}
                      </div>
                    </div>
                  )}

                  <div className="row mb-2">
                    <div className="col-5 col-sm-4 fw-semibold">
                      Designation
                    </div>
                    <div className="col-sm-8 col-5">
                      {selectedFeedback.designation || "N/A"}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-5 col-sm-4 fw-semibold">Date</div>
                    <div className="col-sm-8 col-5">
                      {selectedFeedback.date}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-5 col-sm-4 fw-semibold">Status</div>
                    <div className="col-sm-8 col-5">
                      <span
                        className={`badge ${
                          selectedFeedback.status === "Viewed"
                            ? "bg-success"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {selectedFeedback.status}
                      </span>
                    </div>
                  </div>

                  {selectedFeedback.readAt && (
                    <div className="row mb-2">
                      <div className="col-5 col-sm-4 fw-semibold">
                        Viewed At
                      </div>
                      <div className="col-sm-8 col-5">
                        {selectedFeedback.readAt}
                      </div>
                    </div>
                  )}

                  <div className="row mb-2">
                    <div className="col-5 col-sm-4 fw-semibold">Title</div>
                    <div className="col-sm-8 col-5">
                      {selectedFeedback.title}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-5 col-sm-4 fw-semibold">
                      Description
                    </div>
                    <div
                      className="col-sm-8 col-5"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {selectedFeedback.description}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  className="btn custom-outline-btn"
                  onClick={() => setSelectedFeedback(null)}
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
};

export default HRFeedback;
