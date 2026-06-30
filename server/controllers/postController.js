import Post from "../models/Post.js";
import {
  uploadImagesToCloudinary,
  parseImageUrlsFromBody,
} from "../utils/cloudinaryUpload.js";

// POST /api/posts — logged-in users only
export const createPost = async (req, res) => {
  try {
    const uploadedUrls = await uploadImagesToCloudinary(req.files);
    const bodyImageUrls = parseImageUrlsFromBody(req.body.images);
    const images = [...bodyImageUrls, ...uploadedUrls];

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
    });

    const populatedPost = await post.populate("owner", "name email");

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

// GET /api/posts/:id — public
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "owner",
      "name email"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/posts/:id — owner only
export const updatePost = async (req, res) => {
  try {
    const post = req.post;

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
    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
