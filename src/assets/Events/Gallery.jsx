// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const API_URL = "https://server-backend-nu.vercel.app/api/gallery";

// const CATEGORY_OPTIONS = [
//   "Rewards & Recognition",
//   "Engagement Activities",
//   "Social Activities",
// ];

// function Gallery() {
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [galleryItems, setGalleryItems] = useState([]);
//   const [editId, setEditId] = useState(null);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(5);

//   // Calculate total pages
//   const totalPages = Math.ceil(galleryItems.length / itemsPerPage);

//   // Slice galleryItems for current page
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = galleryItems.slice(indexOfFirstItem, indexOfLastItem);

//   /* ================= FETCH ================= */
//   useEffect(() => {
//     fetchGallery();
//   }, []);

//   const fetchGallery = async () => {
//     const res = await axios.get(API_URL);
//     setGalleryItems(res.data);
//   };

//   /* ================= FILE SELECT ================= */
//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);

//     const mapped = files.map((file) => ({
//       file,
//       type: file.type.startsWith("image")
//         ? "image"
//         : file.type.startsWith("video")
//         ? "video"
//         : "pdf",
//       preview:
//         file.type.startsWith("image") || file.type.startsWith("video")
//           ? URL.createObjectURL(file)
//           : null,
//       title: "",
//       description: "",
//       category: "",
//     }));

//     setSelectedFiles(mapped);
//   };

//   /* ================= INPUT CHANGE ================= */
//   const handleChange = (index, field, value) => {
//     const updated = [...selectedFiles];
//     updated[index][field] = value;
//     setSelectedFiles(updated);
//   };

//   /* ================= UPLOAD ================= */
//   const handleUpload = async () => {
//     if (!selectedFiles.length) {
//       alert("Please select files");
//       return;
//     }

//     for (let item of selectedFiles) {
//       if (!item.category) {
//         alert("Please select category for all files");
//         return;
//       }
//     }

//     try {
//       const formData = new FormData();

//       selectedFiles.forEach((item) => {
//         formData.append("files", item.file);
//         formData.append("titles[]", item.title);
//         formData.append("descriptions[]", item.description);
//         formData.append("categories[]", item.category);
//       });
//       const res = await axios.post(`${API_URL}/upload`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setGalleryItems((prev) => [...res.data, ...prev]);
//       setSelectedFiles([]);
//       setEditId(null);
//       alert("Upload successful ✅");
//     } catch (err) {
//       alert(err.response?.data?.message || "Upload failed ❌");
//     }
//   };

//   /* ================= EDIT ================= */
//   const handleEdit = (item) => {
//     setSelectedFiles([
//       {
//         file: null,
//         type: item.type,
//         preview: item.url,
//         title: item.title,
//         description: item.description,
//         category: item.category,
//       },
//     ]);
//     setEditId(item._id);
//   };

//   const handleUpdate = async () => {
//     try {
//       await axios.put(`${API_URL}/${editId}`, {
//         title: selectedFiles[0].title,
//         description: selectedFiles[0].description,
//         category: selectedFiles[0].category,
//       });

//       fetchGallery();
//       setSelectedFiles([]);
//       setEditId(null);
//       alert("Updated successfully ✅");
//     } catch {
//       alert("Update failed ❌");
//     }
//   };

//   /* ================= DELETE ================= */
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure?")) return;
//     await axios.delete(`${API_URL}/${id}`);
//     setGalleryItems((prev) => prev.filter((i) => i._id !== id));
//   };

//   return (
//     <div className="container-fluid bg-light min-vh-100">
//       <h4 className="text-primary fw-bold mb-2 mt-0">Gallery</h4>

//       {/* ================= UPLOAD CARD ================= */}
//       <div className="card shadow-sm mb-4">
//         <div className="card-body">
//           <h5 className="fw-bold text-primary mb-3">
//             {/* Gallery Upload */}
//             Attach File
//           </h5>

//           <label className="border border-2 border-primary border-dashed rounded p-4 text-center  mb-3 cursor-pointer">
//             <input
//               type="file"
//               multiple
//               accept="image/*,video/*,.pdf"
//               hidden
//               onChange={handleFileChange}
//             />
//             Click to select Image / Video / PDF
//           </label>

//           {selectedFiles.map((item, index) => (
//             <div key={index} className="mb-3">
//               {item.type === "image" && (
//                 <img src={item.preview} width="120" className="mb-2 rounded" />
//               )}
//               {item.type === "video" && (
//                 <video
//                   src={item.preview}
//                   width="150"
//                   controls
//                   className="mb-2"
//                 />
//               )}
//               {item.type === "pdf" && <p>📄 PDF Selected</p>}

