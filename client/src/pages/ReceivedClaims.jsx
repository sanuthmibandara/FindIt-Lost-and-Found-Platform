import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  approveClaim,
  getReceivedClaims,
  rejectClaim,
} from "../services/api";
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

function ReceivedClaims() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await getReceivedClaims();
      setClaims(res.data.claims || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not load received claims."));
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

  const handleApprove = async (claimId) => {
    setActionId(claimId);
    try {
      await approveClaim(claimId);
      toast.success("Claim approved. Item marked as returned.");
      fetchClaims();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to approve claim."));
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (claimId) => {
    setActionId(claimId);
    try {
      await rejectClaim(claimId);
      toast.success("Claim rejected.");
      fetchClaims();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reject claim."));
    } finally {
      setActionId(null);
    }
  };

  if (!isAuthenticated) return null;

  const pendingClaims = claims.filter((c) => c.status === "Pending");

  return (
    <div className="claims-page">
      <div className="claims-container">
        <div className="claims-header">
          <h1>Received Claims</h1>
          <p>
            Review verification answers from users claiming your items
            {pendingClaims.length > 0 && ` (${pendingClaims.length} pending)`}
          </p>
        </div>

        {loading && <div className="claims-status">Loading claims...</div>}

        {!loading && claims.length === 0 && (
          <div className="claims-empty">
            <h3>No claims received</h3>
            <p>When someone claims your post, their verification answers will appear here</p>
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
                    From <strong>{claim.claimer?.name}</strong> on{" "}
                    {formatDate(claim.createdAt)}
                  </p>
                </div>
                <span className={`claim-status ${claimStatusClass(claim.status)}`}>
                  {claim.status}
                </span>
              </div>

              <div className="claim-answers">
                <div className="claim-answer">
                  <span className="claim-answer-label">Item description</span>
                  <p>{claim.answers.describeItem}</p>
                </div>
                <div className="claim-answer">
                  <span className="claim-answer-label">Location details</span>
                  <p>{claim.answers.location}</p>
                </div>
                {claim.answers.identifyingMarks && (
                  <div className="claim-answer">
                    <span className="claim-answer-label">Identifying marks</span>
                    <p>{claim.answers.identifyingMarks}</p>
                  </div>
                )}
                {claim.answers.additionalInfo && (
                  <div className="claim-answer">
                    <span className="claim-answer-label">Additional proof</span>
                    <p>{claim.answers.additionalInfo}</p>
                  </div>
                )}
              </div>

              {claim.status === "Pending" && (
                <div className="claim-actions">
                  <button
                    type="button"
                    className="btn-approve"
                    onClick={() => handleApprove(claim._id)}
                    disabled={actionId === claim._id}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn-reject"
                    onClick={() => handleReject(claim._id)}
                    disabled={actionId === claim._id}
                  >
                    Reject
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

export default ReceivedClaims;
