import React, { useState } from "react";

function Resignation() {
    const [requests, setRequests] = useState([
        {
            id: "RES001",
            empId: "EMP001",
            name: "Rushikesh Takale",
            designation: "Software Engineer",
            dept: "IT",
            joiningDate: "01-06-2023",
            reportingManager: "Sagar Patil",
            applyDate: "29-12-2025",
            lwd: "31-01-2026",
            reason: "Career Growth",
            status: "Pending",
        },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [editedLwd, setEditedLwd] = useState("");
    const [comment, setComment] = useState("");
    const [viewType, setViewType] = useState("current");
    const [searchText, setSearchText] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const filteredRequests = requests.filter((r) => {
        const search = appliedSearch.toLowerCase();

        const matchesSearch =
            r.id.toLowerCase().includes(search) ||
            r.empId.toLowerCase().includes(search) ||
            r.name.toLowerCase().includes(search) ||
            r.designation.toLowerCase().includes(search) ||
            r.dept.toLowerCase().includes(search) ||
            r.status.toLowerCase().includes(search) ||
            r.reportingManager.toLowerCase().includes(search) ||
            r.applyDate.toLowerCase().includes(search) ||
            r.lwd.toLowerCase().includes(search);

        const matchesView =
            viewType === "current"
                ? r.status === "Pending"
                : r.status !== "Pending";

        return matchesSearch && matchesView;
    });



    // OPEN MODAL
    const openModal = (item) => {
        setSelected(item);
        setEditedLwd(item.lwd);
        setComment("");
        setShowModal(true);
    };

    // CLOSE MODAL
    const closeModal = () => {
        setShowModal(false);
        setSelected(null);
    };

    // APPROVE
    const handleApprove = () => {
        setRequests((prev) =>
            prev.map((r) =>
                r.id === selected.id
                    ? { ...r, status: "Approved", lwd: editedLwd }
                    : r
            )
        );
        closeModal();
    };

    // REJECT
    const handleReject = () => {
        if (!comment.trim()) {
            alert("Please enter rejection reason");
            return;
        }

        setRequests((prev) =>
            prev.map((r) =>
                r.id === selected.id ? { ...r, status: "Rejected" } : r
            )
        );
        closeModal();
    };

    const handleSearch = () => {
        setAppliedSearch(searchText);
    };
    const handleReset = () => {
        setSearchText("");
        setAppliedSearch("");
    };


    return (
        <div style={{ padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
            <h2 style={{ color: "#3A5FBE", marginBottom: "16px" }}>
                HR – Resignation Requests
            </h2>
            <div
                style={{
                    background: "#ffffff",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #e5e7eb",
                    marginBottom: "16px",
                }}
            >
                {/* SMALL LABEL */}
                <div
                    style={{
                        fontSize: "15px",        // 👈 size कमी
                        fontWeight: "500",
                        color: "#3A5FBE",
                        whiteSpace: "nowrap",
                    }}
                >
                    Search by any feild
                </div>

                {/* INPUT */}
                <input
                    type="text"
                    placeholder="Search by any field..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{
                        width: "320px",         // 👈 MAIN FIX (adjust as needed)
                        height: "34px",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5f5",
                        outline: "none",
                        fontSize: "13px",
                    }}
                />

                {/* SEARCH BUTTON */}
                <button
                    onClick={handleSearch}
                    className="btn btn-sm custom-outline-btn"
                    style={{
                        marginLeft: "800px",
                    }}
                >
                    Search
                </button>

                {/* RESET BUTTON */}
                <button
                    onClick={handleReset}
                    className="btn btn-sm custom-outline-btn"
                >
                    Reset
                </button>
            </div>


            <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                <button
                    onClick={() => setViewType("current")}
                    className="btn btn-sm custom-outline-btn"
                >
                    Current Requests
                </button>

                <button
                    onClick={() => setViewType("previous")}
                    className="btn btn-sm custom-outline-btn"
                >
                    Previous Requests
                </button>
            </div>

            {/* ===== TABLE ===== */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                }}
            >


                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#3A5FBE", color: "#fff" }}>
                            <th style={th}>Resignation ID</th>
                            <th style={th}>Employee ID</th>
                            <th style={th}>Employee Name</th>
                            <th style={th}>Designation</th>
                            <th style={th}>Department</th>
                            <th style={th}>Apply Date</th>
                            <th style={th}>LWD</th>
                            <th style={th}>Status</th>
                            <th style={th}>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredRequests.map((r) => (

                            <tr key={r.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                <td style={td}>{r.id}</td>
                                <td style={td}>{r.empId}</td>
                                <td style={td}>{r.name}</td>
                                <td style={td}>{r.designation}</td>
                                <td style={td}>{r.dept}</td>
                                <td style={td}>{r.applyDate}</td>
                                <td style={td}>{r.lwd}</td>
                                <td style={td}>
                                    <span style={statusPill(r.status)}>{r.status}</span>
                                </td>
                                <td style={td}>
                                    <button className="btn btn-sm custom-outline-btn" onClick={() => openModal(r)}>
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ===== MODAL ===== */}
            {showModal && selected && (

                <div style={overlay}>
                    <div style={modal}>
                        {/* MODAL HEADER */}
                        <div style={modalHeader}>Resignation Details</div>

                        {/* MODAL BODY */}
                        <div style={{ padding: "16px", fontSize: "14px" }}>
                            {/* Employee Info */}
                            <div style={section}>
                                <h4 style={sectionTitle}>Employee Information</h4>
                                <p><b>Employee ID:</b> {selected.empId}</p>
                                <p><b>Name:</b> {selected.name}</p>
                                <p><b>Designation:</b> {selected.designation}</p>
                                <p><b>Department:</b> {selected.dept}</p>
                                <p><b>Joining Date:</b> {selected.joiningDate}</p>
                                <p><b>Reporting Manager:</b> {selected.reportingManager}</p>
                            </div>

                            {/* Resignation Info */}
                            <div style={section}>
                                <h4 style={sectionTitle}>Resignation Information</h4>
                                <p><b>Apply Date:</b> {selected.applyDate}</p>
                                <p><b>Reason:</b> {selected.reason}</p>
                                <p>
                                    <b>Status:</b>{" "}
                                    <span style={statusPill(selected.status)}>
                                        {selected.status}
                                    </span>
                                </p>
                            </div>

                            {/* HR Action */}
                            <div style={section}>
                                <h4 style={sectionTitle}>HR Action</h4>

                                <label><b>Last Working Day</b></label>
                                <input
                                    type="date"
                                    value={editedLwd}
                                    onChange={(e) => setEditedLwd(e.target.value)}
                                    style={input}
                                />

                                <textarea
                                    placeholder="Rejection comment (required if rejecting)"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    style={textarea}
                                />
                            </div>

                            {/* Buttons */}
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button style={approveBtn} onClick={handleApprove}>
                                    Approve
                                </button>
                                <button style={rejectBtn} onClick={handleReject}>
                                    Reject
                                </button>
                                <button className="btn btn-sm custom-outline-btn" onClick={closeModal}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ===== STYLES ===== */

const th = {
    padding: "12px",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "left",
};

const td = {
    padding: "12px",
    fontSize: "13px",
    color: "#0f172a",
};

const statusPill = (status) => ({
    padding: "4px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    background:
        status === "Pending"
            ? "#fde68a"
            : status === "Approved"
                ? "#bbf7d0"
                : "#fecaca",
    color:
        status === "Pending"
            ? "#92400e"
            : status === "Approved"
                ? "#065f46"
                : "#7f1d1d",
});
const toggleBtn = {
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
};

const viewBtn = {
    border: "1px solid #3A5FBE",
    background: "#fff",
    color: "#3A5FBE",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
};

const overlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
};

const modal = {
    width: "480px",
    background: "#ffffff",
    borderRadius: "12px",
    overflow: "hidden",
};

const modalHeader = {
    background: "#3A5FBE",
    color: "#ffffff",
    padding: "14px 18px",
    fontSize: "18px",
    fontWeight: "500",
};

const section = {
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "1px solid #e5e7eb",
};

const sectionTitle = {
    color: "#3A5FBE",
    fontSize: "15px",
    marginBottom: "6px",
};

const input = {
    width: "100%",
    padding: "8px",
    marginTop: "6px",
};

const textarea = {
    width: "100%",
    height: "70px",
    marginTop: "10px",
    padding: "8px",
};

const approveBtn = {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
};

const rejectBtn = {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
};

const cancelBtn = {
    background: "#e5e7eb",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
};

export default Resignation;