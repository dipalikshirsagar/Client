// import React, { useState,useEffect} from "react";
// import dayjs from "dayjs";

// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { TimePicker } from "@mui/x-date-pickers/TimePicker";
// import TextField from "@mui/material/TextField";
// import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
// import axios from "axios";
// import "./Tasklog.css";

// const EmployeeTasklog = ({user}) => {
//   const [logs, setLogs] = useState([]);
//   const [tasks, setTasks] = useState([]);
//   const [modalMode, setModalMode] = useState("add"); 
//   const [showModal, setShowModal] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [filterDate, setFilterDate] = useState("");
//   const [filteredLogs, setFilteredLogs] = useState([]);
//   const [editIndex, setEditIndex] = useState(null);
//   const [todayTasks, setTodayTasks] = useState([]);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const isMobile = window.innerWidth <= 768;
//   const token = localStorage.getItem("accessToken");
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [viewData, setViewData] = useState(null);


// const getTaskDayNumber = (startDate, endDate) => {
//   if (!startDate || !endDate) return null;

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const start = new Date(startDate);
//   start.setHours(0, 0, 0, 0);

//   const end = new Date(endDate);
//   end.setHours(0, 0, 0, 0);

//   // Today outside task period
//   if (today < start || today > end) return null;

//   let count = 0;
//   let current = new Date(start);

//   while (current <= today) {
//     const day = current.getDay(); // 0 = Sunday, 6 = Saturday
//     const date = current.getDate();

//     // Exclude Sundays
//     if (day === 0) {
//       current.setDate(current.getDate() + 1);
//       continue;
//     }

//     // Exclude first and third Saturdays
//     if (
//       day === 6 &&
//       (date <= 7 || (date >= 15 && date <= 21))
//     ) {
//       current.setDate(current.getDate() + 1);
//       continue;
//     }

//     count++;
//     current.setDate(current.getDate() + 1);
//   }

//   return count;
// };


//  const isToday = (dateString) => {
//   if (!dateString) return false;

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const date = new Date(dateString);
//   date.setHours(0, 0, 0, 0);

//   return today.getTime() === date.getTime();
// };
// function getWorkingDays(startIso, endIso) {
//   const start = new Date(startIso);
//   const end = new Date(endIso);
//   let count = 0;

//   // Helper to check if a date is 1st or 3rd Saturday
//   function isFirstOrThirdSaturday(date) {
//     if (date.getDay() !== 6) return false; // Not Saturday
//     const day = date.getDate();
//     const weekNumber = Math.ceil(day / 7);
//     return weekNumber === 1 || weekNumber === 3;
//   }

//   for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
//     const dayOfWeek = d.getDay();
//     if (dayOfWeek === 0) continue; // Skip Sunday
//     if (isFirstOrThirdSaturday(d)) continue; // Skip 1st & 3rd Saturday
//     count++;
//   }

//   return count;
// }

// // Example usage:
// const totalDays = getWorkingDays("2026-01-01T00:00:00.000Z", "2026-01-15T00:00:00.000Z");
// console.log(totalDays); // Correct total working days


  
// const formatDate = (dateString) =>
//     new Intl.DateTimeFormat("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric"
//     }).format(new Date(dateString));
// const formatDateWithoutYear = (dateString) =>
//   new Intl.DateTimeFormat("en-GB", {
//     day: "2-digit",
//     month: "short",
//   }).format(new Date(dateString));

//    useEffect(() => {
//       fetchLogs();    
//     }, []);
//   const fetchLogs = async () => {
//     try {
//       const logRes = await fetch(`https://server-backend-nu.vercel.app/api/tasklogs/employee/${user._id}`);
//       const logsData = await logRes.json();
//       const taskRes = await fetch(`https://server-backend-nu.vercel.app/tasks/assigned/${user._id}`);
//       const tasksData = await taskRes.json();
//       setLogs(logsData);
//       setTasks(tasksData.tasks);
//     } catch (err) {
//       console.error("Failed to fetch jobs", err);
//     } finally {
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Submitted":
//         return {
//           backgroundColor: '#d1f2dd',
//           padding: '8px 16px',
//           borderRadius: '4px',
//           fontSize: '13px',
//           fontWeight: '500',
//           display: 'inline-block',
//           width: "120px",
//           textAlign: "center",
//           color: '#0f5132'
//         };
//       case "InProgress":
//         return {
//           backgroundColor: '#d1e7ff',
//           padding: '7px 16px',
//           borderRadius: '4px',
//           fontSize: '13px',
//           fontWeight: '500',
//           display: 'inline-block',
//           width: "120px",
//           textAlign: "center",
//           color: '#0d6efd'
//         };
//       case "Pending":
//         return {
//           backgroundColor: '#FFE493',
//           padding: '8px 16px',
//           borderRadius: '4px',
//           fontSize: '13px',
//           fontWeight: '500',
//           display: 'inline-block',
//           width: "120px",
//           textAlign: "center",
//           color: '#664d03'
//         };
//       case "Approved":
//         return {
//           backgroundColor: '#f1dabfff',
//           padding: '8px 16px',
//           borderRadius: '4px',
//           fontSize: '13px',
//           fontWeight: '500',
//           display: 'inline-block',
//           width: "120px",
//           textAlign: "center",
//           color: '#e9700eff'
//         };
//       case "Rejected":
//         return {
//           backgroundColor: '#f8d7da',
//           padding: '8px 16px',
//           borderRadius: '4px',
//           fontSize: '13px',
//           fontWeight: '500',
//           display: 'inline-block',
//           width: "120px",
//           textAlign: "center",
//           color: '#842029'
//         };
//       default:
//         return {
//           backgroundColor: '#bfcfeeff',
//           padding: '8px 16px',
//           borderRadius: '4px',
//           fontSize: '13px',
//           fontWeight: '500',
//           display: 'inline-block',
//           width: "120px",
//           textAlign: "center",
//           color: '#495057'
//         };
//     }
//   };


//  useEffect(() => {
//       if (tasks.length > 0) {
//         setTodayTasks(getTodayAssignedTaskIds());
//       }
//     }, [tasks]);
// const normalizeDate = (date) => {
//   const d = new Date(date);
//   d.setHours(0, 0, 0, 0);
//   return d;
// };
//  const getTodayAssignedTaskIds = () => {
//   const today = normalizeDate(new Date());

//   return tasks
//     .filter(task => {
//       const start = normalizeDate(task.dateOfTaskAssignment);
//       const end = normalizeDate(task.dateOfExpectedCompletion);

//       return (
//         task.status?.name === "Assigned" &&
//         today >= start &&
//         today <= end
//       );
//     })
// };
// console.log("today's task",todayTasks)

