import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { cancelClaim, getMyClaims } from "../services/api";
import { getErrorMessage } from "../utils/errorMessages";
import { claimStatusClass } from "../utils/claims";
import "./Claims.css";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MyClaims() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await getMyClaims();
      setClaims(res.data.claims || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not load your claims."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const handleCancel = async (claimId) => {
    setCancellingId(claimId);
    try {
      await cancelClaim(claimId);
      toast.success("Claim cancelled.");
      setClaims((prev) =>
        prev.map((c) =>
          c._id === claimId ? { ...c, status: "Cancelled" } : c
        )
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to cancel claim."));
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="claims-page">
      <div className="claims-container">
        <div className="claims-header">
          <h1>My Claims</h1>
          <p>Track claims you have submitted on lost and found items</p>
        </div>

        {loading && <div className="claims-status">Loading claims...</div>}

        {!loading && claims.length === 0 && (
          <div className="claims-empty">
            <h3>No claims yet</h3>
            <p>Browse items and submit a claim when you find a match</p>
            <Link to="/" className="claims-browse-link">
              Browse Items
            </Link>
          </div>
        )}

        <div className="claims-list">
          {claims.map((claim) => (
            <article key={claim._id} className="claim-card">
              <div className="claim-card-header">
                <div>
                  <h3 className="claim-card-title">
                    <Link to={`/posts/${claim.post?._id}`}>
                      {claim.post?.title || "Unknown post"}
                    </Link>
                  </h3>
                  <p className="claim-card-meta">
                    Submitted {formatDate(claim.createdAt)}
                    {claim.post?.type && ` · ${claim.post.type} item`}
                  </p>
                </div>
                <span className={`claim-status ${claimStatusClass(claim.status)}`}>
                  {claim.status}
                </span>
              </div>

              {claim.status === "Pending" && (
                <div className="claim-actions">
                  <button
                    type="button"
                    className="btn-cancel-claim"
                    onClick={() => handleCancel(claim._id)}
                    disabled={cancellingId === claim._id}
                  >
                    {cancellingId === claim._id ? "Cancelling..." : "Cancel Claim"}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyClaims;
