// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const API_URL = "https://server-backend-nu.vercel.app/api/gallery";

// function Gallery() {
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [galleryItems, setGalleryItems] = useState([]);
//   const [editId, setEditId] = useState(null);

//   /* ================= FETCH ================= */
//   useEffect(() => {
//     fetchGallery();
//   }, []);

//   const fetchGallery = async () => {
//     const res = await axios.get(API_URL);
//     setGalleryItems(res.data);
//   };

//   /* ================= SELECT FILE ================= */
//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     const newFiles = files.map((file) => ({
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
//     }));
//     setSelectedFiles(newFiles);
//   };

//   /* ================= CHANGE ================= */
//   const handleChange = (index, field, value) => {
//     const updated = [...selectedFiles];
//     updated[index][field] = value;
//     setSelectedFiles(updated);
//   };

//   /* ================= UPLOAD ================= */
//   const handleUpload = async () => {
//     if (selectedFiles.length === 0) return alert("Select files first");

//     const formData = new FormData();
//     selectedFiles.forEach((item) => {
//       formData.append("files", item.file);
//       formData.append("titles", item.title);
//       formData.append("descriptions", item.description);
//     });

//     const res = await axios.post(`${API_URL}/upload`, formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });

//     setGalleryItems((prev) => [...res.data, ...prev]);
//     setSelectedFiles([]);
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
//       },
//     ]);
//     setEditId(item._id);
//   };

//   const handleUpdate = async () => {
//     await axios.put(`${API_URL}/${editId}`, {
//       title: selectedFiles[0].title,
//       description: selectedFiles[0].description,
//     });

//     fetchGallery();
//     setSelectedFiles([]);
//     setEditId(null);
//   };

//   /* ================= DELETE ================= */
//   const handleDelete = async (id) => {
//     await axios.delete(`${API_URL}/${id}`);
//     setGalleryItems(galleryItems.filter((item) => item._id !== id));
//   };

//   /* ================= STYLES ================= */
//   const styles = {
//     page: { minHeight: "100vh", background: "#F4F6FA", padding: "30px" },
//     card: { background: "#fff", borderRadius: "12px", padding: "25px", marginBottom: "30px" },
//     title: { fontSize: "24px", color: "#3A5FBE", marginBottom: "20px" },
//     uploadBox: {
//       border: "2px dashed #3A5FBE",
//       padding: "30px",
//       textAlign: "center",
//       cursor: "pointer",
//       borderRadius: "12px",
//     },
//     hiddenInput: { display: "none" },
//     inputField: { width: "100%", marginTop: "8px", padding: "8px" },
//     textarea: { width: "100%", marginTop: "8px", padding: "8px" },
//     btn: {
//       background: "#3A5FBE",
//       color: "#fff",
//       padding: "8px 14px",
//       border: "none",
//       borderRadius: "6px",
//       cursor: "pointer",
//       marginRight: "6px",
//     },
//     deleteBtn: {
//       background: "#E74C3C",
//       color: "#fff",
//       padding: "6px 10px",
//       border: "none",
//       borderRadius: "6px",
//       cursor: "pointer",
//     },
//     table: { width: "100%", borderCollapse: "collapse" },
//     thtd: { border: "1px solid #ddd", padding: "10px", textAlign: "center", fontSize: "14px" },
//     galleryGrid: {
//       display: "grid",
//       gridTemplateColumns: "repeat(4, 1fr)",
//       gap: "15px",
//       marginTop: "20px",
//     },
//     galleryCard: { background: "#fff", borderRadius: "12px", padding: "10px", textAlign: "center" },
//     galleryPreview: { width: "100%", borderRadius: "8px", marginBottom: "8px" },
//     galleryTitle: { fontWeight: "bold", marginBottom: "5px" },
//     galleryDesc: { fontSize: "14px", color: "#555" },
//   };

//   return (
//     <div style={styles.page}>
//       {/* Upload Section */}
//       <div style={styles.card}>
//         <div style={styles.title}>Admin Gallery Upload</div>
//         <label style={styles.uploadBox}>
//           <input
//             type="file"
//             multiple
//             accept="image/*,video/*,.pdf"
//             onChange={handleFileChange}
//             style={styles.hiddenInput}
//           />
//           Click to Select Image / Video / PDF
//         </label>

//         {selectedFiles.map((item, index) => (
//           <div key={index} style={{ marginTop: "15px" }}>
//             {item.type === "image" && <img src={item.preview} width="120" />}
//             {item.type === "video" && <video src={item.preview} width="150" controls />}
//             {item.type === "pdf" && <p>📄 PDF Selected</p>}

