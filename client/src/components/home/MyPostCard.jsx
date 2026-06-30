import { Link } from "react-router-dom";
import "./MyPostCard.css";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f5f5f5' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ccc' font-size='18' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MyPostCard({ post, onDelete }) {
  const image = post.images?.[0] || PLACEHOLDER;

  return (
    <article className="my-post-card">
      <div className="my-post-image">
        <img src={image} alt={post.title} />
        <span className={`my-post-badge ${post.type === "Lost" ? "lost" : "found"}`}>
          {post.type}
        </span>
        <span className="my-post-status">{post.status}</span>
      </div>

      <div className="my-post-body">
        <span className="my-post-category">{post.category}</span>
        <h3>{post.title}</h3>
        <p className="my-post-location">📍 {post.location}</p>
        <p className="my-post-date">{formatDate(post.dateLostOrFound)}</p>

        <div className="my-post-actions">
          <Link to={`/edit-post/${post._id}`} className="btn-edit">
            Edit
          </Link>
          <button type="button" className="btn-delete" onClick={() => onDelete(post)}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default MyPostCard;