//               <input
//                 className="form-control mb-2"
//                 placeholder="Title"
//                 value={item.title}
//                 onChange={(e) => handleChange(index, "title", e.target.value)}
//               />

//               <textarea
//                 className="form-control mb-2"
//                 placeholder="Description"
//                 value={item.description}
//                 onChange={(e) =>
//                   handleChange(index, "description", e.target.value)
//                 }
//               />
//               <select
//                 className="form-select"
//                 value={item.category}
//                 onChange={(e) =>
//                   handleChange(index, "category", e.target.value)
//                 }
//               >
//                 <option value="">Select Category</option>
//                 {CATEGORY_OPTIONS.map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           ))}

//           {selectedFiles.length > 0 && (
//             <button
//               className="btn btn-primary"
//               onClick={editId ? handleUpdate : handleUpload}
//             >
//               {editId ? "Update" : "Upload"}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ================= TABLE ================= */}

//       <div className="card-body">
//         <h5 className="fw-bold text-primary mb-3">Gallery List</h5>

//         <div className="table-responsive">
//           <table className="table table-hover align-middle mb-0 bg-white">
//             <thead style={{ backgroundColor: "#ffffffff" }}>
//               <tr>
//                 {["Title", "Description", "Category", "Preview", "Action"].map(
//                   (head) => (
//                     <th
//                       key={head}
//                       style={{
//                         fontWeight: "500",
//                         fontSize: "14px",
//                         color: "#6c757d",
//                         borderBottom: "2px solid #dee2e6",
//                         padding: "12px",
//                         whiteSpace: "nowrap",
//                         textAlign: head === "Action" ? "center" : "left",
//                       }}
//                     >
//                       {head}
//                     </th>
//                   )
//                 )}
//               </tr>
//             </thead>

//             <tbody>
//               {galleryItems.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="5"
//                     className="text-center py-4"
//                     style={{ color: "#6c757d" }}
//                   >
//                     No records found
//                   </td>
//                 </tr>
//               ) : (
//                 currentItems.map((item) => (
//                   <tr key={item._id} className="align-middle">
//                     <td
//                       style={{
//                         padding: "12px",
//                         fontSize: "14px",
//                         borderBottom: "1px solid #dee2e6",
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       {item.title}
//                     </td>

//                     <td
//                       style={{
//                         padding: "12px",
//                         fontSize: "14px",
//                         borderBottom: "1px solid #dee2e6",
//                       }}
//                     >
//                       {item.description}
//                     </td>

//                     <td
//                       style={{
//                         padding: "12px",
//                         fontSize: "14px",
//                         borderBottom: "1px solid #dee2e6",
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       {item.category}
//                     </td>

