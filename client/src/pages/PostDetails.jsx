import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getPostById } from "../services/api";
import { getErrorMessage } from "../utils/errorMessages";
import "./PostDetails.css";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23f5f5f5' width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ccc' font-size='20' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await getPostById(id);
        setPost(res.data);
      } catch (err) {
        setNotFound(true);
        toast.error(getErrorMessage(err, "This post could not be found."));
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleClaim = () => {
    if (!isAuthenticated) {
      toast.info("Please log in to submit a claim.");
      navigate("/login");
      return;
    }
    toast.info("Claim requests will be available in the next phase.");
  };

  if (loading) {
    return <div className="details-page"><div className="details-status">Loading...</div></div>;
  }

  if (notFound || !post) {
    return (
      <div className="details-page">
        <div className="details-status">Post not found</div>
        <Link to="/" className="back-link">← Back to Browse</Link>
      </div>
    );
  }

  const images = post.images?.length ? post.images : [PLACEHOLDER];

  return (
    <div className="details-page">
      <div className="details-container">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="details-grid">
          <div className="details-gallery">
            <div className="gallery-main">
              <img src={images[activeImage]} alt={post.title} />
              <span className={`details-badge ${post.type === "Lost" ? "lost" : "found"}`}>
                {post.type}
              </span>
            </div>
            {images.length > 1 && (
              <div className="gallery-thumbs">
                {images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    className={`gallery-thumb ${activeImage === i ? "active" : ""}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="details-info">
            <span className="details-category">{post.category}</span>
            <h1>{post.title}</h1>

            <div className="details-status-badge">
              Status: <strong>{post.status}</strong>
            </div>

            <p className="details-description">{post.description}</p>

            <div className="details-meta-grid">
              <div className="meta-item">
                <span className="meta-label">Location</span>
                <span className="meta-value">📍 {post.location}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Date</span>
                <span className="meta-value">{formatDate(post.dateLostOrFound)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Posted By</span>
                <span className="meta-value">{post.owner?.name || "Unknown"}</span>
              </div>
              {post.reward && (
                <div className="meta-item reward">
                  <span className="meta-label">Reward</span>
                  <span className="meta-value">🎁 {post.reward}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="claim-btn"
              onClick={handleClaim}
              disabled={post.status !== "Open"}
            >
              {post.status !== "Open" ? "Claims Closed" : "Claim This Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetails;