//             <input
//               placeholder="Title"
//               value={item.title}
//               onChange={(e) => handleChange(index, "title", e.target.value)}
//               style={styles.inputField}
//             />
//             <textarea
//               placeholder="Description"
//               value={item.description}
//               onChange={(e) => handleChange(index, "description", e.target.value)}
//               style={styles.textarea}
//             />
//           </div>
//         ))}

//         {selectedFiles.length > 0 && (
//           <button style={styles.btn} onClick={editId ? handleUpdate : handleUpload}>
//             {editId ? "Update" : "Upload"}
//           </button>
//         )}
//       </div>

//       {/* Table Section */}
//       <div style={styles.card}>
//         <div style={styles.title}>Gallery List</div>
//         <table style={styles.table}>
//           <thead>
//             <tr style={{ backgroundColor: "#F1F3F6" }}>
//               <th style={styles.thtd}>Title</th>
//               <th style={styles.thtd}>Description</th>
//               <th style={styles.thtd}>Image</th>
//               <th style={styles.thtd}>PDF</th>
//               <th style={styles.thtd}>Video</th>
//               <th style={styles.thtd}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {galleryItems.map((item) => (
//               <tr key={item._id}>
//                 <td style={styles.thtd}>{item.title}</td>
//                 <td style={styles.thtd}>{item.description}</td>
//                 <td style={styles.thtd}>{item.type === "image" && <img src={item.url} width="60" />}</td>
//                 <td style={styles.thtd}>{item.type === "pdf" && "📄 View"}</td>
//                 <td style={styles.thtd}>{item.type === "video" && "🎥 View"}</td>
//                 <td style={styles.thtd}>
//                   <button style={styles.btn} onClick={() => handleEdit(item)}>Edit</button>
//                   <button style={styles.deleteBtn} onClick={() => handleDelete(item._id)}>Delete</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Gallery History Grid (4 items per row) */}
//       {/* <div style={styles.card}>
//         <div style={styles.title}>Gallery History</div>
//         <div style={styles.galleryGrid}>
//           {galleryItems.map((item) => (
//             <div key={item._id} style={styles.galleryCard}>
//               {item.type === "image" && <img src={item.url} style={styles.galleryPreview} />}
//               {item.type === "video" && <video src={item.url} style={styles.galleryPreview} controls />}
//               {item.type === "pdf" && <p>📄 PDF</p>}
//               <div style={styles.galleryTitle}>{item.title}</div>
//               <div style={styles.galleryDesc}>{item.description}</div>
//             </div>
//           ))}
//         </div>
//       </div> */}
//     </div>
//   );
// }

// export default Gallery;