//   const [form, setForm] = useState({
//     task: "",
//     employee:user._id,
//     date: new Date().toISOString(),
//     startTime: null,
//     endTime: null,
//     totalHours: "",
//     workDescription: "",
//     challengesFaced: "",
//     whatLearnedToday: "",
//     status: "",
//     progressToday: "", 
//   });

//   const calculateHours = (start, end) => {
//   if (!start || !end) return "";
//   if (!dayjs.isDayjs(start) || !dayjs.isDayjs(end)) return "";
//   const diff = end.diff(start, "minute");
//   if (diff <= 0) return "";

//   const hours = diff / 60;
//   const rounded = Math.round(hours * 1000) / 1000;
//   const truncated = Math.floor(rounded * 100) / 100;

//   return Number.isInteger(truncated)
//     ? truncated.toString()
//     : truncated.toFixed(2);
// };

//   const formatDisplayHours = (h) => {
//   if (h === null || h === undefined) return "";
//   const num = Number(h);
//   if (Number.isNaN(num)) return "";
//   return Number.isInteger(num) ? num : num.toFixed(2);
// };




// async function handleSave(e) {
//     e.preventDefault();
//     const token = localStorage.getItem("accessToken");
//     try {

//       const payload = {
//             task:form.task,
//             employee:user._id,
//             date: form.date,
//             startTime: form.startTime ? form.startTime.format("HH:mm") : "",
//             endTime: form.endTime ? form.endTime.format("HH:mm") : "",
//             totalHours: Number(form.totalHours), 
//             workDescription:form.workDescription,
//             challengesFaced:form.challengesFaced,
//             whatLearnedToday:form.whatLearnedToday,
//             status: form.status,
//       };
//       if (payload.status === "InProgress") {
//           payload.progressToday =  Number(form.progressToday);
//        }
//       console.log("payload", payload);
//       let res;
//       if (editIndex !== null) {
//         res = await axios.put(
//           `https://server-backend-nu.vercel.app/api/tasklogs/${editIndex}`,
//           payload,
//           {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`
//           }
//         }
//         );
//          await fetchLogs();
//       } else {
//         const res = await axios.post(
//           "https://server-backend-nu.vercel.app/api/tasklogs/",
//           payload,
//           {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`
//           }
//         }
//         );
//         await fetchLogs();
//       }
//       setForm({
//           task: "",
//           employee:"",
//           date: "",
//           startTime: null,
//           endTime: null,
//           totalHours: "",
//           workDescription: "",
//           challengesFaced: "",
//           whatLearnedToday: "",
//           status: "",
//           progressToday: ""
//         });
//       setShowModal(false);
//       alert(editIndex ? "Log updated" : "WorkLog created");
//       setEditIndex(null);

//     } catch (error) {
//        const backendMessage =
//         error.response?.data?.message ||
//         error.response?.data?.error ||
//     "Something went wrong. Please try again.";
//       console.error("Submit failed:", error.response?.data || error.message);
//       alert(backendMessage);
//     }
//   };
//     useEffect(() => {
//   if (form.status === "InProgress") {
//     console.log("Progress input should be visible");
//   }
// }, [form.status]);

//   const handleFilter = () => {
//     let data = [...logs];

//     if (searchText) {
//       data = data.filter(
//         (l) =>
//           l?.task?.taskName.toLowerCase().includes(searchText.toLowerCase()) ||
//           l?.workDescription.toLowerCase().includes(searchText.toLowerCase()) ||
//           l.status.toLowerCase().includes(searchText.toLowerCase())
//       );
//     }

//     if (filterDate) {
//       data = data.filter((l) => l.date === filterDate);
//     }

//     setFilteredLogs(data);
//   };

//   const handleReset = () => {
//     setSearchText("");
//     setFilterDate("");
//     setFilteredLogs([]);
//   };

//     const handleEdit = (log) => {
//     setEditIndex(log._id);
//     setShowModal(true);
//     setModalMode("edit")
//     console.log("logs",log)
//     setForm({
//           task: log?.task?._id||"",
//           employee: user._id,
//           date: log?.date,
//           startTime: log.startTime ? dayjs(log.startTime, "HH:mm") : null,
//           endTime: log.endTime ? dayjs(log.endTime, "HH:mm") : null,
//           totalHours: log?.totalHours,
//           workDescription:log?.workDescription,
//           challengesFaced:log?.challengesFaced,
//           whatLearnedToday:log?.whatLearnedToday,
//           status: log?.status || "",
//           progressToday: log?.progressToday || "", 
//         });
//   };

//   const tableData = filteredLogs.length ? filteredLogs : logs;
//   const totalRows = tableData.length;

//   const paginatedData = tableData.slice(
//   page * rowsPerPage,   page * rowsPerPage + rowsPerPage
//   );  
  
//   const isViewMode = modalMode === "view";
//   const handleRowClick = (rowData) => {
//       setModalMode("view")
//       setViewData(rowData);
//       setShowViewModal(true);
//     };

//   return (
//     <div style={{ padding: 20, background: "#f7f9fc", minHeight: "100vh" }}>
//        <div className="d-flex justify-content-between align-items-center mb-4">
//         <h3 className="mb-0" style={{ color: "#3A5FBE", fontSize: "25px" }}>
//           My Worklog
//         </h3>

//         <button
//           className="btn btn-sm custom-outline-btn"
//           onClick={() => {
//           setModalMode("add");
//           setEditIndex(null);
//           setForm({
//           task: "",
//           employee: user._id,
//           date: "",
//           startTime: null,
//           endTime: null,
//           totalHours: "",
//           workDescription: "",
//           challengesFaced: "",
//           whatLearnedToday: "",
//           status: "",
//         });
//           setShowModal(true);
//         }}
//           style={{ minWidth: 90 }}
//         >
//           + Add Log
//         </button>
//       </div>
     
//       {/* SEARCH BAR */}
//       <div
//         style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             gap: 12,
//             padding: "10px",
//             background: "#fff",
//             marginBottom: "18px",
//             flexWrap: "wrap",
//              ...(isMobile && {
//       flexDirection: "row",
//       flexWrap: "wrap",
//         }),
//           }}
//       >
//         <div style={{ display: "flex", gap: 12, alignItems: "center",flexWrap: "wrap"  }}>
//           <b style={{  whiteSpace: "nowrap",color: "#3A5FBE" }}>Search by any field</b>

//                 <input
//             placeholder="Search by any fe..."
//             value={searchText}
//             onChange={(e) => setSearchText(e.target.value)}
//             style={{
//               width: 180,
//               padding: "10px 14px",
//               borderRadius: 8,
//               border: "1px solid #ddd",
//               height:"40px"
//             }}
//           />

//             <b style={{ whiteSpace: "nowrap", color: "#3A5FBE" }}>
//                 Filter by date
//           </b>
//           <input
//             type="date"
//             value={filterDate}
//             onChange={(e) => setFilterDate(e.target.value)}
//             style={{
//               width: 180,
//               padding: "10px 14px",
//               borderRadius: 8,
//               border: "1px solid #ddd",
//                height:"40px",
//                 ...(isMobile && {
//                     marginLeft:"40px"
//     }),
//             }}
//           />
//         </div>

