import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeOwner } from "../middleware/postMiddleware.js";
import {
  uploadPostImages,
  handleUploadError,
} from "../middleware/uploadMiddleware.js";
import {
  validateCreatePost,
  validateUpdatePost,
} from "../middleware/validatePost.js";
import {
  createPost,
  getPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

// Public routes
router.get("/", getPosts);

// Protected — must be before /:id
router.get("/my", protect, getMyPosts);
router.get("/:id", getPostById);

// Protected routes
router.post(
  "/",
  protect,
  (req, res, next) => {
    uploadPostImages(req, res, (err) => {
      if (err) return handleUploadError(err, req, res, next);
      next();
    });
  },
  validateCreatePost,
  createPost
);

router.put(
  "/:id",
  protect,
  authorizeOwner,
  (req, res, next) => {
    uploadPostImages(req, res, (err) => {
      if (err) return handleUploadError(err, req, res, next);
      next();
    });
  },
  validateUpdatePost,
  updatePost
);

router.delete("/:id", protect, authorizeOwner, deletePost);

export default router;
