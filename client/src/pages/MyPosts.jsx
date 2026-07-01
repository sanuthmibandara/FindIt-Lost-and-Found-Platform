import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { deletePost, getMyPosts } from "../services/api";
import { getErrorMessage } from "../utils/errorMessages";
import MyPostCard from "../components/home/MyPostCard";
import "./MyPosts.css";

function MyPosts() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await getMyPosts();
      setPosts(res.data.posts || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not load your posts."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchPosts();
  }, [isAuthenticated, navigate]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePost(deleteTarget._id);
      setPosts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
      toast.success("Post deleted successfully.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete post. Please try again."));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="my-posts-page">
      <div className="my-posts-container">
        <div className="my-posts-header">
          <div>
            <h1>My Posts</h1>
            <p>Manage your lost and found listings</p>
          </div>
          <Link to="/create-post" className="btn-new-post">
            + New Post
          </Link>
        </div>

        {loading && <div className="my-posts-status">Loading your posts...</div>}

        {!loading && posts.length === 0 && (
          <div className="my-posts-empty">
            <span>📭</span>
            <h3>No posts yet</h3>
            <p>Create your first lost or found post</p>
            <Link to="/create-post" className="btn-new-post">
              Create Post
            </Link>
          </div>
        )}

        <div className="my-posts-grid">
          {posts.map((post) => (
            <MyPostCard
              key={post._id}
              post={post}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      </div>

      {deleteTarget && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Delete Post</h3>
            <p>
              Are you sure you want to delete <strong>&quot;{deleteTarget.title}&quot;</strong>?
              This action cannot be undone.
            </p>
            <div className="delete-modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPosts;