//             <div style={{ display: "flex", 
//           gap: 10,
//                ...(isMobile && {
//                     marginLeft:"150px",
//     }),
            
//           }}>
//           <button
//             onClick={handleFilter}
//             style={{ minWidth: 90 }}
//            className="btn btn-sm custom-outline-btn"
//           >
//             Filter
//           </button>

//           <button
//             style={{ minWidth: 90 }}
//             onClick={handleReset}
//             className="btn btn-sm custom-outline-btn"
//           >
//             Reset
//           </button>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div
//   style={{
//     background: "#fff",
//     borderRadius: 10,
//     boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//    overflowX: "auto"
//   }}
// >

//     <table
//   style={{
//     width: "100%",
//     borderCollapse: "collapse",
//     background: "#fff",
//   }}
// >
//   <thead>
//     <tr>
//       {[
//         "Date",
//         "Task",
//         "Period",
//         "Working Days",
//         "Time Spent",
//         "Description",
//         "Status",
//         "Action",
//       ].map((h) => (
//         <th
//           key={h}
//           style={{
//             padding: "14px 16px",
//             textAlign: "left",
//             fontSize: 14,
//             fontWeight: 600,
//             color: "#475569",
//             borderBottom: "1px solid #e2e8f0",
//             background: "#fff",
//           }}
//         >
//           {h}
//         </th>
//       ))}
//     </tr>
//   </thead>

// <tbody>
//   {tableData.length === 0 ? (
//     <tr>
//       <td
//         colSpan="7"
//         style={{
//           padding: "18px",
//           textAlign: "center",
//           color: "#64748b",
//           fontSize: "14px",
//         }}
//       >
//         No data
//       </td>
//     </tr>
//   ) : (
//     paginatedData.map((l, i) => (
//       <tr
//         onClick={() => handleRowClick(l)}
//         key={l._id}
//         style={{
//           cursor:"pointer",
//           borderBottom: "1px solid #cdd2dcff",
//           transition: "background 0.2s ease",
//         }}
//         onMouseEnter={(e) =>
//           (e.currentTarget.style.background = "#f9fafb")
//         }
//         onMouseLeave={(e) =>
//           (e.currentTarget.style.background = "transparent")
//         }
//       >
//         <td style={{ padding: "14px 16px", fontSize: 14 }}>
//           {formatDate(l.date)}
//         </td>

//         <td style={{ padding: "14px 16px", fontSize: 14 }}>
//           {l?.task?.taskName||l.task}
//         </td>

// <td style={{ padding: "14px 16px", fontSize: 14 }}>
//   {l?.task?.dateOfTaskAssignment && l?.task?.dateOfExpectedCompletion ? (
//     <>
//       {/* Period */}
//       <div>
//         {formatDateWithoutYear(l.task.dateOfTaskAssignment)} →{" "}
//         {formatDateWithoutYear(l.task.dateOfExpectedCompletion)}
//       </div>

//       {/* Day badge ONLY for today's log */}
//       {isToday(l.date) && (() => {
//         const dayNumber = getTaskDayNumber(
//           l.task.dateOfTaskAssignment,
//           l.task.dateOfExpectedCompletion
//         );

//         return (
//           dayNumber && (
//             <div
//               style={{
//                 display: "inline-block",
//                 marginTop: 6,
//                 padding: "2px 8px",
//                 borderRadius: 12,
//                 background: "#e0ecff",
//                 color: "#1d4ed8",
//                 fontSize: 12,
//                 fontWeight: 500,
//               }}
//             >
//               Today • Day {dayNumber}
//             </div>
//           )
//         );
//       })()}
//     </>
//   ) : (
//     "—"
//   )}
// </td>
//  <td style={{ padding: "14px 16px", fontSize: 14 }}>
//     {l?.task?.dateOfTaskAssignment && l?.task?.dateOfExpectedCompletion
//       ? getWorkingDays(l.task.dateOfTaskAssignment, l.task.dateOfExpectedCompletion)
//       : "—"}
//   </td>

//         <td style={{ padding: "14px 16px", fontSize: 14 }}>
//           {formatDisplayHours(l.totalHours)} hrs
//         </td>

//         <td style={{ padding: "14px 16px", fontSize: 14, maxWidth: "300px" }}>
//           {l.workDescription}
//         </td>

//         {/* STATUS */}
//         <td style={{ padding: "14px 16px" }}>
//           <span
            
//             style={getStatusColor(l.status)}
//           >
//             {l.status}
//             {l.status === "InProgress" && (
//               <span
//                 style={{
//                   color: "#92400e",
//                   borderRadius: 4,
//                   padding: "2px 6px",
//                   fontSize: 11,
//                   fontWeight: 600,
//                 }}
//               >
//                 {l.progressToday}%
//               </span>
//             )}
//           </span>
//         </td>

//         {/* ACTION */}
//         <td style={{ padding: "14px 16px" }}>
//             <button
//            style={{
//              fontSize: '12px',
//              padding: '4px 20px',
//              borderRadius: '4px'
//              }}
//              onClick={(e) => {
//              e.stopPropagation();
//              handleEdit(l);
//            }}
//           className="btn btn-sm custom-outline-btn"
//           >
//             Edit
//           </button>
//         </td>
//       </tr>
//     ))
//   )}
// </tbody>
// </table>
// </div>
// <div
//   style={{
//     display: "flex",
//     justifyContent: "flex-end",
//     alignItems: "center",
//     gap: 16,
//     padding: "14px 10px",
//     fontSize: 14,
//     color: "#475569",
//   }}
// >
//   {/* Rows per page */}
//   <span>Rows per page:</span>

//   <select
//     value={rowsPerPage}
//     onChange={(e) => {
//       setRowsPerPage(Number(e.target.value));
//       setPage(0);
//     }}
//     style={{
//       border: "1px solid #cbd5e1",
//       borderRadius: 6,
//       padding: "4px 8px",
//       cursor: "pointer",
//     }}
//   >
//     <option value={5}>5</option>
//     <option value={10}>10</option>
//     <option value={15}>15</option>
//   </select>

//   {/* Count */}
//   <span>
//     {page * rowsPerPage + 1}–
//     {Math.min((page + 1) * rowsPerPage, totalRows)} of {totalRows}
//   </span>

//   {/* Prev */}
//   <button
//     onClick={() => setPage((p) => Math.max(p - 1, 0))}
//     disabled={page === 0}
//     style={{
//       border: "none",
//       background: "transparent",
//       cursor: page === 0 ? "not-allowed" : "pointer",
//       fontSize: 18,
//       color: page === 0 ? "#cbd5e1" : "#334155",
//     }}
//   >
//     ‹
//   </button>

