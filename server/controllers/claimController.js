import Claim from "../models/Claim.js";
import Post from "../models/Post.js";

export const buildPostTimeline = async (post) => {
  const claims = await Claim.find({ post: post._id })
    .sort({ createdAt: 1 })
    .select("status createdAt updatedAt");

  const timeline = [
    {
      key: "posted",
      label: "Posted",
      date: post.createdAt,
      completed: true,
    },
  ];

  if (claims.length > 0) {
    const firstClaim = claims[0];
    timeline.push({
      key: "claim_submitted",
      label: "Claim Submitted",
      date: firstClaim.createdAt,
      completed: true,
    });
  }

  const approvedClaim = claims.find((c) => c.status === "Approved");
  if (approvedClaim) {
    timeline.push({
      key: "claim_approved",
      label: "Claim Approved",
      date: approvedClaim.updatedAt,
      completed: true,
    });
  }

  if (post.status === "Returned") {
    timeline.push({
      key: "returned",
      label: "Item Returned",
      date: approvedClaim?.updatedAt || post.updatedAt,
      completed: true,
    });
  } else if (claims.some((c) => c.status === "Pending")) {
    timeline.push({
      key: "claim_review",
      label: "Awaiting Owner Review",
      date: null,
      completed: false,
    });
  }

  return timeline;
};

// POST /api/claims
export const createClaim = async (req, res) => {
  try {
    const { postId, answers } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.owner.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot claim your own post" });
    }

    if (post.status !== "Open") {
      return res.status(400).json({ message: "This item is no longer accepting claims" });
    }

    const existingPending = await Claim.findOne({
      post: postId,
      claimer: req.user.id,
      status: "Pending",
    });

    if (existingPending) {
      return res.status(400).json({ message: "You already have a pending claim on this post" });
    }

    const claim = await Claim.create({
      post: postId,
      claimer: req.user.id,
      owner: post.owner,
      answers: {
        describeItem: answers.describeItem.trim(),
        location: answers.location.trim(),
        identifyingMarks: answers.identifyingMarks?.trim() || "",
        additionalInfo: answers.additionalInfo?.trim() || "",
      },
    });

    const populated = await Claim.findById(claim._id)
      .populate("post", "title type status")
      .populate("claimer", "name email")
      .populate("owner", "name email");

    res.status(201).json({
      message: "Claim submitted successfully",
      claim: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You already have a pending claim on this post" });
    }
    res.status(500).json({ message: error.message });
  }
};

// GET /api/claims/my
export const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimer: req.user.id })
      .populate("post", "title type status category images")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({ count: claims.length, claims });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/claims/received
export const getReceivedClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ owner: req.user.id })
      .populate("post", "title type status category")
      .populate("claimer", "name email")
      .sort({ createdAt: -1 });

    res.json({ count: claims.length, claims });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/claims/post/:postId — current user's claim on a post
export const getClaimForPost = async (req, res) => {
  try {
    const claim = await Claim.findOne({
      post: req.params.postId,
      claimer: req.user.id,
    })
      .sort({ createdAt: -1 })
      .populate("post", "title status");

    res.json({ claim });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/claims/:id/approve
export const approveClaim = async (req, res) => {
  try {
    const claim = req.claim;

    if (claim.status !== "Pending") {
      return res.status(400).json({ message: "Only pending claims can be approved" });
    }

    claim.status = "Approved";
    await claim.save();

    await Post.findByIdAndUpdate(claim.post, { status: "Returned" });

    // Reject other pending claims on the same post
    await Claim.updateMany(
      {
        post: claim.post,
        _id: { $ne: claim._id },
        status: "Pending",
      },
      { status: "Rejected" }
    );

    const updated = await Claim.findById(claim._id)
      .populate("post", "title status")
      .populate("claimer", "name email");

    res.json({
      message: "Claim approved. Item marked as returned.",
      claim: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/claims/:id/reject
export const rejectClaim = async (req, res) => {
  try {
    const claim = req.claim;

    if (claim.status !== "Pending") {
      return res.status(400).json({ message: "Only pending claims can be rejected" });
    }

    claim.status = "Rejected";
    await claim.save();

    const updated = await Claim.findById(claim._id)
      .populate("post", "title status")
      .populate("claimer", "name email");

    res.json({
      message: "Claim rejected",
      claim: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/claims/:id — cancel own pending claim
export const cancelClaim = async (req, res) => {
  try {
    const claim = req.claim;

    if (claim.status !== "Pending") {
      return res.status(400).json({ message: "Only pending claims can be cancelled" });
    }

    claim.status = "Cancelled";
    await claim.save();

    res.json({ message: "Claim cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
