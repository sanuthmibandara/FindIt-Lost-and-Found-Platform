import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validateCreateClaim } from "../middleware/validateClaim.js";
import {
  authorizeClaimOwner,
  authorizeClaimer,
} from "../middleware/claimMiddleware.js";
import {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  getClaimForPost,
  approveClaim,
  rejectClaim,
  cancelClaim,
} from "../controllers/claimController.js";

const router = express.Router();

router.post("/", protect, validateCreateClaim, createClaim);
router.get("/my", protect, getMyClaims);
router.get("/received", protect, getReceivedClaims);
router.get("/post/:postId", protect, getClaimForPost);

router.patch("/:id/approve", protect, authorizeClaimOwner, approveClaim);
router.patch("/:id/reject", protect, authorizeClaimOwner, rejectClaim);
router.delete("/:id", protect, authorizeClaimer, cancelClaim);

export default router;