//added by snehal
import React, { useEffect, useState } from "react";
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
  const [activeTab, setActiveTab] = useState(CATEGORY_OPTIONS[0]);
  const [message, setMessage] = useState(""); // text of the message
  const [messageType, setMessageType] = useState(""); // "success" or "error"

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
      setMessageType("Success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed ❌");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
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
    setEditId(item._id);
  };

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
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      alert("Update failed ❌");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await axios.delete(`${API_URL}/${id}`);
    setGalleryItems((prev) => prev.filter((i) => i._id !== id));
  };

  /* ================= FILTER ================= */
  const filteredItems = galleryItems.filter(
    (item) => item.category === activeTab
  );

  /* ================= STYLES ================= */
  const styles = {
    page: { padding: 30, background: "#F4F6FA", minHeight: "100vh" },
    card: {
      background: "#fff",
      padding: 25,
      borderRadius: 12,
      marginBottom: 25,
    },
    title: { fontSize: 24, color: "#3A5FBE", marginBottom: 20 },
    uploadBox: {
      border: "2px dashed #3A5FBE",
      padding: 30,
      textAlign: "center",
      borderRadius: 12,
      cursor: "pointer",
    },
    input: { width: "100%", padding: 8, marginTop: 8 },
    btn: {
      background: "#3A5FBE",
      color: "#fff",
      border: "none",
      padding: "8px 14px",
      borderRadius: 6,
      marginTop: 12,
      marginRight: 8,
      cursor: "pointer",
    },
    deleteBtn: {
      background: "#E74C3C",
      color: "#fff",
      border: "none",
      padding: "8px 14px",
      borderRadius: 6,
      cursor: "pointer",
    },
    tabWrap: {
      display: "flex",
      justifyContent: "center",
      gap: 15,
      marginBottom: 25,
    },
    tab: (active) => ({
      padding: "8px 18px",
      borderRadius: 20,
      border: "1px solid #3A5FBE",
      background: active ? "#3A5FBE" : "#fff",
      color: active ? "#fff" : "#3A5FBE",
      cursor: "pointer",
      fontWeight: 500,
    }),
  };
  const th = {
    padding: "12px",
    border: "1px solid #ddd",
    fontWeight: 600,
  };

  const td = {
    padding: "10px",
    border: "1px solid #ddd",
  };

  return (
    <div className="container-fluid">
      <h2
        style={{
          color: "#3A5FBE",
          fontSize: "25px",
          marginLeft: "15px",
          marginBottom: "40px",
        }}
      >
        Gallery
      </h2>
      {/* ================= UPLOAD ================= */}

      <div style={styles.card}>
        <div className="fw-bold" style={styles.title}>
          Admin Gallery Upload
        </div>

        <label style={styles.uploadBox}>
          <input
            type="file"
            multiple
            accept="image/*,video/*,.pdf"
            hidden
            onChange={handleFileChange}
          />
          Click to select Image / Video / PDF
        </label>

        {selectedFiles.map((item, index) => (
          <div key={index} style={{ marginTop: 15 }}>
            {item.type === "image" && <img src={item.preview} width="120" />}
            {item.type === "video" && (
              <video src={item.preview} width="150" controls />
            )}
            {item.type === "pdf" && <p>📄 PDF Selected</p>}

            <input
              placeholder="Title"
              style={styles.input}
              value={item.title}
              onChange={(e) => handleChange(index, "title", e.target.value)}
            />

            <textarea
              placeholder="Description"
              style={styles.input}
              value={item.description}
              onChange={(e) =>
                handleChange(index, "description", e.target.value)
              }
            />

            <select
              style={styles.input}
              value={item.category}
              onChange={(e) => handleChange(index, "category", e.target.value)}
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

        {selectedFiles.length > 0 && (
          <button
            style={styles.btn}
            onClick={editId ? handleUpdate : handleUpload}
          >
            {editId ? "Update" : "Upload"}
          </button>
        )}
      </div>
      {/* ================= GALLERY TABLE ================= */}
      <div style={styles.card}>
        <div className="fw-bold" style={styles.title}>
          Gallery List
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: "800px",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr style={{ background: "#F0F3FF" }}>
                <th style={th}>Title</th>
                <th style={th}>Description</th>
                <th style={th}>Category</th>
                <th style={th}>Preview</th>
                <th style={th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {galleryItems.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: 20 }}>
                    No records found
                  </td>
                </tr>
              )}

              {galleryItems.map((item) => (
                <tr key={item._id}>
                  <td style={td}>{item.title}</td>
                  <td style={td}>{item.description}</td>
                  <td style={td}>{item.category}</td>

                  <td style={td}>
                    {item.type === "image" && (
                      <img
                        src={item.url}
                        alt=""
                        width="60"
                        style={{ borderRadius: 6 }}
                      />
                    )}

                    {item.type === "video" && <span>🎥 Video</span>}

                    {item.type === "pdf" && <span>📄 PDF</span>}
                  </td>

                  <td style={td}>
                    <button style={styles.btn} onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CATEGORY TABS ================= */}
      {/* <div style={styles.tabWrap}>
        {CATEGORY_OPTIONS.map((cat) => (
          <div
            key={cat}
            style={styles.tab(activeTab === cat)}
            onClick={() => setActiveTab(cat)}
          >
            {cat}
          </div>
        ))}
      </div> */}

      {/* ================= GALLERY ================= */}
      {/* <div style={styles.card}>
        <div style={styles.title}>{activeTab}</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {filteredItems.map((item) => (
            <div
              key={item._id}
              style={{
                width: 220,
                background: "#fff",
                padding: 12,
                borderRadius: 10,
                boxShadow: "0 0 10px rgba(0,0,0,.1)",
              }}
            >
              {item.type === "image" && (
                <img src={item.url} width="100%" />
              )}
              {item.type === "video" && <p>🎥 Video</p>}
              {item.type === "pdf" && <p>📄 PDF</p>}

              <h4>{item.title}</h4>
              <p>{item.description}</p>

              <button style={styles.btn} onClick={() => handleEdit(item)}>
                Edit
              </button>
              <button
                style={styles.deleteBtn}
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}

export default Gallery;
