import Post from "../models/Post.js";
import Claim from "../models/Claim.js";
import {
  uploadImagesToCloudinary,
  parseImageUrlsFromBody,
} from "../utils/cloudinaryUpload.js";
import { buildPostTimeline } from "../controllers/claimController.js";

// POST /api/posts — logged-in users only
export const createPost = async (req, res) => {
  try {
    const uploadedUrls = await uploadImagesToCloudinary(req.files);
    const bodyImageUrls = parseImageUrlsFromBody(req.body.images);
    const images = [...bodyImageUrls, ...uploadedUrls];

    let linkedLostPost = null;

    if (req.body.linkedLostPost) {
      if (req.body.type !== "Found") {
        return res.status(400).json({
          message: "Only Found posts can be linked to a Lost post",
        });
      }

      const lostPost = await Post.findById(req.body.linkedLostPost);

      if (!lostPost) {
        return res.status(400).json({ message: "Linked lost post not found" });
      }

      if (lostPost.type !== "Lost") {
        return res.status(400).json({
          message: "Can only link to a Lost post",
        });
      }

      linkedLostPost = lostPost._id;
    }

    const post = await Post.create({
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      type: req.body.type,
      category: req.body.category,
      location: req.body.location.trim(),
      dateLostOrFound: new Date(req.body.dateLostOrFound),
      reward: req.body.reward?.trim() || "",
      status: req.body.status || "Open",
      images,
      owner: req.user.id,
      linkedLostPost,
    });

    const populatedPost = await post.populate([
      { path: "owner", select: "name email" },
      { path: "linkedLostPost", select: "title type" },
    ]);

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/posts/my — logged-in user's posts only
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ owner: req.user.id })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: posts.length,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/posts — public
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: posts.length,
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/posts/:id — public (optional auth enriches response)
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("owner", "name email")
      .populate("linkedLostPost", "title type status");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const timeline = await buildPostTimeline(post);

    const response = {
      ...post.toObject(),
      timeline,
    };

    if (req.user) {
      const userClaim = await Claim.findOne({
        post: post._id,
        claimer: req.user.id,
      }).sort({ createdAt: -1 });

      response.userClaim = userClaim;
      response.isOwner = post.owner._id.toString() === req.user.id;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/posts/:id — owner only
export const updatePost = async (req, res) => {
  try {
    const post = req.post;

    if (post.status === "Returned") {
      return res.status(400).json({ message: "Cannot edit a returned item" });
    }

    const keptUrls = parseImageUrlsFromBody(req.body.existingImages);
    const uploadedUrls = await uploadImagesToCloudinary(req.files);

    if (req.body.existingImages !== undefined || uploadedUrls.length > 0) {
      post.images = [...keptUrls, ...uploadedUrls];
    } else {
      const bodyImageUrls = parseImageUrlsFromBody(req.body.images);
      if (bodyImageUrls.length > 0 || uploadedUrls.length > 0) {
        post.images = [...bodyImageUrls, ...uploadedUrls];
      }
    }

    post.title = req.body.title.trim();
    post.description = req.body.description.trim();
    post.type = req.body.type;
    post.category = req.body.category;
    post.location = req.body.location.trim();
    post.dateLostOrFound = new Date(req.body.dateLostOrFound);
    post.reward = req.body.reward?.trim() || "";

    if (req.body.status) {
      post.status = req.body.status;
    }

    const updatedPost = await post.save();
    await updatedPost.populate("owner", "name email");

    res.json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/posts/:id — owner only
export const deletePost = async (req, res) => {
  try {
    const post = req.post;

    if (post.status === "Returned") {
      return res.status(400).json({
        message: "Cannot delete a returned item. History is preserved.",
      });
    }

    await Post.findByIdAndDelete(req.params.id);
    await Claim.deleteMany({ post: req.params.id });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
