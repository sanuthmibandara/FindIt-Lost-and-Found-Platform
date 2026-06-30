import Post from "../models/Post.js";

export const authorizeOwner = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to modify this post" });
    }

    req.post = post;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
