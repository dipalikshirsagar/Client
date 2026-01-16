// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// const STORAGE_KEY = "hr_policy";

// function HrPolicy() {
//   const { role, username, id } = useParams();
//   const navigate = useNavigate();
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [newPolicy, setNewPolicy] = useState({
//     title: "",
//     description: ""
//   });

//   const canEdit = role === "admin" || role === "hr";

//   const [policies, setPolicies] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");

//   const [showModal, setShowModal] = useState(false);
//   const [selectedPolicy, setSelectedPolicy] = useState(null);
//   const [isEditMode, setIsEditMode] = useState(false);

//   const [policyForm, setPolicyForm] = useState({
//     title: "",
//     description: ""
//   });

//   useEffect(() => {
//     const saved = localStorage.getItem(STORAGE_KEY);
//     setPolicies(
//       saved
//         ? JSON.parse(saved)
//         : [
//           {
//             id: 1,
//             title: "Office Timing",
//             description: "9:30 AM – 6:30 PM"
//           },
//           {
//             id: 2,
//             title: "Lunch Break",
//             description: "1 Hour"
//           },
//           {
//             id: 3,
//             title: "Leave Policy",
//             description: "As per company rules"
//           },
//           {
//             id: 4,
//             title: "Work From Home",
//             description: "Manager approval required"
//           }
//         ]
//     );
//   }, []);

//   const persist = (updated) => {
//     setPolicies(updated);
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
//   };

//   /* ---------- Search ---------- */
//   const handleSearch = () => setSearchQuery(searchText);
//   const handleReset = () => {
//     setSearchText("");
//     setSearchQuery("");
//   };

//   const filteredPolicies = policies.filter((p) =>
//     `${p.title} ${p.description}`
//       .toLowerCase()
//       .includes(searchQuery.toLowerCase())
//   );

//   /* ---------- HR EDIT ---------- */
//   const handleEditClick = (policy) => {
//     setSelectedPolicy(policy);
//     setPolicyForm({
//       title: policy.title,
//       description: policy.description
//     });
//     setIsEditMode(true);
//     setShowModal(true);
//   };

//   const handleSave = () => {
//     persist(
//       policies.map((p) =>
//         p.id === selectedPolicy.id
//           ? { ...p, ...policyForm }
//           : p
//       )
//     );
//     setShowModal(false);
//   };

//   const deletePolicy = (pid) => {
//     if (!window.confirm("Delete this policy?")) return;
//     persist(policies.filter((p) => p.id !== pid));
//   };

//   /* ---------- EMPLOYEE VIEW ---------- */
//   const handleViewClick = (policy) => {
//     setSelectedPolicy(policy);
//     setIsEditMode(false);
//     setShowModal(true);
//   };

//   return (
//     <div style={{ width: "100%" }}>
//       {/* HEADER */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           padding: "24px",
//           marginBottom: "16px",
//           paddingRight: "50px"
//         }}
//       >
//         <h2 style={{ color: "#3A5FBE", margin: 0 }}>HR Policies</h2>

//         {canEdit && (
//           <button
//             className="btn btn-sm custom-outline-btn"
//             onClick={() => setShowAddModal(true)}
//           >
//             Add New Policy
//           </button>

//         )}
//       </div>

//       {/* SEARCH (HR ONLY) */}
//       {canEdit && (
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "12px",
//             background: "#ffffff",
//             padding: "14px 20px",
//             borderRadius: "10px",
//             margin: "0 16px 20px 16px",
//             boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//           }}
//         >
//           <span
//             style={{
//               color: "#3A5FBE",
//               fontWeight: 500,
//               whiteSpace: "nowrap",
//             }}
//           >
//             Search by Any Field
//           </span>
//           <input
//             type="text"
//             value={searchText}
//             onChange={(e) => setSearchText(e.target.value)}
//             placeholder="Search by any field..."
//             style={{
//               width: "420px",        // 👈 width control
//               maxWidth: "100%",
//               padding: "8px 12px",
//               borderRadius: "8px",
//               border: "1px solid #d1d5db",
//               outline: "none",
//             }}
//           />
//           <button
//             className="btn btn-sm custom-outline-btn"
//             onClick={handleSearch}
//             style={{ minWidth: "40px", marginLeft: "600px", }}
//           >
//             Search
//           </button>
//           <button
//             className="btn btn-sm custom-outline-btn"
//             onClick={handleReset}
//             style={{ minWidth: "40px" }}
//           >
//             Reset
//           </button>
//         </div>
//       )}

//       {/* POLICY LIST */}
//       <div
//         style={{
//           background: "#ffffff",
//           padding: "30px",
//           borderRadius: "12px",
//           boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
//           margin: "0 10px"
//         }}
//       >
//         {filteredPolicies.map((policy) => (
//           <div
//             key={policy.id}
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               padding: "14px",
//               borderRadius: "8px",
//               border: "1px solid #e5e7eb",
//               marginBottom: "12px",
//               color: "#3A5FBE"
//             }}
//           >
//             <span style={{ fontSize: "15px" }}>
//               <strong>{policy.title}</strong>: {policy.description}
//             </span>

//             <div style={{ display: "flex", gap: "10px" }}>
//               {canEdit ? (
//                 <>
//                   <button
//                     className="btn btn-sm custom-outline-btn"
//                     onClick={() => handleEditClick(policy)}
//                   >
//                     Edit
//                   </button>
//                   <button
//                     type="button"
//                     className="btn btn-sm"
//                     onClick={() => deletePolicy(policy.id)}
//                     onMouseEnter={(e) => {
//                       e.target.style.backgroundColor = "#dc3545";
//                       e.target.style.color = "#ffffff";
//                       e.target.style.borderColor = "#dc3545";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.target.style.backgroundColor = "transparent";
//                       e.target.style.color = "#dc3545";
//                       e.target.style.borderColor = "#dc3545";
//                     }}
//                     style={{
//                       border: "1px solid #dc3545",
//                       color: "#dc3545",
//                       background: "transparent"
//                     }}
//                   >
//                     Delete
//                   </button>

//                 </>
//               ) : (
//                 <button
//                   className="btn btn-sm custom-outline-btn"
//                   onClick={() => handleViewClick(policy)}
//                 >
//                   View
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {showModal && selectedPolicy && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.5)",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             zIndex: 9999
//           }}
//         >
//           <div
//             style={{
//               background: "#fff",
//               width: "420px",
//               borderRadius: "12px",
//               overflow: "hidden"
//             }}
//           >
//             <div
//               style={{
//                 background: "#3A5FBE",
//                 color: "#fff",
//                 padding: "14px"
//               }}
//             >
//               {isEditMode ? "Edit Policy" : "HR Policy"}
//             </div>

//             <div style={{ padding: "16px" }}>
//               {isEditMode ? (
//                 <>
//                   {/* TITLE */}
//                   <label
//                     style={{
//                       fontSize: "13px",
//                       fontWeight: 500,
//                       marginBottom: "4px",
//                       display: "block"
//                     }}
//                   >
//                     Policy Title
//                   </label>

//                   <input
//                     value={policyForm.title}
//                     onChange={(e) =>
//                       setPolicyForm({
//                         ...policyForm,
//                         title: e.target.value
//                       })
//                     }
//                     style={{
//                       width: "100%",
//                       padding: "8px",
//                       marginBottom: "12px"
//                     }}
//                   />

//                   {/* DESCRIPTION */}
//                   <label
//                     style={{
//                       fontSize: "13px",
//                       fontWeight: 500,
//                       marginBottom: "4px",
//                       display: "block"
//                     }}
//                   >
//                     Policy Description
//                   </label>

//                   <textarea
//                     rows="3"
//                     value={policyForm.description}
//                     onChange={(e) =>
//                       setPolicyForm({
//                         ...policyForm,
//                         description: e.target.value
//                       })
//                     }
//                     style={{
//                       width: "100%",
//                       padding: "8px",
//                       marginBottom: "10px"
//                     }}
//                   />
//                 </>
//               ) : (
//                 <>
//                   <label
//                     style={{
//                       fontSize: "13px",
//                       fontWeight: 500,
//                       marginBottom: "4px",
//                       display: "block"
//                     }}
//                   >
//                     Policy Title
//                   </label>

//                   <div
//                     style={{
//                       width: "100%",
//                       padding: "8px",
//                       marginBottom: "12px",
//                       border: "1px solid #d1d5db",
//                       borderRadius: "4px",
//                       background: "#f9fafb"
//                     }}
//                   >
//                     {selectedPolicy.title}
//                   </div>

//                   <label
//                     style={{
//                       fontSize: "13px",
//                       fontWeight: 500,
//                       marginBottom: "4px",
//                       display: "block"
//                     }}
//                   >
//                     Policy Description
//                   </label>

//                   <div
//                     style={{
//                       width: "100%",
//                       padding: "8px",
//                       marginBottom: "10px",
//                       border: "1px solid #d1d5db",
//                       borderRadius: "4px",
//                       background: "#f9fafb",
//                       whiteSpace: "pre-wrap"
//                     }}
//                   >
//                     {selectedPolicy.description}
//                   </div>
//                 </>

//               )}

//               <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
//                 <button
//                   className="btn btn-sm custom-outline-btn"
//                   onClick={handleSave}
//                 >
//                   Save
//                 </button>
//                 <button
//                   className="btn btn-sm custom-outline-btn"
//                   onClick={() => setShowModal(false)}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//       )}
//       {showAddModal && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.45)",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             zIndex: 9999
//           }}
//         >
//           <div
//             style={{
//               width: "460px",
//               background: "#ffffff",
//               borderRadius: "12px",
//               boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
//               overflow: "hidden"
//             }}
//           >
//             {/* HEADER */}
//             <div
//               style={{
//                 background: "#3A5FBE",
//                 color: "#ffffff",
//                 padding: "14px 18px",
//                 fontSize: "16px",
//                 fontWeight: 600,
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center"
//               }}
//             >
//               Add New Policy
//               <span
//                 onClick={() => setShowAddModal(false)}
//                 style={{ cursor: "pointer", fontSize: "20px" }}
//               >
//                 ×
//               </span>
//             </div>

//             {/* BODY */}
//             <div style={{ padding: "18px" }}>
//               {/* TITLE */}
//               <label style={{ fontSize: "13px", fontWeight: 500 }}>
//                 Policy Title
//               </label>
//               <input
//                 value={newPolicy.title}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   if (/^[a-zA-Z\s]*$/.test(value)) {
//                     setNewPolicy({ ...newPolicy, title: value });
//                   }
//                 }}
//                 placeholder="Enter policy title"
//                 style={{
//                   width: "100%",
//                   padding: "10px 12px",
//                   borderRadius: "8px",
//                   border: "1px solid #d1d5db",
//                   marginTop: "6px",
//                   marginBottom: "14px",
//                   outline: "none"
//                 }}
//               />

//               {/* DESCRIPTION */}
//               <label style={{ fontSize: "13px", fontWeight: 500 }}>
//                 Policy Description
//               </label>
//               <textarea
//                 rows="3"
//                 maxLength={300}
//                 value={newPolicy.description}
//                 onChange={(e) =>
//                   setNewPolicy({ ...newPolicy, description: e.target.value })
//                 }
//                 placeholder="Enter policy description"
//                 style={{
//                   width: "100%",
//                   padding: "10px 12px",
//                   borderRadius: "8px",
//                   border: "1px solid #d1d5db",
//                   marginTop: "6px",
//                   marginBottom: "14px",
//                   outline: "none",
//                   resize: "none"
//                 }}
//               />
//               <div className="char-count"
//                 style={{
//                   display: "flex",
//                   justifyContent: "flex-end",
//                   fontSize: "12px",
//                   color: "#6c757d",
//                   marginTop: "-10px",
//                 }}>
//                 {newPolicy.description.length}/300</div>

//               {/* PDF */}
//               <label style={{ fontSize: "13px", fontWeight: 500 }}>
//                 Upload Policy PDF
//               </label>
//               <input
//                 type="file"
//                 accept="application/pdf"
//                 onChange={(e) =>
//                   setNewPolicy({ ...newPolicy, pdf: e.target.files[0] })
//                 }
//                 style={{
//                   width: "100%",
//                   marginTop: "6px",
//                   fontSize: "13px"
//                 }}
//               />
//             </div>

//             {/* FOOTER */}
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "flex-end",
//                 gap: "12px",
//                 padding: "14px 18px",
//                 borderTop: "1px solid #e5e7eb"
//               }}
//             >
//               <button
//                 type="button"
//                 className="btn btn-sm custom-outline-btn"
//                 onClick={() => setShowAddModal(false)}
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={() => {
//                   if (!newPolicy.title || !newPolicy.description) {
//                     alert("Title and Description required");
//                     return;
//                   }

//                   const updated = [
//                     ...policies,
//                     {
//                       id: Date.now(),
//                       title: newPolicy.title,
//                       description: newPolicy.description,
//                       pdf: newPolicy.pdf ? newPolicy.pdf.name : null
//                     }
//                   ];

//                   setPolicies(updated);
//                   localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

//                   setNewPolicy({ title: "", description: "", pdf: null });
//                   setShowAddModal(false);
//                 }}
//                 className="btn btn-sm custom-outline-btn"
//               >
//                 Save Policy
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// export default HrPolicy;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const STORAGE_KEY = "hr_policy";
const ACK_KEY = "policy_ack_employee";

function HrPolicy() {
  const { role, username, id } = useParams();

  const canEdit = role === "admin" || role === "hr";

  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    title: "",
    description: "",
  });

  const [policies, setPolicies] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [ackMap, setAckMap] = useState({});
  const [employees, setEmployees] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusPolicy, setStatusPolicy] = useState(null);
  const [activeTab, setActiveTab] = useState("read");

  const handleViewClick = (policy) => {
    console.log("Selected Policy:", policy);
    setSelectedPolicy(policy);
    setShowModal(true);
  };

  const getReadEmployees = (policyId) => {
    return Object.values(ackMap).filter((ack) => ack.policyId === policyId);
  };

  const getPendingEmployees = (policyId) => {
    const readIds = getReadEmployees(policyId).map((e) => e.employeeId);

    const allEmployees = JSON.parse(localStorage.getItem("employees")) || [];

    return allEmployees.filter((emp) => !readIds.includes(emp.id));
  };

  const getAckStatus = (policyId, employeeId) => {
    return ackMap?.[`${policyId}_${employeeId}`] || null;
  };
  const getAllAcksForPolicy = (policyId) => {
    return Object.entries(ackMap)
      .filter(([key]) => key.startsWith(`${policyId}_`))
      .map(([_, value]) => value);
  };

  useEffect(() => {
    const syncAck = () => {
      const stored = JSON.parse(localStorage.getItem(ACK_KEY)) || {};
      setAckMap(stored);
    };

    window.addEventListener("storage", syncAck);

    return () => window.removeEventListener("storage", syncAck);
  }, []);

  const [policyForm, setPolicyForm] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    const storedAck =
      JSON.parse(localStorage.getItem("policy_acknowledgements")) || {};
    setAckMap(storedAck);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved && JSON.parse(saved).length > 0) {
      setPolicies(JSON.parse(saved));
    } else {
      const defaultPolicies = [
        {
          id: 1,
          title: "Office Timing :",
          description:
            "Office working hours are from 9:30 AM to 6:30 PM. Employees must follow punctuality.",
          version: "1.0",
          createdAt: today,
          updatedAt: today,
        },
        {
          id: 2,
          title: "Lunch Break :",
          description:
            "Employees are allowed a one-hour lunch break as per team schedule.",
          version: "1.0",
          createdAt: today,
          updatedAt: today,
        },
        {
          id: 3,
          title: "Leave Policy :",
          description:
            "Leaves must be applied in advance and approved by the reporting manager.",
          version: "1.0",
          createdAt: today,
          updatedAt: today,
        },
        {
          id: 4,
          title: "Work From Home :",
          description:
            "Work from home is allowed only with prior approval from the manager.",
          version: "1.0",
          createdAt: today,
          updatedAt: today,
        },
        {
          id: 5,
          title: "Office Timing :",
          description:
            "Office working hours are from 9:30 AM to 6:30 PM. Employees must follow punctuality.",
          version: "1.0",
          createdAt: today,
          updatedAt: today,
        },
        {
          id: 6,
          title: "Lunch Break :",
          description:
            "Employees are allowed a one-hour lunch break as per team schedule.",
          version: "1.0",
          createdAt: today,
          updatedAt: today,
        },
        {
          id: 7,
          title: "Leave Policy:",
          description:
            "Leaves must be applied in advance and approved by the reporting manager.",
          version: "1.0",
          createdAt: today,
          updatedAt: today,
        },
        {
          id: 8,
          title: "Work From Home :",
          description:
            "Work from home is allowed only with prior approval from the manager.",
          version: "1.0",
          createdAt: today,
          updatedAt: today,
        },
      ];

      setPolicies(defaultPolicies);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPolicies));
    }
  }, []);

  const persist = (updated) => {
    setPolicies(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSearch = () => setSearchQuery(searchText);
  const handleReset = () => {
    setSearchText("");
    setSearchQuery("");
  };

  const filteredPolicies = policies.filter((p) =>
    `${p.title || ""} ${p.description || ""}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const totalItems = filteredPolicies.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

  const currentPolicies = filteredPolicies.slice(startIndex, endIndex);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, rowsPerPage]);
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleEditClick = (policy) => {
    setSelectedPolicy(policy);

    setPolicyForm({
      title: policy.title || "",
      description: policy.description || "",
      version: policy.version || "1.0",
      createdAt: policy.createdAt || today,
    });

    setIsEditMode(true);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!selectedPolicy) return;

    const updated = policies.map((p) =>
      p.id === selectedPolicy.id
        ? {
            ...p,
            title: policyForm.title,
            description: policyForm.description,
            version: (parseFloat(p.version || "1.0") + 0.1).toFixed(1),
            updatedAt: new Date().toISOString().split("T")[0],
          }
        : p
    );

    persist(updated);
    setShowModal(false);
  };

  const deletePolicy = (pid) => {
    if (!window.confirm("Delete this policy?")) return;
    persist(policies.filter((p) => p.id !== pid));
  };

  const thStyle = {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "14px 16px",
    fontSize: "14px",
    verticalAlign: "top",
  };

  const isNewPolicy = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    if (isNaN(created)) return false;

    const now = new Date();
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };
  const allEmployees = [
    { id: "101", name: "Rahul" },
    { id: "102", name: "Sneha" },
  ];

  const isUpdatedPolicy = (policy) => {
    if (!policy.createdAt || !policy.updatedAt) return false;
    return policy.updatedAt !== policy.createdAt;
  };

  <button
    onClick={() => {
      if (!newPolicy.title || !newPolicy.description) {
        alert("Title and Description required");
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const updated = [
        ...policies,
        {
          id: Date.now(),
          title: newPolicy.title,
          description: newPolicy.description,
          version: "1.0",
          createdAt: today,
          updatedAt: today,
          pdf: newPolicy.pdf ? newPolicy.pdf.name : null,
        },
      ];

      setPolicies(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      setNewPolicy({ title: "", description: "", pdf: null });
      setShowAddModal(false);
    }}
    className="btn btn-sm custom-outline-btn"
  >
    Save Policy
  </button>;
  useEffect(() => {
    const loadAck = () => {
      const stored = JSON.parse(localStorage.getItem(ACK_KEY)) || {};
      setAckMap(stored);
    };

    loadAck();
    window.addEventListener("storage", loadAck);

    return () => window.removeEventListener("storage", loadAck);
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px",
          marginBottom: "16px",
          paddingRight: "50px",
        }}
      >
        <h2 style={{ color: "#3A5FBE", fontSize: "25px", marginLeft: "15px" }}>
          HR Policies
        </h2>

        {canEdit && (
          <button
            className="btn btn-sm custom-outline-btn"
            onClick={() => setShowAddModal(true)}
          >
            Add New Policy
          </button>
        )}
      </div>

      {canEdit && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "#ffffff",
            padding: "14px 20px",
            borderRadius: "10px",
            margin: "0 16px 20px 16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            flexWrap: "wrap", //add
          }}
        >
          <span
            style={{
              color: "#3A5FBE",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Search by Any Field
          </span>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by any field..."
            style={{
              width: "420px",
              maxWidth: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              outline: "none",
              flex: "1",
            }}
          />

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap", //add
            }}
          >
            <button
              className="btn btn-sm custom-outline-btn"
              onClick={handleSearch}
            >
              Search
            </button>
            <button
              className="btn btn-sm custom-outline-btn"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          width: "100%",
          overflowX: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          background: "#ffffff",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "800px",
          }}
        >
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Policy Title</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Read Date & Time</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {currentPolicies.map((policy) => (
              <tr key={policy.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={tdStyle}>#{policy.id}</td>

                {/* ✅ TITLE + BADGES */}
                <td style={{ ...tdStyle, fontWeight: 600 }}>
                  {policy.title}

                  {/* 🆕 NEW */}
                  {isNewPolicy(policy.createdAt) && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "11px",
                        background: "#dcfce7",
                        color: "#166534",
                        padding: "2px 6px",
                        borderRadius: "6px",
                        fontWeight: 600,
                      }}
                    >
                      NEW
                    </span>
                  )}

                  {/* ✏️ UPDATED */}
                  {isUpdatedPolicy(policy) && (
                    <span
                      style={{
                        marginLeft: "6px",
                        fontSize: "11px",
                        background: "#e0f2fe",
                        color: "#075985",
                        padding: "2px 6px",
                        borderRadius: "6px",
                        fontWeight: 600,
                      }}
                    >
                      UPDATED
                    </span>
                  )}
                </td>

                <td style={tdStyle}>{policy.description}</td>

                <td style={tdStyle}>
                  <button
                    className="btn btn-sm custom-outline-btn"
                    onClick={() => {
                      setStatusPolicy(policy);
                      setShowStatusModal(true);
                    }}
                  >
                    View Status
                  </button>
                </td>

                <td style={tdStyle}>
                  {(() => {
                    const acks = getAllAcksForPolicy(policy.id);

                    if (acks.length === 0) return "-";

                    const latest = acks
                      .map((a) => new Date(a.acknowledgedAt))
                      .sort((a, b) => b - a)[0];

                    return latest.toLocaleString();
                  })()}
                </td>

                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {canEdit ? (
                      <>
                        <button
                          className="btn btn-sm custom-outline-btn"
                          onClick={() => handleEditClick(policy)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => deletePolicy(policy.id)}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#dc3545";
                            e.target.style.color = "#ffffff";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = "#dc3545";
                          }}
                          style={{
                            border: "1px solid #dc3545",
                            color: "#dc3545",
                            background: "transparent",
                          }}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-sm custom-outline-btn"
                        onClick={() => handleViewClick(policy)}
                      >
                        View
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedPolicy && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "420px",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#3A5FBE",
                color: "#fff",
                padding: "14px",
              }}
            >
              {isEditMode ? "Edit Policy" : "HR Policy"}
            </div>

            <div style={{ padding: "16px" }}>
              {isEditMode ? (
                <>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Policy Title
                  </label>

                  <input
                    value={policyForm.title}
                    onChange={(e) =>
                      setPolicyForm({
                        ...policyForm,
                        title: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginBottom: "12px",
                    }}
                  />

                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Policy Description
                  </label>

                  <textarea
                    rows="3"
                    value={policyForm.description}
                    onChange={(e) =>
                      setPolicyForm({
                        ...policyForm,
                        description: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginBottom: "10px",
                    }}
                  />
                </>
              ) : (
                <>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Policy Title
                  </label>

                  <div
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginBottom: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      background: "#f9fafb",
                    }}
                  >
                    {selectedPolicy.title}
                  </div>

                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Policy Description
                  </label>

                  <div
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginBottom: "10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      background: "#f9fafb",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedPolicy.description}
                  </div>
                </>
              )}
              <h4>Read Employees</h4>
              <ul>
                {getReadEmployees(selectedPolicy.id).map((e) => (
                  <li key={e.employeeId}>
                    {e.employeeName} – {e.acknowledgedAt}
                  </li>
                ))}
              </ul>

              <h4>Pending Employees</h4>
              <ul>
                {getPendingEmployees(selectedPolicy.id).map((e) => (
                  <li key={e.id}>{e.name}</li>
                ))}
              </ul>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "16px",
                }}
              >
                <button
                  className="btn btn-sm custom-outline-btn"
                  onClick={handleSave}
                >
                  Save
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
      )}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "460px",
              background: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#3A5FBE",
                color: "#ffffff",
                padding: "14px 18px",
                fontSize: "16px",
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Add New Policy
              <span
                onClick={() => setShowAddModal(false)}
                style={{ cursor: "pointer", fontSize: "20px" }}
              >
                ×
              </span>
            </div>

            <div style={{ padding: "18px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500 }}>
                Policy Title
              </label>
              <input
                value={newPolicy.title}
                onChange={(e) =>
                  setNewPolicy({ ...newPolicy, title: e.target.value })
                }
                placeholder="Enter policy title"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  marginTop: "6px",
                  marginBottom: "14px",
                  outline: "none",
                }}
              />

              <label style={{ fontSize: "13px", fontWeight: 500 }}>
                Policy Description
              </label>
              <textarea
                rows="3"
                value={newPolicy.description}
                onChange={(e) =>
                  setNewPolicy({ ...newPolicy, description: e.target.value })
                }
                placeholder="Enter policy description"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  marginTop: "6px",
                  marginBottom: "14px",
                  outline: "none",
                  resize: "none",
                }}
              />

              <label style={{ fontSize: "13px", fontWeight: 500 }}>
                Upload Policy PDF
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  setNewPolicy({ ...newPolicy, pdf: e.target.files[0] })
                }
                style={{
                  width: "100%",
                  marginTop: "6px",
                  fontSize: "13px",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                padding: "14px 18px",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                type="button"
                className="btn btn-sm custom-outline-btn"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!newPolicy.title || !newPolicy.description) {
                    alert("Title and Description required");
                    return;
                  }

                  const updated = [
                    ...policies,
                    {
                      id: Date.now(),
                      title: newPolicy.title,
                      description: newPolicy.description,
                      pdf: newPolicy.pdf ? newPolicy.pdf.name : null,
                    },
                  ];

                  setPolicies(updated);
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

                  setNewPolicy({ title: "", description: "", pdf: null });
                  setShowAddModal(false);
                }}
                className="btn btn-sm custom-outline-btn"
              >
                Save Policy
              </button>
            </div>
          </div>
        </div>
      )}
      {totalItems > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "14px",
            padding: "12px 16px",
            fontSize: "14px",
            color: "#475569",
            borderTop: "1px solid #e5e7eb",
            marginTop: "18px",
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
              cursor: "pointer",
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>

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
              color: currentPage === 1 ? "#cbd5e1" : "#334155",
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
              color: currentPage === totalPages ? "#cbd5e1" : "#334155",
            }}
          >
            ›
          </button>
        </div>
      )}

      <div className="text-end mt-3">
        <button
          style={{ minWidth: 90 }}
          className="btn btn-sm custom-outline-btn"
          onClick={() => window.history.go(-1)}
        >
          Back
        </button>
      </div>
      {showStatusModal &&
        statusPolicy &&
        (() => {
          const readEmployees = getAllAcksForPolicy(statusPolicy.id);

          const pendingEmployees = allEmployees.filter(
            (emp) => !readEmployees.some((r) => r.employeeId === emp.id)
          );

          return (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  width: "520px",
                  background: "#fff",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {/* HEADER */}
                <div
                  style={{
                    background: "#3A5FBE",
                    color: "#fff",
                    padding: "14px 18px",
                    fontWeight: 600,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  Policy Status – {statusPolicy.title}
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowStatusModal(false)}
                  >
                    ✕
                  </span>
                </div>

                {/* TABS */}
                <div
                  style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}
                >
                  <button
                    onClick={() => setActiveTab("read")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      border: "none",
                      background:
                        activeTab === "read" ? "#e0e7ff" : "transparent",
                      fontWeight: 600,
                    }}
                  >
                    Read
                  </button>
                  <button
                    onClick={() => setActiveTab("pending")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      border: "none",
                      background:
                        activeTab === "pending" ? "#fde68a" : "transparent",
                      fontWeight: 600,
                    }}
                  >
                    Pending
                  </button>
                </div>

                {/* CONTENT */}
                <div
                  style={{
                    padding: "16px",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {activeTab === "read" && (
                    <>
                      {readEmployees.length === 0 ? (
                        <p>No employee has read this policy.</p>
                      ) : (
                        <table width="100%">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Date & Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {readEmployees.map((e) => {
                              const emp = allEmployees.find(
                                (x) => x.id === e.employeeId
                              );

                              return (
                                <tr key={e.employeeId}>
                                  <td>{e.employeeId}</td>
                                  <td>{emp?.name || "-"}</td>
                                  <td>
                                    {new Date(
                                      e.acknowledgedAt
                                    ).toLocaleString()}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </>
                  )}

                  {activeTab === "pending" && (
                    <>
                      {pendingEmployees.length === 0 ? (
                        <p>All employees have read this policy.</p>
                      ) : (
                        <table width="100%">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingEmployees.map((e) => (
                              <tr key={e.id}>
                                <td>{e.id}</td>
                                <td>{e.name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

export default HrPolicy;