//   {/* Next */}
//   <button
//     onClick={() =>
//       setPage((p) =>
//         (p + 1) * rowsPerPage >= totalRows ? p : p + 1
//       )
//     }
//     disabled={(page + 1) * rowsPerPage >= totalRows}
//     style={{
//       border: "none",
//       background: "transparent",
//       cursor:
//         (page + 1) * rowsPerPage >= totalRows
//           ? "not-allowed"
//           : "pointer",
//       fontSize: 18,
//       color:
//         (page + 1) * rowsPerPage >= totalRows
//           ? "#cbd5e1"
//           : "#334155",
//     }}
//   >
//     ›
//   </button>
// </div>
//  {/* MODAL */}
// {showModal && (
//   <div
//     style={{
//       position: "fixed",
//       inset: 0,
//       background: "rgba(0,0,0,0.4)",
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       zIndex: 999,
//     }}
//   >
//     <div
//      style={{
//       width: 580,
//       background: "#fff",
//       borderRadius: 10,
//       marginTop:"2vh",
//       maxHeight: "85vh",
//       overflowY: "auto",
//       scrollbarWidth: "thin",  
//       }}
//     >
//       {/* HEADER */}
//       <div
//         style={{
//           background: "#3f5fbf",
//           color: "#fff",
//           padding: "12px 16px",
//           fontSize: 16,
//           fontWeight: 600,
//         }}
//       >
//        {modalMode === "add" && "Add Worklog"}
//        {modalMode === "edit" && "Edit Worklog"}
//         {modalMode === "view" && "View Worklog"} 
//       </div>

//       {/* BODY */}
//       <div
//   style={{
//     padding: 16,
//     maxHeight: "70vh",
//     overflowY: "auto"
//   }}
// >
//        <label style={{ fontSize: 13, fontWeight: 500 ,}}>Select Task</label>

//         <select
//          disabled={isViewMode}
//           value={form.task}
//           onChange={(e) => setForm({ ...form, task: e.target.value })}
//           style={{
//             width: "100%",
//             padding: "8px 10px",
//             borderRadius: 6,
//             border: "1px solid #ccc",
//             marginBottom: 12,
//           }}
//         >
//           <option value="">Select Task</option>
//             {todayTasks.map(task => (
//               <option key={task._id} value={task._id}>
//                 {task.projectName} - {task.taskName}
//               </option>
//             ))}
//         </select>
//          <label style={{ fontSize: 13, fontWeight: 500 }}>Start Time</label>
//           <LocalizationProvider dateAdapter={AdapterDayjs}>
//            <TimePicker
//             disabled={isViewMode}
//           label="Start Time"
//           value={form.startTime}
//           onChange={(v) =>
//     setForm((p) => ({
//       ...p,
//       startTime: v,
//       totalHours: calculateHours(v, p.endTime),
//     }))
//   }
//           viewRenderers={{
//             hours: renderTimeViewClock,
//             minutes: renderTimeViewClock,
//           }}
//           slotProps={{
//             textField: {
//               fullWidth: true,
//               size: "small",
//             },
//           }}
//         />
      
//       <label style={{ fontSize: 13, fontWeight: 500 }}>End Time</label>
//         <TimePicker
//          disabled={isViewMode}
//           label="End Time"
//           value={form.endTime}
//           onChange={(v) =>
//     setForm((p) => ({
//       ...p,
//       endTime: v,
//       totalHours: calculateHours(p.startTime, v),
//     }))
//   }
//           viewRenderers={{
//             hours: renderTimeViewClock,
//             minutes: renderTimeViewClock,
//           }}
//           slotProps={{
//             textField: {
//               fullWidth: true,
//               size: "small",
//             },
//           }}
//         />
//       </LocalizationProvider>
//        <label style={{ fontSize: 13, fontWeight: 500 }}>Work  Decription</label>
//          <textarea
//          disabled={isViewMode}
//           placeholder="Work Description"
//           value={form.workDescription}
//           onChange={(e) => setForm({ ...form, workDescription: e.target.value })}
//           rows={2}
//           style={{
//             width: "100%",
//             padding: "8px 10px",
//             borderRadius: 6,
//             border: "1px solid #ccc",
//             marginBottom: 12,
//           }}
//         />

//         <label style={{ fontSize: 13, fontWeight: 500 }}>Challeges Faced</label>
//         <textarea
//          disabled={isViewMode}
//           placeholder="Challenges"
//           value={form.challengesFaced}
//           onChange={(e) => setForm({ ...form, challengesFaced: e.target.value })}
//           rows={2}
//           style={{
//             width: "100%",
//             padding: "8px 10px",
//             borderRadius: 6,
//             border: "1px solid #ccc",
//             marginBottom: 12,
//           }}
//         /> 

//         <label style={{ fontSize: 13, fontWeight: 500 }}>What I Learned Today</label>
//         <textarea
//          disabled={isViewMode}
//           placeholder="What I learned"
//           value={form.whatLearnedToday}
//           onChange={(e) => setForm({ ...form, whatLearnedToday: e.target.value })}
//           rows={2}
//           style={{
//             width: "100%",
//             padding: "8px 10px",
//             borderRadius: 6,
//             border: "1px solid #ccc",
//             marginBottom: 12,
//           }}
//         />


//     <label style={{ fontSize: 13, fontWeight: 500 }}>Select Status</label>
// <select
//   disabled={isViewMode}
//   value={form.status}
//   onChange={(e) => setForm({ ...form, status: e.target.value })}
//   style={{
//     width: "100%",
//     padding: "8px 10px",
//     borderRadius: 6,
//     border: "1px solid #ccc",
//   }}
// >
//   <option value="">Select Status</option>
//   <option value="Submitted">Submitted</option>
//   <option value="InProgress">InProgress</option>
// </select>

// {/* Show Progress Today input only if InProgress */}
// {form.status === "InProgress" && (
//   <div style={{ marginTop: 12 }}>
//     <label>Progress Today (%)</label>
//     <input
//       type="number"
//       min="0"
//       max="100"
//       value={form.progressToday}
//       onChange={(e) => setForm({ ...form, progressToday: e.target.value })}
//       required
//       style={{
//         width: "100%",
//         padding: "8px 10px",
//         borderRadius: 6,
//         border: "1px solid #ccc",
//         marginTop: 6,
//       }}
//     />
//   </div>
// )}

        
//       </div>

//       {/* FOOTER */}
//           <div
//         style={{
//           padding: 16,
//           display: "flex",
//           justifyContent: "flex-end",
//           gap: 10,
//         }}
//       >
//         <button
//           onClick={() => setShowModal(false)}
//          className="btn btn-sm custom-outline-btn"
//         >
//           Cancel
//         </button>

