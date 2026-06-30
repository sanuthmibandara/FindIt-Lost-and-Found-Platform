import multer from "multer";

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Allow up to 5 images per request, 5MB each
export const uploadPostImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
}).array("images", 5);

export const handleUploadError = (err, req, res, next) => {
  if (!err) return next();

  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ message: "Each image must be smaller than 5MB" });
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({ message: "Maximum 5 images allowed" });
  }

  return res.status(400).json({ message: err.message || "Upload failed" });
};
