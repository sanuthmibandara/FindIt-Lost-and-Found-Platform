export const validateCreateClaim = (req, res, next) => {
  const { postId, answers } = req.body;

  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  if (!answers?.describeItem?.trim()) {
    return res.status(400).json({ message: "Please describe the item" });
  }

  if (!answers?.location?.trim()) {
    return res.status(400).json({ message: "Please specify where you lost or found it" });
  }

  next();
};