//        {modalMode !== "view" && (
//         <button onClick={handleSave} className="btn btn-sm custom-outline-btn">
//          {modalMode === "edit" ? "Update" : "Submit"}
//         </button>
//         )}

//       </div>
//     </div>
//   </div>
// )}
//    {showViewModal && viewData && (
//    <div
//     style={{
//       position: "fixed",
//       inset: 0,
//       background: "rgba(0,0,0,0.4)",
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       zIndex: 999,
//     }}
//   >
//     <div
//      style={{
//       width: 580,
//       background: "#fff",
//       borderRadius: 10,
//       marginTop:"2vh",
//       maxHeight: "85vh",
//       overflowY: "auto",
//       scrollbarWidth: "thin",  
//       }}
//     >
//       {/* HEADER */}
//       <div
//         style={{
//           background: "#3f5fbf",
//           color: "#fff",
//           padding: "12px 16px",
//           fontSize: 16,
//           fontWeight: 600,
//           display: "flex",
//           justifyContent: "space-between",
//         }}
//       >
//         {modalMode === "view" && "View Worklog"} 
//         {/* <span
//           style={{ cursor: "pointer", marginLeft: "530px", }}
//           onClick={() => setShowViewModal(false)}
//         >
//           ✕
//         </span> */}
//       </div>

//       {/* BODY */}
//       <div style={{ padding: 16, fontSize: 14 }}>
//         <p><b>Date:</b> {formatDate(viewData.date)}</p>
//         <p><b>Task:</b> {viewData.task?.taskName}</p>
//         <p><b>Start Time:</b> {viewData.startTime}</p>
//         <p><b>End Time:</b> {viewData.endTime}</p>
//         <p><b>Time Spent:</b> {formatDisplayHours(viewData.totalHours)} hrs</p>
//          <p><b>Status:</b>   <span
//             style={getStatusColor(viewData.status)}
//           >
//             {viewData.status}
//             {viewData.status === "InProgress" && (
//               <span
//                 style={{
//                   color: "#92400e",
//                   borderRadius: 4,
//                   padding: "2px 6px",
//                   fontSize: 11,
//                   fontWeight: 600,
//                 }}
//               >
//                 {viewData.progressToday}%
//               </span>
//             )}
//           </span></p>

//         <p><b>Description:</b><br />{viewData.workDescription}</p>
//         <p><b>Challenges:</b><br />{viewData.challengesFaced}</p>
//         <p><b>What I Learned:</b><br />{viewData.whatLearnedToday}</p>
//          {viewData.status === "Approved" && (
//            <>
//          <p><b>Approved By:</b> {viewData?.approvedBy?.name || "-"}</p>
//        </>
//        )}
//      {viewData.status === "Rejected" && (
//        <>
//         <p><b>Rejected By:</b> {viewData?.approvedBy?.name || "-"}</p>
//       </>
//      )}
//       {viewData.status !== "Rejected" && viewData.status !== "Approved" && (
//       <>
//        <p><b>Approval: </b> Not Yet Reviewed</p>
//       </>
//      )}
//       </div>

//       {/* FOOTER */}
//       <div  style={{
//           padding: 16,
//           display: "flex",
//           justifyContent: "flex-end",
//           gap: 10,
//         }} >
//         <button
//           className="btn btn-sm custom-outline-btn"
//           onClick={() => setShowViewModal(false)}
//         >
//           Close
//         </button>
//       </div>

//     </div>
//   </div>
// )}
//   <div className="text-end mt-3">
//              <button
//                 className="btn btn-sm custom-outline-btn"
//                 style={{ minWidth: 90 }}
//                 onClick={() => window.history.go(-1)}
//               >
//                 Back
//               </button>
//   </div>   

// </div>
    
//   );
// };

// export default EmployeeTasklog;



import React, { useState,useEffect} from "react";
import dayjs from "dayjs";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import TextField from "@mui/material/TextField";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import axios from "axios";
import "./Tasklog.css";

const EmployeeTasklog = ({user}) => {
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [modalMode, setModalMode] = useState("add"); 
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const isMobile = window.innerWidth <= 768;
  const token = localStorage.getItem("accessToken");
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);


const getTaskDayNumber = (startDate, endDate) => {
  if (!startDate || !endDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  // Today outside task period
  if (today < start || today > end) return null;

  let count = 0;
  let current = new Date(start);

  while (current <= today) {
    const day = current.getDay(); // 0 = Sunday, 6 = Saturday
    const date = current.getDate();

    // Exclude Sundays
    if (day === 0) {
      current.setDate(current.getDate() + 1);
      continue;
    }

    // Exclude first and third Saturdays
    if (
      day === 6 &&
      (date <= 7 || (date >= 15 && date <= 21))
    ) {
      current.setDate(current.getDate() + 1);
      continue;
    }

    count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
};


 const isToday = (dateString) => {
  if (!dateString) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);

  return today.getTime() === date.getTime();
};
function getWorkingDays(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  let count = 0;

  // Helper to check if a date is 1st or 3rd Saturday
  function isFirstOrThirdSaturday(date) {
    if (date.getDay() !== 6) return false; // Not Saturday
    const day = date.getDate();
    const weekNumber = Math.ceil(day / 7);
    return weekNumber === 1 || weekNumber === 3;
  }

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0) continue; // Skip Sunday
    if (isFirstOrThirdSaturday(d)) continue; // Skip 1st & 3rd Saturday
    count++;
  }

  return count;
}

