






// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "../Events/VisualDiary.css";

// const VisualDiary = () => {
//   const [gallery, setGallery] = useState([]);
//   const [activeType, setActiveType] = useState("image");
//   const [loading, setLoading] = useState(true);
//   const [popupItem, setPopupItem] = useState(null);

//   useEffect(() => {
//     axios.get("https://server-backend-nu.vercel.app/api/gallery")
//       .then((res) => {
//         setGallery(res.data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("API Error:", err);
//         setLoading(false);
//       });
//   }, []);

//   const filteredGallery = gallery.filter((item) => {
//     const type = item.resourceType || item.type;
//     if (activeType === "pdf") return type === "raw" || type === "pdf";
//     return type === activeType;
//   });

//   return (
//     <div className="gallery-wrapper">
//       <h2 className="gallery-title">Gallery Collection</h2>
//       <p className="gallery-subtitle">
//         A curated collection of images, videos, and PDFs with details.
//       </p>

//       {/* Filter Buttons */}
//       <div className="top-filter-bar">
//         {["image", "video", "pdf"].map((type) => (
//           <button
//             key={type}
//             className={activeType === type ? "filter active" : "filter"}
//             onClick={() => setActiveType(type)}
//           >
//             {type.toUpperCase()}
//           </button>
//         ))}
//       </div>

//       {loading && <p className="loading-text">Loading gallery...</p>}

//       {/* Gallery Grid */}
//       <div className="gallery-grid">
//         {filteredGallery.map((item, index) => {
//           const fileUrl = item.url || item.imageUrl || item.fileUrl;
//           const type = item.resourceType || item.type;

//           return (
//             <div
//               className="gallery-card animate-card"
//               key={item._id}
//               onClick={() => setPopupItem({ ...item, type, fileUrl })}
//             >
//               <div className="card-overlay"></div>
//               {type === "image" && <img src={fileUrl} alt={item.title || "Gallery"} />}
//               {type === "video" && (
//                 <div className="video-wrapper">
//                   <video src={fileUrl} />
//                   <div className="play-icon">▶</div>
//                 </div>
//               )}
//               {(type === "raw" || type === "pdf") && (
//                 <div className="pdf-card">
//                   <span className="pdf-icon">📄</span>
//                   <p>{item.title || "Untitled"}</p>
//                 </div>
//               )}
//               <div className="card-title1">{item.title}</div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Popup Lightbox */}
//       {popupItem && (
//         <div className="popup-overlay1" onClick={() => setPopupItem(null)}>
//           <div className="popup-content" onClick={(e) => e.stopPropagation()}>
//             <span className="popup-close" onClick={() => setPopupItem(null)}>×</span>
//             <h3>{popupItem.title || "Untitled"}</h3>
//             <p>{popupItem.description || "No description available."}</p>
//             {popupItem.type === "image" && <img src={popupItem.fileUrl} alt={popupItem.title} />}
//             {popupItem.type === "video" && <video src={popupItem.fileUrl} controls autoPlay />}
//             {(popupItem.type === "raw" || popupItem.type === "pdf") && (
//               <iframe
//                 src={popupItem.fileUrl}
//                 title={popupItem.title}
//                 frameBorder="0"
//               ></iframe>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VisualDiary;

//Added by snehal
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VisualDiary.css";

const CATEGORY_LIST = [
  "Rewards & Recognition",
  "Engagement Activities",
  "Social Activities",
];

const FILE_TYPES = ["image", "video", "pdf"];

const VisualDiary = () => {
  const [gallery, setGallery] = useState([]);
  const [activeType, setActiveType] = useState("image");
  const [loading, setLoading] = useState(true);
  const [popupItem, setPopupItem] = useState(null);

  useEffect(() => {
    axios
      .get("https://server-backend-nu.vercel.app/api/gallery")
      .then((res) => {
        setGallery(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gallery API Error:", err);
        setLoading(false);
      });
  }, []);

  const getCategoryItems = (category) => {
    return gallery.filter((item) => {
      const type = item.resourceType || item.type;

      if (activeType === "pdf") {
        return item.category === category && (type === "raw" || type === "pdf");
      }

      return item.category === category && type === activeType;
    });
  };

  return (
    <div className="gallery-wrapper">
      {/* <h2 className="gallery-title">Visual Diary</h2>
      <p className="gallery-subtitle">
        Category-wise gallery with images, videos & documents
      </p> */}

      {/* FILTER */}
      <div className="top-filter-bar">
        {FILE_TYPES.map((type) => (
          <button
            key={type}
            className={activeType === type ? "filter active" : "filter"}
            onClick={() => setActiveType(type)}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <p className="loading-text">Loading gallery...</p>}

      {/* THREE COLUMNS */}
      <div className="three-column-layout">
        {CATEGORY_LIST.map((category) => {
          const items = getCategoryItems(category);

          return (
            <div key={category} className="section-wrapper">
              <h3 className="category-title">{category}</h3>

              {/* SCROLLABLE CARD */}
              <div className="section-card">
                {items.length === 0 && !loading && (
                  <p className="no-data">No data available</p>
                )}

                {items.map((item) => {
                  const type = item.resourceType || item.type;
                  const fileUrl = item.url;

                  return (
                    <div
                      key={item._id}
                      className="section-item"
                      onClick={() =>
                        setPopupItem({ ...item, type, fileUrl })
                      }
                    >
                      {/* HIGHLIGHTED TITLE (TOP) */}
                      <div className="highlighted-title">
                        {item.title}
                      </div>

                      <div className="item-divider"></div>

                      {type === "image" && (
                        <img src={fileUrl} alt={item.title} />
                      )}

                      {/* {type === "video" && (
                        <div className="icon-box">▶</div>
                      )} */}
                      {type === "video" && (
                        <video
                          src={fileUrl}
                          muted
                          loop
                          playsInline
                          style={{
                            width: "120px",
                            height: "120px",
                            objectFit: "cover",
                            margin: "8px auto",
                            borderRadius: "8px",
                          }}
                        />
                      )}


                      {(type === "raw" || type === "pdf") && (
                        <div className="icon-box">📄</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* POPUP */}
      {popupItem && (
        <div className="popup-overlay" onClick={() => setPopupItem(null)}>
          <div
            className="popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="popup-close"
              onClick={() => setPopupItem(null)}
            >
              ×
            </span>

            <h3>{popupItem.title}</h3>
            <p>{popupItem.description}</p>

            {popupItem.type === "image" && (
              <img src={popupItem.fileUrl} alt={popupItem.title} />
            )}

            {popupItem.type === "video" && (
              <video src={popupItem.fileUrl} controls autoPlay />
            )}

            {(popupItem.type === "raw" ||
              popupItem.type === "pdf") && (
                <iframe
                  src={popupItem.fileUrl}
                  title={popupItem.title}
                  frameBorder="0"
                ></iframe>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualDiary;
