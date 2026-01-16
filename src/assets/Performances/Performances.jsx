import { useState } from "react";

function Performance() {
    const [showModal, setShowModal] = useState(false);
    const [userName, setUserName] = useState("");
    const [userID, setUserID] = useState("");
    const [userDescription, setUserDescription] = useState("");
    const [manager, setManager] = useState("");
    const [employees, setEmployees] = useState([
        {
            employeeId: "EMP001",
            name: "Rahul Sharma",
            manager: "Mandar",
            department: "IT",
            duration: "1 week",
            rating: "4.5",
            remark: "Excellent",
        },
        {
            employeeId: "EMP002",
            name: "Neha Patil",
            manager: "Swapnil",
            department: "HR",
            duration: "1 day",
            rating: "4.0",
            remark: "Good",
        },
    ]);

    // Function to handle form submission
    const submitRequest = () => {
        const newEmployee = {
            employeeId: userID,
            name: userName,
            manager: manager || "None",
            department: "N/A", // You can add a department field in modal if needed
            rating: "N/A", // Placeholder
            remark: userDescription,
        };
        setEmployees([...employees, newEmployee]);

        // Clear modal fields and close modal
        setUserName("");
        setUserID("");
        setUserDescription("");
        setManager("");
        setShowModal(false);
    };

    return (

        <div className="container-fluid p-4">
            <h2 style={{ color: "#3A5FBE" }}>Performance</h2>

            {/* BUTTON */}
            <button
                className="btn btn-outline-primary btn-sm my-3"
                onClick={() => setShowModal(true)}
            >
                + Request Performance Details
            </button>

            {/* FILTER BAR */}
            <div className="card p-3 mb-3 shadow-sm border-0">
                <div className="d-flex align-items-center">
                    <div className="d-flex align-items-center gap-3 ms-auto">
                        <label
                            style={{
                                color: "#3A5FBE",
                                fontSize: "14px",
                                whiteSpace: "nowrap",
                                marginRight: "auto",
                            }}
                        >
                            Search by Any Field:
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search..."
                            style={{ width: "260px" }}
                        />

                        <button className="btn btn-outline-primary">Filter</button>

                        <button className="btn btn-outline-secondary">Cancel</button>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <>
                    <div
                        className="modal fade show d-block"
                        style={{ background: "rgba(0,0,0,0.5)" }}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div
                                    className="modal-header"
                                    style={{ backgroundColor: "#3A5FBE" }}
                                >
                                    <h5 className="modal-title text-white">
                                        Request Performance Details
                                    </h5>
                                    <button
                                        className="btn-close btn-close-white"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>

                                <div className="modal-body">
                                    <label className="form-label">Your Name</label>
                                    <input
                                        className="form-control"
                                        value={userName}
                                        placeholder="employee name"
                                        onChange={(e) => setUserName(e.target.value)}
                                    />

                                    <label className="form-label mt-3">Employee ID</label>
                                    <input
                                        className="form-control"
                                        value={userID}
                                        placeholder="employee ID"
                                        onChange={(e) => setUserID(e.target.value)}
                                    />

                                    <label className="form-label mt-3">Assigned Manager</label>
                                    <select
                                        className="form-select"
                                        value={manager}
                                        onChange={(e) => setManager(e.target.value)}
                                    >
                                        <option value="">None</option>
                                        <option value="Mandar">Mandar</option>
                                        <option value="Swapnil">Swapnil</option>
                                        <option value="Adesh">Adesh</option>
                                    </select>

                                    <label className="form-label mt-3">Description</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={userDescription}
                                        placeholder="type.."
                                        onChange={(e) => setUserDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={submitRequest}
                                        disabled={!userName || !userID || !userDescription}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-backdrop fade show"></div>
                </>
            )}

            {/* HISTORY TABLE */}
            <h4 className="mt-4">Request History</h4>

            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 bg-white">
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
                                    Employee ID
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
                                    Employee Name
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
                                    Manager
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
                                    Duration
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
                                    Rating
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
                                    Remark
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, index) => (
                                <tr key={index}>
                                    <td>{emp.employeeId}</td>
                                    <td>{emp.name}</td>
                                    <td>{emp.manager}</td>
                                    <td>{emp.department}</td>
                                    <td>{emp.duration}</td>
                                    <td>{emp.rating}</td>
                                    <td>{emp.remark}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Performance;