import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./PostCard.css";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f5f5f5' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ccc' font-size='18' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PostCard({ post }) {
  const [imgIndex, setImgIndex] = useState(0);
  const intervalRef = useRef(null);

  const images = post.images?.length ? post.images : [PLACEHOLDER];

  const startCycle = () => {
    if (images.length <= 1 || images[0] === PLACEHOLDER) return;
    intervalRef.current = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % images.length);
    }, 900);
  };

  const stopCycle = () => {
    clearInterval(intervalRef.current);
    setImgIndex(0);
  };

  return (
    <article className="post-card">
      <div
        className="post-card-image"
        onMouseEnter={startCycle}
        onMouseLeave={stopCycle}
      >
        <img src={images[imgIndex]} alt={post.title} loading="lazy" />
        <span className={`post-badge ${post.type === "Lost" ? "lost" : "found"}`}>
          {post.type}
        </span>
        {images.length > 1 && (
          <span className="image-count">{imgIndex + 1}/{images.length}</span>
        )}
      </div>

      <div className="post-card-body">
        <span className="post-category">{post.category}</span>
        <h3 className="post-title">{post.title}</h3>

        <div className="post-meta">
          <span className="post-location">📍 {post.location}</span>
          <span className="post-date">{formatDate(post.dateLostOrFound)}</span>
        </div>

        <Link to={`/posts/${post._id}`} className="post-view-btn">
          View Details
        </Link>
      </div>
    </article>
  );
}

export default PostCard;
