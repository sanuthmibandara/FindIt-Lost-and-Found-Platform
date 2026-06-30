import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

/**
 * Upload a single image buffer to Cloudinary and return the secure URL.
 */
export const uploadImageToCloudinary = (file) => {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(
      new Error(
        "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to server/.env"
      )
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "findit-posts",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });
};

/**
 * Upload multiple files and return an array of Cloudinary URLs.
 */
export const uploadImagesToCloudinary = async (files = []) => {
  const urls = [];

  for (const file of files) {
    const url = await uploadImageToCloudinary(file);
    urls.push(url);
  }

  return urls;
};

/**
 * Parse images sent as JSON string (multipart) or array (JSON body).
 */
export const parseImageUrlsFromBody = (images) => {
  if (!images) return [];

  if (Array.isArray(images)) return images.filter(Boolean);

  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return images.trim() ? [images] : [];
    }
  }

  return [];
};
