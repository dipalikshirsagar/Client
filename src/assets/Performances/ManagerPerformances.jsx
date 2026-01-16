import React, { useState } from "react";

export default function ManagerPerformances() {
    const [rows, setRows] = useState([
        {
            requestId: "REQ-101",
            requestDate: "05 Dec 2025",
            empId: "EMP01",
            empName: "Riya Patil",
            description: "Late check-in",
            status: "Pending",
            rating: "",
            recommendation: "",
            remark: "",
        },
        {
            requestId: "REQ-102",
            requestDate: "06 Dec 2025",
            empId: "EMP02",
            empName: "Sneha Kulkarni",
            description: "WFH request",
            status: "Rated",
            rating: "4.5",
            recommendation: "Promotion",
            remark: "Good performance",
        },
        {
            requestId: "REQ-103",
            requestDate: "31 Dec 2025",
            empId: "EMP03",
            empName: "Shiva Patil",
            description: "Late check-in",
            status: "Pending",
            rating: "",
            recommendation: "",
            remark: "",
        },
    ]);

    const [selectedRow, setSelectedRow] = useState(null);

    const statusStyle = (status) => ({
        padding: "4px 12px",
        borderRadius: 12,
        fontSize: 12,
        color: "#fff",
        background: status === "Pending" ? "#F0AD4E" : "#5CB85C",
    });

    /* 🔹 SUBMIT HANDLER */
    const handleSubmit = () => {
        setRows((prev) =>
            prev.map((r) =>
                r.requestId === selectedRow.requestId
                    ? {
                        ...selectedRow,
                        status: selectedRow.rating ? "Rated" : r.status,
                    }
                    : r
            )
        );
        setSelectedRow(null);
    };

    return (
        <div style={container}>
            <h2 style={{ color: "#3A5FBE" }}>Performance</h2>

            <div style={card}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            {[
                                "Request ID",
                                "Request Date",
                                "Employee ID",
                                "Employee Name",
                                "Description",
                                "Status",
                                "Action",
                            ].map((h) => (
                                <th key={h} style={th}>{h}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, i) => (
                            <tr
                                key={i}
                                style={tr}
                                tabIndex={0}
                                onClick={() => setSelectedRow({ ...row })}
                            >
                                <td style={linkTd}>{row.requestId}</td>
                                <td style={td}>{row.requestDate}</td>
                                <td style={td}>{row.empId}</td>
                                <td style={td}>{row.empName}</td>
                                <td style={td}>{row.description}</td>
                                <td style={td}>
                                    <span style={statusStyle(row.status)}>
                                        {row.status}
                                    </span>
                                </td>
                                <td style={td} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        style={actionBtn}
                                        onClick={() => setSelectedRow({ ...row })}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        style={actionBtn}
                                        onClick={() => setSelectedRow({ ...row })}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 🔹 COMMON MODAL */}
            {selectedRow && (
                <Modal onClose={() => setSelectedRow(null)}>
                    <div style={modalHeaderBlue}>
                        Request ID : {selectedRow.requestId}
                    </div>

                    {infoRow("Employee Name", selectedRow.empName)}
                    {infoRow("Employee ID", selectedRow.empId)}
                    {infoRow("Request Date", selectedRow.requestDate)}
                    {infoRow("Description", selectedRow.description)}
                    {infoRow("Status", selectedRow.status)}

                    {/* RATING */}
                    <div style={field}>
                        <label style={label}>Rating</label>
                        <select
                            style={input}
                            value={selectedRow.rating}
                            onChange={(e) =>
                                setSelectedRow({
                                    ...selectedRow,
                                    rating: e.target.value,
                                })
                            }
                        >
                            <option value="">Select</option>
                            {[...Array(50)].map((_, i) => (
                                <option key={i} value={(i + 1) / 10}>
                                    {(i + 1) / 10}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* RECOMMENDATION */}
                    <div style={field}>
                        <label style={label}>Recommendation</label>
                        <select
                            style={input}
                            value={selectedRow.recommendation}
                            onChange={(e) =>
                                setSelectedRow({
                                    ...selectedRow,
                                    recommendation: e.target.value,
                                })
                            }
                        >
                            <option value="">Select</option>
                            <option>Promotion</option>
                            <option>Demotion</option>
                            <option>Status Quo</option>
                        </select>
                    </div>

                    {/* REMARK */}
                    <div style={field}>
                        <label style={label}>Remark</label>
                        <textarea
                            style={{
                                ...input,
                                resize: "vertical",
                                minHeight: 70,
                            }}
                            value={selectedRow.remark}
                            onChange={(e) =>
                                setSelectedRow({
                                    ...selectedRow,
                                    remark: e.target.value,
                                })
                            }
                            placeholder="Enter remark"
                        />
                    </div>

                    {/* BUTTONS */}
                    <div style={buttonRow}>
                        <button style={primaryBtn} onClick={handleSubmit}>
                            Submit
                        </button>
                        <button
                            style={secondaryBtn}
                            onClick={() => setSelectedRow(null)}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

/* 🔹 MODAL */
function Modal({ children, onClose }) {
    return (
        <div style={overlay} onClick={onClose}>
            <div style={modal} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

/* 🔹 INFO ROW */
const infoRow = (labelText, value) => (
    <div style={infoRowStyle}>
        <span style={infoLabel}>{labelText}</span>
        <span style={infoValue}>{value || "-"}</span>
    </div>
);

/* 🔹 STYLES (same as before) */
const container = { padding: 20, background: "#f5f6fa", minHeight: "100vh" };
const card = { background: "#fff", padding: 15, borderRadius: 8 };
const th = { padding: 12, borderBottom: "1px solid #ddd", color: "#666" };
const td = { padding: 12, borderBottom: "1px solid #eee", color: "#555" };
const linkTd = { ...td, color: "#3A5FBE", fontWeight: 500 };
const tr = { cursor: "pointer" };
const actionBtn = {
    background: "#fff",
    border: "1px solid #3A5FBE",
    color: "#3A5FBE",
    padding: "4px 10px",
    borderRadius: 5,
    marginRight: 6,
};
const overlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
};
const modal = {
    background: "#fff",
    width: "95%",
    maxWidth: 420,
    padding: 20,
    borderRadius: 8,
};
const modalHeaderBlue = {
    background: "#3A5FBE",
    color: "#fff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
};
const field = { marginBottom: 12 };
const label = { fontSize: 13, color: "#777" };
const input = {
    width: "100%",
    padding: 8,
    borderRadius: 6,
    border: "1px solid #ccc",
};
const buttonRow = {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    flexWrap: "wrap",
};
const primaryBtn = {
    background: "#3A5FBE",
    color: "#fff",
    border: "none",
    padding: "8px 18px",
    borderRadius: 6,
    minWidth: 120,
};
const secondaryBtn = {
    background: "#fff",
    border: "1px solid #3A5FBE",
    color: "#3A5FBE",
    padding: "8px 18px",
    borderRadius: 6,
    minWidth: 120,
};
const infoRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
};
const infoLabel = { color: "#777" };
const infoValue = { color: "#444", fontWeight: 500 };