// Example usage:
const totalDays = getWorkingDays("2026-01-01T00:00:00.000Z", "2026-01-15T00:00:00.000Z");
console.log(totalDays); // Correct total working days


  
const formatDate = (dateString) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(dateString));
const formatDateWithoutYear = (dateString) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(new Date(dateString));

   useEffect(() => {
      fetchLogs();    
    }, []);
  const fetchLogs = async () => {
    try {
      const logRes = await fetch(`https://server-backend-nu.vercel.app/api/tasklogs/employee/${user._id}`);
      const logsData = await logRes.json();
      const taskRes = await fetch(`https://server-backend-nu.vercel.app/tasks/assigned/${user._id}`);
      const tasksData = await taskRes.json();
      setLogs(logsData);
      setTasks(tasksData.tasks);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted":
        return {
          backgroundColor: '#d1f2dd',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: '500',
          display: 'inline-block',
          width: "120px",
          textAlign: "center",
          color: '#0f5132'
        };
      case "InProgress":
        return {
          backgroundColor: '#d1e7ff',
          padding: '7px 16px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: '500',
          display: 'inline-block',
          width: "120px",
          textAlign: "center",
          color: '#0d6efd'
        };
      case "Pending":
        return {
          backgroundColor: '#FFE493',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: '500',
          display: 'inline-block',
          width: "120px",
          textAlign: "center",
          color: '#664d03'
        };
      case "Approved":
        return {
          backgroundColor: '#f1dabfff',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: '500',
          display: 'inline-block',
          width: "120px",
          textAlign: "center",
          color: '#e9700eff'
        };
      case "Rejected":
        return {
          backgroundColor: '#f8d7da',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: '500',
          display: 'inline-block',
          width: "120px",
          textAlign: "center",
          color: '#842029'
        };
      default:
        return {
          backgroundColor: '#bfcfeeff',
          padding: '8px 16px',
          borderRadius: '4px',
          fontSize: '13px',
          fontWeight: '500',
          display: 'inline-block',
          width: "120px",
          textAlign: "center",
          color: '#495057'
        };
    }
  };


 useEffect(() => {
      if (tasks.length > 0) {
        setTodayTasks(getTodayAssignedTaskIds());
      }
    }, [tasks]);
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
 const getTodayAssignedTaskIds = () => {
  const today = normalizeDate(new Date());

  return tasks
    .filter(task => {
      const start = normalizeDate(task.dateOfTaskAssignment);
      const end = normalizeDate(task.dateOfExpectedCompletion);

      return (
        task.status?.name === "Assigned" &&
        today >= start &&
        today <= end
      );
    })
};
console.log("today's task",todayTasks)

  const [form, setForm] = useState({
    task: "",
    employee:user._id,
    date: new Date().toISOString(),
    startTime: null,
    endTime: null,
    totalHours: "",
    workDescription: "",
    challengesFaced: "",
    whatLearnedToday: "",
    status: "",
    progressToday: "", 
  });

  const calculateHours = (start, end) => {
  if (!start || !end) return "";
  if (!dayjs.isDayjs(start) || !dayjs.isDayjs(end)) return "";
  const diff = end.diff(start, "minute");
  if (diff <= 0) return "";

  const hours = diff / 60;
  const rounded = Math.round(hours * 1000) / 1000;
  const truncated = Math.floor(rounded * 100) / 100;

  return Number.isInteger(truncated)
    ? truncated.toString()
    : truncated.toFixed(2);
};

  const formatDisplayHours = (h) => {
  if (h === null || h === undefined) return "";
  const num = Number(h);
  if (Number.isNaN(num)) return "";
  return Number.isInteger(num) ? num : num.toFixed(2);
};




async function handleSave(e) {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    try {

      const payload = {
            task:form.task,
            employee:user._id,
            date: form.date,
            startTime: form.startTime ? form.startTime.format("HH:mm") : "",
            endTime: form.endTime ? form.endTime.format("HH:mm") : "",
            totalHours: Number(form.totalHours), 
            workDescription:form.workDescription,
            challengesFaced:form.challengesFaced,
            whatLearnedToday:form.whatLearnedToday,
            status: form.status,
      };
      if (payload.status === "InProgress") {
          payload.progressToday =  Number(form.progressToday);
       }
      console.log("payload", payload);
      let res;
      if (editIndex !== null) {
        res = await axios.put(
          `https://server-backend-nu.vercel.app/api/tasklogs/${editIndex}`,
          payload,
          {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
        );
         await fetchLogs();
      } else {
        const res = await axios.post(
          "https://server-backend-nu.vercel.app/api/tasklogs/",
          payload,
          {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
        );
        await fetchLogs();
      }
      setForm({
          task: "",
          employee:"",
          date: "",
          startTime: null,
          endTime: null,
          totalHours: "",
          workDescription: "",
          challengesFaced: "",
          whatLearnedToday: "",
          status: "",
          progressToday: ""
        });
      setShowModal(false);
      alert(editIndex ? "Log updated" : "WorkLog created");
      setEditIndex(null);

    } catch (error) {
       const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
    "Something went wrong. Please try again.";
      console.error("Submit failed:", error.response?.data || error.message);
      alert(backendMessage);
    }
  };
    useEffect(() => {
  if (form.status === "InProgress") {
    console.log("Progress input should be visible");
  }
}, [form.status]);

  const handleFilter = () => {
    let data = [...logs];

    if (searchText) {
      data = data.filter(
        (l) =>
          l?.task?.taskName.toLowerCase().includes(searchText.toLowerCase()) ||
          l?.workDescription.toLowerCase().includes(searchText.toLowerCase()) ||
          l.status.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterDate) {
      data = data.filter((l) => l.date === filterDate);
    }

    setFilteredLogs(data);
  };

  const handleReset = () => {
    setSearchText("");
    setFilterDate("");
    setFilteredLogs([]);
  };

    const handleEdit = (log) => {
    setEditIndex(log._id);
    setShowModal(true);
    setModalMode("edit")
    console.log("logs",log)
    setForm({
          task: log?.task?._id||"",
          employee: user._id,
          date: log?.date,
          startTime: log.startTime ? dayjs(log.startTime, "HH:mm") : null,
          endTime: log.endTime ? dayjs(log.endTime, "HH:mm") : null,
          totalHours: log?.totalHours,
          workDescription:log?.workDescription,
          challengesFaced:log?.challengesFaced,
          whatLearnedToday:log?.whatLearnedToday,
          status: log?.status || "",
          progressToday: log?.progressToday || "", 
        });
  };

  const tableData = filteredLogs.length ? filteredLogs : logs;
  const totalRows = tableData.length;

  const paginatedData = tableData.slice(
  page * rowsPerPage,   page * rowsPerPage + rowsPerPage
  );  
  
  const isViewMode = modalMode === "view";
  const handleRowClick = (rowData) => {
      setModalMode("view")
      setViewData(rowData);
      setShowViewModal(true);
    };

  return (
    <div style={{ padding: 20, background: "#f7f9fc",  overflowY: "hidden" }}>
       <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0" style={{ color: "#3A5FBE", fontSize: "25px" }}>
          My Worklog
        </h3>

        <button
          className="btn btn-sm custom-outline-btn"
          onClick={() => {
          setModalMode("add");
          setEditIndex(null);
          setForm({
          task: "",
          employee: user._id,
          date: "",
          startTime: null,
          endTime: null,
          totalHours: "",
          workDescription: "",
          challengesFaced: "",
          whatLearnedToday: "",
          status: "",
        });
          setShowModal(true);
        }}
          style={{ minWidth: 90 }}
        >
          + Add Log
        </button>
      </div>
     
      {/* SEARCH BAR */}
      <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            padding: "20px",
            background: "#fff",
            marginBottom: "18px",
            flexWrap: "wrap",
             ...(isMobile && {
      flexDirection: "row",
      flexWrap: "wrap",
        }),
          }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center",flexWrap: "wrap"  }}>
          <b style={{  whiteSpace: "nowrap",color: "#3A5FBE" }}>Search by any field</b>

                <input
            placeholder="Search by any fe..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: 280,
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ddd",
              height:"40px"
            }}
          />

            <b style={{ whiteSpace: "nowrap", color: "#3A5FBE" }}>
                Filter by date
          </b>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{
              width: 280,
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ddd",
               height:"40px",
                ...(isMobile && {
                    marginLeft:"40px"
    }),
            }}
          />
        </div>

            <div style={{ display: "flex", 
          gap: 10,
               ...(isMobile && {
                    marginLeft:"150px",
    }),
            
          }}>
          <button
            onClick={handleFilter}
            style={{ minWidth: 90 }}
           className="btn btn-sm custom-outline-btn"
          >
            Filter
          </button>

          <button
            style={{ minWidth: 90 }}
            onClick={handleReset}
            className="btn btn-sm custom-outline-btn"
          >
            Reset
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div
  style={{
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
   overflowX: "auto"
  }}
