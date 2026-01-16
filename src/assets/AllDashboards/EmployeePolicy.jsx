
{/* //Added by Rushikesh */ }

import React, { useEffect, useState } from "react";

const STORAGE_KEY = "hr_policy";
const ACK_KEY = "policy_ack_employee";


function EmployeePolicy() {
    const [policies, setPolicies] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const employeeId = localStorage.getItem("employeeId");
    const employeeName =
        localStorage.getItem("employeeName") || "Unknown";

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);



    const [isMobile, setIsMobile] = useState(
        window.innerWidth <= 768
    );
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);





    // 🔹 Load policies + acknowledgement
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setPolicies(JSON.parse(saved));

    }, []);

    // 🔹 Acknowledge policy
    const handleAcknowledge = (policyId, userId, employeeName) => {
        const stored =
            JSON.parse(localStorage.getItem(ACK_KEY)) || {};

        stored[`${policyId}_${userId}`] = {
            policyId,
            employeeId: userId,
            employeeName,
            status: "acknowledged",
            acknowledgedAt: new Date().toISOString()
        };

        localStorage.setItem(ACK_KEY, JSON.stringify(stored));


        setShowModal(false);
        setTimeout(() => setShowModal(true), 0);
    };



    const filteredPolicies = policies.filter((p) => {
        if (!search.trim()) return true;

        const q = search.toLowerCase();
        return (
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.id.toString().includes(q)
        );
    });



    const totalItems = filteredPolicies.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / rowsPerPage)
    );

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

    const currentPolicies = filteredPolicies.slice(startIndex, endIndex);


    // useEffect(() => {
    //   setCurrentPage(1);
    // }, [search]);
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);
    const handleCopyPolicy = () => {
        if (!selectedPolicy) return;

        const textToCopy = `Policy Title: ${selectedPolicy.title}\n\n${selectedPolicy.description}`;

        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("Policy copied to clipboard");
        });
    };
    const handleDownloadPolicy = () => {
        if (!selectedPolicy) return;

        const content = `Policy Title: ${selectedPolicy.title}\n\n${selectedPolicy.description}`;
        const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${selectedPolicy.title}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    const uniqueTitles = [
        ...new Set(policies.map((p) => p.title))
    ];
    const thStyle = {
        padding: "12px 16px",
        fontWeight: 600,
        whiteSpace: "nowrap"
    };

    const tdStyle = {
        padding: "14px 16px",
        verticalAlign: "top"
    };


    const isNewPolicy = (createdAt) => {
        const createdDate = new Date(createdAt);
        const today = new Date();

        const diffDays =
            (today - createdDate) / (1000 * 60 * 60 * 24);

        return diffDays <= 7;
    };

    const isUpdatedPolicy = (createdAt, updatedAt) => {
        if (!updatedAt) return false;
        return new Date(updatedAt) > new Date(createdAt);
    };

    const statusStyle = (status) => {
        switch (status) {
            case "Read":
                return {
                    background: "#dcfce7",
                    color: "#166534"
                };
            case "Pending":
                return {
                    background: "#fde68a",
                    color: "#92400e"
                };
            default:
                return {
                    background: "#e5e7eb",
                    color: "#374151"
                };
        }
    };

    const getAckStatus = (policyId, userId) => {
        const stored = JSON.parse(localStorage.getItem(ACK_KEY)) || {};
        return stored[`${policyId}_${userId}`] || null;
    };
    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-GB");
    };

    const formatDateTime = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleString("en-GB");
    };


    return (
        <div style={{ padding: "24px" }}>
            <h2 style={{ color: "#3A5FBE", marginBottom: "16px" }}>
                Company Policies
            </h2>

            <div
                style={{
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "14px 18px",
                    marginBottom: "14px",
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "flex-start" : "center",
                    justifyContent: "space-between",
                    gap: isMobile ? "10px" : "12px",
                    flexWrap: "wrap",

                    width: "100%",
                    boxSizing: "border-box",
                    overflow: "hidden"
                }}

            >
                <strong
                    style={{
                        color: "#3A5FBE",
                        whiteSpace: "nowrap"
                    }}
                >
                    Search by any feild
                </strong>
                <input
                    type="text"
                    placeholder="Search by any feild..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={{
                        width: "320px",
                        height: "36px",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        padding: "0 10px",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box"
                    }}
                />

                {/* BUTTONS – SAME ROW AS DESKTOP */}
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginLeft: isMobile ? "0" : "auto",
                        width: isMobile ? "100%" : "auto",
                        justifyContent: isMobile ? "flex-end" : "flex-start"
                    }}
                >
                    <button
                        className="btn btn-sm custom-outline-btn"
                        onClick={() => {

                            setCurrentPage(1);
                        }}
                    >
                        Search
                    </button>

                    <button
                        className="btn btn-sm custom-outline-btn"
                        onClick={() => {
                            setSearch("");
                            setCurrentPage(1);
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>









            {/* 📋 Policy List */}
            {filteredPolicies.length === 0 && (
                <p style={{ color: "#6b7280" }}>No policies available</p>
            )}
            <div
                style={{
                    width: "100%",
                    overflowX: "auto",
                    border: "2px solid #e5e7eb",
                    borderRadius: "10px",
                    background: "#fff"
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: "700px"
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                background: "#f8fafc",
                                textAlign: "left",
                                color: "#475569",
                                fontSize: "14px"
                            }}
                        >
                            <th style={thStyle}>#</th>
                            <th style={thStyle}>Policy Title</th>
                            <th style={thStyle}>Description</th>
                            <th style={thStyle}>Created Date</th>
                            <th style={thStyle}>Updated Date</th>
                            <th style={thStyle}>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentPolicies.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ padding: "16px", textAlign: "center" }}>
                                    No policies available
                                </td>
                            </tr>
                        )}

                        {currentPolicies.map((policy) => (
                            <tr
                                key={policy.id}
                                onClick={() => {
                                    setSelectedPolicy(policy);
                                    setShowModal(true);
                                }}
                                style={{
                                    borderTop: "2px solid #e5e7eb",
                                    fontSize: "14px",
                                    color: "#334155",
                                    cursor: "pointer"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#e3e7ebff";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                }}
                            >

                                <td style={tdStyle}>#{policy.id}</td>

                                <td style={{ ...tdStyle, fontWeight: 600, color: "#334155" }}>
                                    {policy.title}
                                    {isNewPolicy(policy.createdAt) && !isUpdatedPolicy(policy.createdAt, policy.updatedAt) && (
                                        <span
                                            style={{
                                                marginLeft: "8px",
                                                background: "#22c55e",
                                                color: "#ffffff",
                                                fontSize: "11px",
                                                padding: "2px 6px",
                                                borderRadius: "6px"
                                            }}
                                        >
                                            NEW
                                        </span>
                                    )}

                                    {/* ✏️ UPDATED */}
                                    {isUpdatedPolicy(policy.createdAt, policy.updatedAt) && (
                                        <span
                                            style={{
                                                marginLeft: "8px",
                                                background: "#f97316",
                                                color: "#ffffff",
                                                fontSize: "11px",
                                                padding: "2px 6px",
                                                borderRadius: "6px"
                                            }}
                                        >
                                            UPDATED
                                        </span>
                                    )}
                                </td>

                                <td style={{ ...tdStyle, lineHeight: "1.6" }}>
                                    {policy.description}
                                </td>


                                <td style={tdStyle}>{formatDate(policy.createdAt)}</td>
                                <td style={tdStyle}>{formatDate(policy.updatedAt)}</td>
                                <td style={tdStyle}>
                                    {(() => {
                                        const ack = getAckStatus(policy.id, employeeId);

                                        return (
                                            <span
                                                style={{
                                                    padding: "6px 14px",
                                                    borderRadius: "8px",
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    background: ack ? "#dcfce7" : "#fde68a",
                                                    color: ack ? "#166534" : "#92400e"
                                                }}
                                            >
                                                {ack ? "Read" : "Pending"}
                                            </span>
                                        );
                                    })()}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>





            {totalItems > 0 && (
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: isMobile ? "center" : "flex-end",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#475569"
                    }}
                >

                    {/* Rows per page */}
                    <span>Rows per page:</span>

                    <select
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            outline: "none",
                            cursor: "pointer"
                        }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                    </select>

                    {/* Range text */}
                    <span>
                        {startIndex + 1}-{endIndex} of {totalItems}
                    </span>

                    {/* Prev */}
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        style={{
                            border: "none",
                            background: "transparent",
                            fontSize: "18px",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            color: currentPage === 1 ? "#cbd5e1" : "#334155"
                        }}
                    >
                        ‹
                    </button>

                    {/* Next */}
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        style={{
                            border: "none",
                            background: "transparent",
                            fontSize: "18px",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                            color: currentPage === totalPages ? "#cbd5e1" : "#334155"
                        }}
                    >
                        ›
                    </button>
                </div>
            )}

            {showModal && selectedPolicy && (() => {
                const ack = getAckStatus(selectedPolicy.id, employeeId);

                return (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.45)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 9999
                        }}
                    >
                        <div
                            style={{
                                width: isMobile ? "95%" : "560px",
                                background: "#ffffff",
                                borderRadius: "14px",
                                overflow: "hidden",
                                boxShadow: "0 20px 40px rgba(0,0,0,0.25)"
                            }}
                        >
                            {/* HEADER */}
                            <div
                                style={{
                                    background: "#3A5FBE",
                                    color: "#ffffff",
                                    padding: "16px 20px",
                                    fontSize: "18px",
                                    fontWeight: 600,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                Company Policy
                                <span
                                    style={{ cursor: "pointer", fontSize: "22px" }}
                                    onClick={() => setShowModal(false)}
                                >
                                    ×
                                </span>
                            </div>

                            {/* BODY */}
                            <div style={{ padding: "20px 24px" }}>
                                <p><strong>Policy ID:</strong> #{selectedPolicy.id}</p>
                                <p><strong>Title:</strong> {selectedPolicy.title}</p>
                                <p><strong>Description:</strong></p>
                                <p>{selectedPolicy.description}</p>

                                {/* VERSION */}
                                <div
                                    style={{
                                        marginTop: "10px",
                                        padding: "8px",
                                        background: "#f8fafc",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "6px",
                                        fontSize: "13px"
                                    }}
                                >
                                    <div>
                                        <strong>Version:</strong>{" "}
                                        {selectedPolicy.version || "1.0"}
                                    </div>
                                    <div
                                        style={{
                                            marginTop: "10px",
                                            padding: "10px 12px",
                                            background: "#f8fafc",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            fontSize: "13px",
                                            lineHeight: "1.6"
                                        }}
                                    >


                                        <div>
                                            <strong>Created Date:</strong>{" "}
                                            {formatDateTime(selectedPolicy.createdAt)}
                                        </div>

                                        <div>
                                            <strong>Last Updated:</strong>{" "}
                                            {formatDateTime(
                                                selectedPolicy.updatedAt || selectedPolicy.createdAt
                                            )}
                                        </div>
                                    </div>

                                </div>

                                <hr />

                                {/* ACK SECTION */}
                                {!ack ? (
                                    <button
                                        className="btn btn-sm custom-outline-btn"
                                        onClick={() =>
                                            handleAcknowledge(
                                                selectedPolicy.id,
                                                employeeId,
                                                employeeName
                                            )
                                        }
                                    >
                                        Read & Acknowledge
                                    </button>
                                ) : (
                                    <span style={{ color: "green", fontWeight: 600 }}>
                                        ✅ Read on {ack.acknowledgedAt}
                                    </span>
                                )}

                                {/* ACTION BUTTONS */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: "8px",
                                        marginTop: "16px"
                                    }}
                                >
                                    <button
                                        className="btn btn-sm custom-outline-btn"
                                        onClick={handleCopyPolicy}
                                    >
                                        Copy
                                    </button>

                                    <button
                                        className="btn btn-sm custom-outline-btn"
                                        onClick={handleDownloadPolicy}
                                    >
                                        Download
                                    </button>

                                    <button
                                        className="btn btn-sm custom-outline-btn"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}




            <div className="text-end mt-3">
                <button
                    style={{ minWidth: 90 }}
                    className="btn btn-sm custom-outline-btn"
                    onClick={() => window.history.go(-1)}
                >
                    Back
                </button>
            </div>
        </div>

    );

}


export default EmployeePolicy;