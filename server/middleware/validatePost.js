import {
  POST_CATEGORIES,
  POST_TYPES,
  POST_STATUSES,
} from "../utils/categories.js";

const validateRequiredFields = (body) => {
  const errors = [];

  if (!body.title?.trim()) errors.push("Title is required");
  if (!body.description?.trim()) errors.push("Description is required");
  if (!body.type?.trim()) errors.push("Type is required");
  if (!body.category?.trim()) errors.push("Category is required");
  if (!body.location?.trim()) errors.push("Location is required");
  if (!body.dateLostOrFound) errors.push("Date lost or found is required");

  if (body.type && !POST_TYPES.includes(body.type)) {
    errors.push("Type must be Lost or Found");
  }

  if (body.category && !POST_CATEGORIES.includes(body.category)) {
    errors.push("Invalid category");
  }

  if (body.status && !POST_STATUSES.includes(body.status)) {
    errors.push("Invalid status");
  }

  if (body.dateLostOrFound && Number.isNaN(Date.parse(body.dateLostOrFound))) {
    errors.push("Invalid date lost or found");
  }

  return errors;
};

export const validateCreatePost = (req, res, next) => {
  const errors = validateRequiredFields(req.body);

  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

export const validateUpdatePost = (req, res, next) => {
  const errors = validateRequiredFields(req.body);

  if (errors.length) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};