>

    <table
     className="mb-0"
  style={{
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    padding: "20px",
  }}
>
  <thead>
    <tr style={{
          background: "#f9fafb",
           borderBottom: "1px solid #e5e7eb",
         }}>
      {[
        "Date",
        "Task",
        "Period",
        "Working Days",
        "Time Spent",
        "Description",
        "Status",
        "Action",
      ].map((h) => (
        <th
          key={h}
          style={{
            padding: "14px 16px",
            textAlign: "left",
            fontSize: 14,
            fontWeight: 600,
            color: "#475569",
            whiteSpace: "nowrap"
          }}
        >
          {h}
        </th>
      ))}
    </tr>
  </thead>

<tbody>
  {tableData.length === 0 ? (
    <tr>
      <td
        colSpan="7"
        style={{
          padding: "18px",
          textAlign: "center",
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        No data
      </td>
    </tr>
  ) : (
    paginatedData.map((l, i) => (
      <tr
        onClick={() => handleRowClick(l)}
        key={l._id}
        style={{
          cursor:"pointer",
          borderBottom: "1px solid #cdd2dcff",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "#f9fafb")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "transparent")
        }
      >
        <td style={{ padding: "14px 16px", fontSize: 14 }}>
          {formatDate(l.date)}
        </td>

        <td style={{ padding: "14px 16px", fontSize: 14 }}>
          {l?.task?.taskName||l.task}
        </td>

<td style={{ padding: "14px 16px", fontSize: 14 }}>
  {l?.task?.dateOfTaskAssignment && l?.task?.dateOfExpectedCompletion ? (
    <>
      {/* Period */}
      <div>
        {formatDateWithoutYear(l.task.dateOfTaskAssignment)} →{" "}
        {formatDateWithoutYear(l.task.dateOfExpectedCompletion)}
      </div>

      {/* Day badge ONLY for today's log */}
      {isToday(l.date) && (() => {
        const dayNumber = getTaskDayNumber(
          l.task.dateOfTaskAssignment,
          l.task.dateOfExpectedCompletion
        );

        return (
          dayNumber && (
            <div
              style={{
                display: "inline-block",
                marginTop: 6,
                padding: "2px 8px",
                borderRadius: 12,
                background: "#e0ecff",
                color: "#1d4ed8",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              Today • Day {dayNumber}
            </div>
          )
        );
      })()}
    </>
  ) : (
    "—"
  )}
</td>
 <td style={{ padding: "14px 16px", fontSize: 14 }}>
    {l?.task?.dateOfTaskAssignment && l?.task?.dateOfExpectedCompletion
      ? getWorkingDays(l.task.dateOfTaskAssignment, l.task.dateOfExpectedCompletion)
      : "—"}
  </td>

        <td style={{ padding: "14px 16px", fontSize: 14 }}>
          {formatDisplayHours(l.totalHours)} hrs
        </td>

        <td style={{ padding: "14px 16px", fontSize: 14, maxWidth: "300px" }}>
          {l.workDescription}
        </td>

        {/* STATUS */}
        <td style={{ padding: "14px 16px" }}>
          <span
            
            style={getStatusColor(l.status)}
          >
            {l.status}
            {l.status === "InProgress" && (
              <span
                style={{
                  color: "#92400e",
                  borderRadius: 4,
                  padding: "2px 6px",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {l.progressToday}%
              </span>
            )}
          </span>
        </td>

        {/* ACTION */}
        <td style={{ padding: "14px 16px" }}>
            <button
           style={{
             fontSize: '12px',
             padding: '4px 20px',
             borderRadius: '4px',
              minWidth: 90
             }}
             onClick={(e) => {
             e.stopPropagation();
             handleEdit(l);
           }}
          className="btn btn-sm custom-outline-btn"
          >
            Edit
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>
</table>
</div>
<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    padding: "14px 10px",
    fontSize: 14,
    color: "#475569",
  }}
>
  {/* Rows per page */}
  <span>Rows per page:</span>

     <select
   value={rowsPerPage}
   onChange={(e) => {
     setRowsPerPage(Number(e.target.value));
     setPage(0);
   }}
   style={{
     border: "1px solid #cbd5e1",
     borderRadius: 6,
     padding: "4px 8px",
     cursor: "pointer",
   }}
 >
   <option value={3}>3</option>
   <option value={6}>6</option>
   <option value={9}>9</option>
 </select>

  {/* Count */}
  <span>
    {page * rowsPerPage + 1}–
    {Math.min((page + 1) * rowsPerPage, totalRows)} of {totalRows}
  </span>

  {/* Prev */}
  <button
    onClick={() => setPage((p) => Math.max(p - 1, 0))}
    disabled={page === 0}
    style={{
      border: "none",
      background: "transparent",
      cursor: page === 0 ? "not-allowed" : "pointer",
      fontSize: 18,
      color: page === 0 ? "#cbd5e1" : "#334155",
    }}
  >
    ‹
  </button>

  {/* Next */}
  <button
    onClick={() =>
      setPage((p) =>
        (p + 1) * rowsPerPage >= totalRows ? p : p + 1
      )
    }
    disabled={(page + 1) * rowsPerPage >= totalRows}
    style={{
      border: "none",
      background: "transparent",
      cursor:
        (page + 1) * rowsPerPage >= totalRows
          ? "not-allowed"
          : "pointer",
      fontSize: 18,
      color:
        (page + 1) * rowsPerPage >= totalRows
          ? "#cbd5e1"
          : "#334155",
    }}
  >
    ›
  </button>
</div>
 {/* MODAL */}
{showModal && (
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
    onClick={() => setShowModal(false)}
  >
      <div
  className="modal-dialog"
  style={{
    maxWidth: "600px",
    width: "95%",
  }}
  onClick={(e) => e.stopPropagation()}
>

      <div
  className="modal-content"
  style={{
    height: "85vh",
    display: "flex",
    flexDirection: "column",
  }}
>
           {/* HEADER */}
         <div
          className="modal-header"
          style={{ background: "#3A5FBE", color: "#fff", flexShrink: 0, }}
        >
          <h5 className="modal-title">
            {modalMode === "add" && "Add Worklog"}
            {modalMode === "edit" && "Edit Worklog"}
            {modalMode === "view" && "View Worklog"}
          </h5>

          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => setShowModal(false)}
          />
        </div>

      {/* BODY */}
       {/* BODY */}
        <div
  className="modal-body"
  style={{
    overflowY: "auto",
    flex: 1,
  }}
>
       <div className="row g-3">

            {/* Select Task */}
           <div className="col-12">

              <label className="form-label">Select Task</label>
              <select
                className="form-select"
                disabled={isViewMode}
                value={form.task}
                onChange={(e) =>
                  setForm({ ...form, task: e.target.value })
                }
              >
                <option value="">Select Task</option>
                {todayTasks.map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.projectName} - {task.taskName}
                  </option>
                ))}
              </select>
            </div>
    <div className="col-md-6 col-12">

               <label className="form-label">Start Time</label>
               <LocalizationProvider dateAdapter={AdapterDayjs}>
   <TimePicker
    disabled={isViewMode}
    value={form.startTime}
    onChange={(v) =>
      setForm((p) => ({
        ...p,
        startTime: v,
        totalHours: calculateHours(v, p.endTime),
      }))
    }
    viewRenderers={{
      hours: renderTimeViewClock,
      minutes: renderTimeViewClock,
    }}
    slotProps={{
      textField: {
        fullWidth: true,
        size: "small",
      },
    }}
  />
</LocalizationProvider>

            </div>

            {/* End Time */}
            <div className="col-md-6">
              <label className="form-label">End Time</label>
             <LocalizationProvider dateAdapter={AdapterDayjs}>
  <TimePicker
    disabled={isViewMode}
    value={form.endTime}
    onChange={(v) =>
      setForm((p) => ({
        ...p,
        endTime: v,
        totalHours: calculateHours(p.startTime, v),
      }))
    }
    viewRenderers={{
      hours: renderTimeViewClock,
      minutes: renderTimeViewClock,
    }}
    slotProps={{
      textField: {
        fullWidth: true,
        size: "small",
      },
    }}
  />
</LocalizationProvider>
 </div>
       <div className="col-12">
               <label className="form-label">Work Description</label>
               <textarea
                className="form-control"
                rows={2}
                disabled={isViewMode}
                value={form.workDescription}
                onChange={(e) =>
                  setForm({ ...form, workDescription: e.target.value })
                }
              />
            </div>

                 {/* Challenges */}
            <div className="col-12">
              <label className="form-label">Challenges Faced</label>
               <textarea
                className="form-control"
                rows={2}
                disabled={isViewMode}
                value={form.challengesFaced}
                onChange={(e) =>
                  setForm({ ...form, challengesFaced: e.target.value })
                }
              />
            </div>

                  {/* Learned */}
             <div className="col-12">
               <label className="form-label">What I Learned Today</label>
               <textarea
                className="form-control"
                rows={2}
                disabled={isViewMode}
                value={form.whatLearnedToday}
                onChange={(e) =>
                  setForm({ ...form, whatLearnedToday: e.target.value })
                }
              />
            </div>


             {/* Status */}
            <div className="col-12">

               <label className="form-label">Status</label>
               <select
                className="form-select"
                disabled={isViewMode}
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option value="">Select Status</option>
                <option value="Submitted">Submitted</option>
                <option value="InProgress">In Progress</option>
              </select>
            </div>

{/* Show Progress Today input only if InProgress */}
{form.status === "InProgress" && (
  <div className="col-12">
    <label>Progress Today (%)</label>
    <input
      type="number"
      min="0"
      max="100"
      value={form.progressToday}
      onChange={(e) => setForm({ ...form, progressToday: e.target.value })}
      required
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 6,
        border: "1px solid #ccc",
        marginTop: 6,
      }}
    />
  </div>
  

)}

  </div>
        
      </div>


      {/* FOOTER */}
                 <div className="modal-footer" style={{ flexShrink: 0 }}>

           <button
            type="button"
             style={{ minWidth: 90 }}
            className="btn btn-sm custom-outline-btn"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>

          {modalMode !== "view" && (
            <button
              type="button"
              className="btn btn-sm custom-outline-btn"
               style={{ minWidth: 90 }}
              onClick={handleSave}
            >
              {modalMode === "edit" ? "Update" : "Submit"}
            </button>
          )}
        </div>
   
    </div>
  </div>
  </div>
)}

   {showViewModal && viewData && (
 <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1050,
    }}
    onClick={() => setShowViewModal(false)}
  >
    <div
      style={{
        width: "600px",
        maxWidth: "95%",
        background: "#fff",
        borderRadius: 12,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div
        style={{
          background: "#3f5fbf",
          color: "#fff",
          padding: "12px 16px",
          fontSize: 16,
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {modalMode === "view" && "View Worklog"} 
        {/* <span
          style={{ cursor: "pointer", marginLeft: "530px", }}
          onClick={() => setShowViewModal(false)}
        >
          ✕
        </span> */}
      </div>

      {/* BODY */}
   <div style={{ padding: 20 }}>
        <p><b>Date:</b> {formatDate(viewData.date)}</p>
        <p><b>Task:</b> {viewData.task?.taskName}</p>
        <p><b>Start Time:</b> {viewData.startTime}</p>
        <p><b>End Time:</b> {viewData.endTime}</p>
        <p><b>Time Spent:</b> {formatDisplayHours(viewData.totalHours)} hrs</p>
         <p><b>Status:</b>   <span
            style={getStatusColor(viewData.status)}
          >
            {viewData.status}
            {viewData.status === "InProgress" && (
              <span
                style={{
                  color: "#92400e",
                  borderRadius: 4,
                  padding: "2px 6px",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {viewData.progressToday}%
              </span>
            )}
          </span></p>

        <p><b>Description:</b><br />{viewData.workDescription}</p>
        <p><b>Challenges:</b><br />{viewData.challengesFaced}</p>
        <p><b>What I Learned:</b><br />{viewData.whatLearnedToday}</p>
         {viewData.status === "Approved" && (
           <>
         <p><b>Approved By:</b> {viewData?.approvedBy?.name || "-"}</p>
       </>
       )}
     {viewData.status === "Rejected" && (
       <>
        <p><b>Rejected By:</b> {viewData?.approvedBy?.name || "-"}</p>
      </>
     )}
      {viewData.status !== "Rejected" && viewData.status !== "Approved" && (
      <>
       <p><b>Approval: </b> Not Yet Reviewed</p>
      </>
     )}
      </div>

      {/* FOOTER */}
      <div  style={{
          padding: 16,
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
        }} >
        <button
          className="btn btn-sm custom-outline-btn"
          onClick={() => setShowViewModal(false)}
          style={{ minWidth: 90 }}
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
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
};

export default EmployeeTasklog;


