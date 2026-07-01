const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

export function validateImageFile(file) {
  if (!file.type.startsWith("image/") || !ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: `"${file.name}" is not a supported image. Use JPG, PNG, or WebP.`,
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      message: `"${file.name}" is too large. Maximum size is 5MB per image.`,
    };
  }

  return { valid: true };
}

export function validateImageFiles(files) {
  for (const file of files) {
    const result = validateImageFile(file);
    if (!result.valid) return result;
  }
  return { valid: true };
}