//                     <td
//                       style={{
//                         padding: "12px",
//                         fontSize: "14px",
//                         borderBottom: "1px solid #dee2e6",
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       {item.type === "image" && (
//                         <img src={item.url} width="60" className="rounded" />
//                       )}
//                       {item.type === "video" && <span>🎥 Video</span>}
//                       {item.type === "pdf" && <span>📄 PDF</span>}
//                     </td>

//                     <td
//                       style={{
//                         padding: "12px",
//                         fontSize: "14px",
//                         borderBottom: "1px solid #dee2e6",
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       <div className="d-flex gap-2 justify-content-center">
//                         <button
//                           className="btn btn-sm custom-outline-btn"
//                           onClick={() => handleEdit(item)}
//                         >
//                           Edit
//                         </button>

//                         <button
//                           className="btn btn-sm btn-outline-danger"
//                           onClick={() => handleDelete(item._id)}
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* optional small css */}
//       <style>{`
//   /* TEXT */
//   .text-primary {
//     color: #3A5FBE !important;
//   }

//   /* BUTTON */
//   .btn-primary {
//     background-color: #3A5FBE !important;
//     border-color: #3A5FBE !important;
//   }

//   .btn-primary:hover {
//     background-color: #2f4fb0 !important;
//     border-color: #2f4fb0 !important;
//   }

//   /* BORDER */
//   .border-primary {
//     border-color: #3A5FBE !important;
//   }

//   .border-dashed {
//     border-style: dashed !important;
//   }

// /* ===== GALLERY TABLE THEME (same as Task table) ===== */

//   .gallery-theme-table {
//     border: 1px solid #dee2e6;
//   }

//   .gallery-theme-table th,
//   .gallery-theme-table td {
//     font-size: 13px;
//     color: #212529;
//     vertical-align: middle;
//     border-color: #dee2e6;
//   }

//   .gallery-table-head {
//     background-color: #ffffff;
//     border-bottom: 1px solid #dee2e6;
//   }

//   .gallery-table-head th {
//     font-weight: 600;
//     color: #495057;
//     white-space: nowrap;
//   }

//   .gallery-theme-table tbody tr:hover {
//     background-color: #f8f9fa;
//     cursor: pointer;
//   }

//   .gallery-page {
//   padding-top: 8px !important;   /* main fix */
// }

// `}</style>

//       <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
//         <div className="d-flex align-items-center gap-3">
//           {/* Rows per page */}
//           <div className="d-flex align-items-center">
//             <span
//               style={{ fontSize: "14px", marginRight: "8px", color: "#212529" }}
//             >
//               Rows per page:
//             </span>
//             <select
//               className="form-select form-select-sm"
//               style={{ width: "auto", fontSize: "14px" }}
//               value={itemsPerPage}
//               onChange={(e) => {
//                 setItemsPerPage(Number(e.target.value));
//                 setCurrentPage(1);
//               }}
//             >
//               <option value={5}>5</option>
//               <option value={10}>10</option>
//               <option value={25}>25</option>
//             </select>
//           </div>

//           {/* Range display */}
//           <span
//             style={{ fontSize: "14px", marginLeft: "16px", color: "#212529" }}
//           >
//             {galleryItems.length === 0
//               ? "0–0 of 0"
//               : `${indexOfFirstItem + 1}-${Math.min(
//                   indexOfLastItem,
//                   galleryItems.length
//                 )} of ${galleryItems.length}`}
//           </span>
//           {/* Arrows */}
//           <div
//             className="d-flex align-items-center"
//             style={{ marginLeft: "16px" }}
//           >
//             <button
//               className="btn btn-sm border-0"
//               onClick={() => setCurrentPage(currentPage - 1)}
//               disabled={currentPage === 1}
//               style={{ fontSize: "18px", padding: "2px 8px", color: "#212529" }}
//             >
//               ‹
//             </button>
//             <button
//               className="btn btn-sm border-0"
//               onClick={() => setCurrentPage(currentPage + 1)}
//               disabled={currentPage === totalPages}
//               style={{ fontSize: "18px", padding: "2px 8px", color: "#212529" }}
//             >
//               ›
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="text-end mt-3">
//         <button
//           className="btn btn-sm custom-outline-btn"
//           style={{ minWidth: 90 }}
//           onClick={() => window.history.go(-1)}
//         >
//           Back
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Gallery;

//Rushikesh 20-01-2026

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_URL = "https://server-backend-nu.vercel.app/api/gallery";

const CATEGORY_OPTIONS = [
  "Rewards & Recognition",
  "Engagement Activities",
  "Social Activities",
];

function Gallery() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFile, setEditFile] = useState(null);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachFiles, setAttachFiles] = useState([]);

  const [editData, setEditData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchCategory, setSearchCategory] = useState("");

  // Calculate total pages
  const totalPages = Math.ceil(galleryItems.length / itemsPerPage);

  // Slice galleryItems for current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [showUploadModal, setShowUploadModal] = useState(false);
  const currentItems = galleryItems.slice(indexOfFirstItem, indexOfLastItem);
  const fileInputRef = useRef(null);
  /* ================= FETCH ================= */
  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const res = await axios.get(API_URL);
    setGalleryItems(res.data);
  };

  /* ================= FILE SELECT ================= */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const mapped = files.map((file) => ({
      file,
      type: file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("video")
          ? "video"
          : "pdf",
      preview:
        file.type.startsWith("image") || file.type.startsWith("video")
          ? URL.createObjectURL(file)
          : null,
      title: "",
      description: "",
      category: "",
    }));

    setSelectedFiles(mapped);
  };

  /* ================= INPUT CHANGE ================= */
  const handleChange = (index, field, value) => {
    const updated = [...selectedFiles];
    updated[index][field] = value;
    setSelectedFiles(updated);
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!selectedFiles.length) {
      alert("Please select files");
      return;
    }

    for (let item of selectedFiles) {
      if (!item.category) {
        alert("Please select category for all files");
        return;
      }
    }

    try {
      const formData = new FormData();

      selectedFiles.forEach((item) => {
        formData.append("files", item.file);
        formData.append("titles[]", item.title);
        formData.append("descriptions[]", item.description);
        formData.append("categories[]", item.category);
      });
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setGalleryItems((prev) => [...res.data, ...prev]);
      setSelectedFiles([]);
      setEditId(null);
      alert("Upload successful ✅");
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed ❌");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setSelectedFiles([
      {
        file: null,
        type: item.type,
        preview: item.url,
        title: item.title,
        description: item.description,
        category: item.category,
      },
    ]);
    setEditFile(null);
    setEditId(item._id);
    setShowEditModal(true);
  };

  const handleEditCancel = () => {
    setSelectedFiles([]);
    setEditId(null);
    setShowEditModal(false);
  };

  // const handleUpdate = async () => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("title", selectedFiles[0].title);
  //     formData.append("description", selectedFiles[0].description);
  //     formData.append("category", selectedFiles[0].category);

  //     if (editFile) {
  //       formData.append("file", editFile); // 👈 new file
  //     }

  //     await axios.put(`${API_URL}/${editId}`, formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     fetchGallery();
  //     setSelectedFiles([]);
  //     setEditId(null);
  //     setEditFile(null);
  //     setShowEditModal(false);

  //     alert("Updated successfully ✅");
  //   } catch {
  //     alert("Update failed ❌");
  //   }
  // };
  const handleUpdate = async () => {
    try {
      await axios.put(`${API_URL}/${editId}`, {
        title: selectedFiles[0].title,
        description: selectedFiles[0].description,
        category: selectedFiles[0].category,
      });

      fetchGallery();
      setSelectedFiles([]);
      setEditId(null);
      alert("Updated successfully ✅");
    } catch {
      alert("Update failed ❌");
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setEditFile(file);

    setSelectedFiles((prev) => [
      {
        ...prev[0],
        file,
        type: file.type.startsWith("image")
          ? "image"
          : file.type.startsWith("video")
            ? "video"
            : "pdf",
        preview: URL.createObjectURL(file),
      },
    ]);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await axios.delete(`${API_URL}/${id}`);
    setGalleryItems((prev) => prev.filter((i) => i._id !== id));
  };

  const handleRowClick = (item) => {
    setViewItem(item);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewItem(null);
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setSelectedFiles([]);
    setEditId(null);
  };
  const filteredItems = galleryItems.filter((item) => {
    const textMatch =
      item.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchText.toLowerCase());

    const categoryMatch = !searchCategory || item.category === searchCategory;

    return textMatch && categoryMatch;
  });

  return (
    <div className="container-fluid bg-light min-vh-100">
      <h4 className="text-primary fw-bold mb-2 mt-0">Gallery</h4>
      {/* ===== Attach File Button ===== */}
      <button
        className="btn btn-sm custom-outline-btn mb-3"
        onClick={() => fileInputRef.current.click()}
      >
        Attach File
      </button>
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*,video/*,.pdf"
        hidden
        onChange={(e) => {
          handleFileChange(e);
          setShowUploadModal(true); // ✅ auto open modal
        }}
      />

      {/* ================= MODAL ================= */}
      {showUploadModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div
                className="modal-header text-white"
                style={{ backgroundColor: "#3A5FBE" }}
              >
                <h5 style={{ color: "white" }}>Upload Gallery File</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>

              <div className="modal-body">
                {selectedFiles.map((item, index) => (
                  <div key={index} className="mb-3">
                    {item.type === "image" && (
                      <img
                        src={item.preview}
                        width="120"
                        className="mb-2 rounded"
                      />
                    )}
                    {item.type === "video" && (
                      <video src={item.preview} width="150" controls />
                    )}
                    {item.type === "pdf" && <p>📄 PDF Selected</p>}
                    <div>
                      <label className="form-label fw-bold">Title</label>
                      <input
                        className="form-control mb-2"
                        placeholder="Title"
                        value={item.title}
                        onChange={(e) =>
                          handleChange(index, "title", e.target.value)
                        }
                      />
                    </div>

                    <label className="form-label fw-bold">Description</label>
                    <textarea
                      className="form-control mb-2"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        handleChange(index, "description", e.target.value)
                      }
                    />
                    <label className="form-label fw-bold">
                      Select Category
                    </label>
                    <select
                      className="form-select"
                      value={item.category}
                      onChange={(e) =>
                        handleChange(index, "category", e.target.value)
                      }
                    >
                      <option value="">Select Category</option>
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-sm custom-outline-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                {selectedFiles.length > 0 && (
                  <button
                    className="btn btn-sm custom-outline-btn"
                    onClick={editId ? handleUpdate : handleUpload}
                  >
                    {editId ? "Update" : "Upload"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="d-flex align-items-center justify-content-between bg-white p-3 mb-3"
        style={{ borderRadius: "6px" }}
      >
        {/* LEFT : SEARCH + STATUS */}
        <div className="d-flex align-items-center gap-3">
          <span className="fw-semibold text-primary">Search By any field</span>

          <input
            type="text"
            className="form-control"
            placeholder="Search by any field..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: "280px" }}
          />

          <span className="fw-semibold text-primary">Status</span>

          <select
            className="form-select"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            style={{ width: "200px" }}
          >
            <option value="">All Categories</option>
            <option value="Social Activities">Social Activities</option>
            <option value="Engagement Activities">Engagement Activities</option>
            <option value="Rewards & Recognition">Rewards & Recognition</option>
          </select>
        </div>

        {/* RIGHT : FILTER + RESET */}
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm custom-outline-btn"
            style={{ minWidth: 90 }}
          >
            Filter
          </button>

          <button
            className="btn btn-sm custom-outline-btn"
            style={{ minWidth: 90 }}
            onClick={() => {
              setSearchText("");
              setSearchCategory("");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 bg-white">
            <thead style={{ backgroundColor: "#ffffffff" }}>
              <tr>
                {["Title", "Description", "Category", "Preview", "Action"].map(
                  (head) => (
                    <th
                      key={head}
                      style={{
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#6c757d",
                        borderBottom: "2px solid #dee2e6",
                        padding: "12px",
                        whiteSpace: "nowrap",
                        textAlign: head === "Action" ? "center" : "left",
                      }}
                    >
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {galleryItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-4"
                    style={{ color: "#6c757d" }}
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                filteredItems
                  .slice(indexOfFirstItem, indexOfLastItem)
                  .map((item) => (
                    <tr
                      key={item._id}
                      className="align-middle"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRowClick(item)}
                    >
                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.title}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                        }}
                      >
                        {item.description}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.category}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.type === "image" && (
                          <img src={item.url} width="60" className="rounded" />
                        )}
                        {item.type === "video" && <span>🎥 Video</span>}
                        {item.type === "pdf" && <span>📄 PDF</span>}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          fontSize: "14px",
                          borderBottom: "1px solid #dee2e6",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm custom-outline-btn"
                            style={{ minWidth: 90 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm custom-outline-btn"
                            style={{ minWidth: 90 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item._id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* optional small css */}
      <style>{`
  /* TEXT */
  .text-primary {
    color: #3A5FBE !important;
  }

  /* BUTTON */
  .btn-primary {
    background-color: #3A5FBE !important;
    border-color: #3A5FBE !important;
  }

  .btn-primary:hover {
    background-color: #2f4fb0 !important;
    border-color: #2f4fb0 !important;
  }

  /* BORDER */
  .border-primary {
    border-color: #3A5FBE !important;
  }

  .border-dashed {
    border-style: dashed !important;
  }

/* ===== GALLERY TABLE THEME (same as Task table) ===== */

  .gallery-theme-table {
    border: 1px solid #dee2e6;
  }

  .gallery-theme-table th,
  .gallery-theme-table td {
    font-size: 13px;
    color: #212529;
    vertical-align: middle;
    border-color: #dee2e6;
  }

  .gallery-table-head {
    background-color: #ffffff;
    border-bottom: 1px solid #dee2e6;
  }

  .gallery-table-head th {
    font-weight: 600;
    color: #495057;
    white-space: nowrap;
  }

  .gallery-theme-table tbody tr:hover {
    background-color: #f8f9fa;
    cursor: pointer;
  }

  .gallery-page {
  padding-top: 8px !important;   /* main fix */
}

`}</style>

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
            {galleryItems.length === 0
              ? "0–0 of 0"
              : `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, galleryItems.length)} of ${galleryItems.length}`}
          </span>
          {/* Arrows */}
          <div
            className="d-flex align-items-center"
            style={{ marginLeft: "16px" }}
          >
            <button
              className="btn btn-sm border-0"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ fontSize: "18px", padding: "2px 8px", color: "#212529" }}
            >
              ‹
            </button>
            <button
              className="btn btn-sm border-0"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ fontSize: "18px", padding: "2px 8px", color: "#212529" }}
            >
              ›
            </button>
          </div>
        </div>
      </nav>

      <div className="text-end mt-3">
        <button
          className="btn btn-sm custom-outline-btn"
          style={{ minWidth: 90 }}
          onClick={() => window.history.go(-1)}
        >
          Back
        </button>
      </div>
      {showViewModal && viewItem && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={closeViewModal}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content"
              style={{ borderRadius: "8px" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ===== HEADER ===== */}
              <div
                className="modal-header"
                style={{
                  backgroundColor: "#3A5FBE",
                  color: "#fff",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                }}
              >
                <h5 className="modal-title fw-semibold">Gallery Details</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={closeViewModal}
                ></button>
              </div>

              {/* ===== BODY ===== */}
              <div className="modal-body px-4 py-3">
                <div className="row mb-2">
                  <div className="col-4 fw-semibold">Title</div>
                  <div className="col-8">{viewItem.title || "-"}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-4 fw-semibold">Description</div>
                  <div className="col-8">{viewItem.description || "-"}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-4 fw-semibold">Category</div>
                  <div className="col-8">{viewItem.category || "-"}</div>
                </div>

                <div className="row mb-3">
                  <div className="col-4 fw-semibold">Type</div>
                  <div className="col-8 text-capitalize">{viewItem.type}</div>
                </div>

                {/* ===== PREVIEW ===== */}
                <div className="text-center mt-3">
                  {viewItem.type === "image" && (
                    <img
                      src={viewItem.url}
                      className="img-fluid rounded"
                      style={{ maxHeight: 250 }}
                    />
                  )}

                  {viewItem.type === "video" && (
                    <video
                      src={viewItem.url}
                      controls
                      className="w-100 rounded"
                    />
                  )}

                  {viewItem.type === "pdf" && (
                    <a
                      href={viewItem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-primary"
                    >
                      Open PDF
                    </a>
                  )}
                </div>
              </div>

              {/* ===== FOOTER ===== */}
              <div className="modal-footer">
                <button
                  className="btn btn-sm custom-outline-btn"
                  style={{ minWidth: 90 }}
                  onClick={closeViewModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditModal && selectedFiles.length > 0 && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowEditModal(false)}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content"
              style={{ borderRadius: "8px" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div
                className="modal-header"
                style={{
                  backgroundColor: "#3A5FBE",
                  color: "#fff",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                }}
              >
                <h5 className="modal-title fw-semibold">
                  Edit Gallery Details
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>

              {/* BODY */}
              <div className="modal-body px-4 py-3">
                {/* Title */}
                <div className="row mb-2">
                  <div className="col-4 fw-semibold">Title</div>
                  <div className="col-8">
                    <input
                      className="form-control"
                      value={selectedFiles[0].title}
                      onChange={(e) => handleChange(0, "title", e.target.value)}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="row mb-2">
                  <div className="col-4 fw-semibold">Description</div>
                  <div className="col-8">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={selectedFiles[0].description}
                      onChange={(e) =>
                        handleChange(0, "description", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="row mb-3">
                  <div className="col-4 fw-semibold">Category</div>
                  <div className="col-8">
                    <select
                      className="form-select"
                      value={selectedFiles[0].category}
                      onChange={(e) =>
                        handleChange(0, "category", e.target.value)
                      }
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* PREVIEW */}
                <div className="text-center mb-3">
                  {selectedFiles[0].type === "image" && (
                    <img
                      src={selectedFiles[0].preview}
                      className="img-fluid rounded"
                      style={{ maxHeight: 220 }}
                    />
                  )}
                  {selectedFiles[0].type === "video" && (
                    <video
                      src={selectedFiles[0].preview}
                      controls
                      className="w-100 rounded"
                    />
                  )}
                  {selectedFiles[0].type === "pdf" && <p>📄 PDF Selected</p>}
                </div>

                {/* FILE CHANGE */}
                <div className="text-center">
                  <label
                    className="btn btn-sm custom-outline-btn"
                    style={{ minWidth: 90 }}
                  >
                    Change File
                    <input
                      type="file"
                      hidden
                      accept="image/*,video/*,.pdf"
                      onChange={handleEditFileChange}
                    />
                  </label>
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer">
                <button
                  className="btn btn-sm custom-outline-btn"
                  style={{ minWidth: 90 }}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-sm custom-outline-btn"
                  style={{ minWidth: 90 }}
                  onClick={handleUpdate}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
