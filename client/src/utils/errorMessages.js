/**
 * Turn API / network errors into user-friendly messages.
 */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;

  // Network error — no response from server
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please check your connection and try again.";
    }
    return "Unable to reach the server. Make sure the backend is running and you are online.";
  }

  const { status, data } = error.response;
  const message = data?.message || data?.errors?.[0];

  if (status === 400) {
    return message || "Please check your input and try again.";
  }
  if (status === 401) {
    return message || "Please log in to continue.";
  }
  if (status === 403) {
    return message || "You do not have permission to perform this action.";
  }
  if (status === 404) {
    return message || "The requested item could not be found.";
  }
  if (status === 413) {
    return "One or more images are too large. Maximum size is 5MB per image.";
  }
  if (status >= 500) {
    const lower = (message || "").toLowerCase();
    if (
      lower.includes("cloudinary") ||
      lower.includes("api key") ||
      lower.includes("upload")
    ) {
      return "Image upload failed. Try smaller images or post without photos.";
    }
    return "Server error. Please try again in a moment.";
  }

  return message || fallback;
}
