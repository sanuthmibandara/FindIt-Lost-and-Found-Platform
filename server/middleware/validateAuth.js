import {
  validateEmail,
  validatePassword,
  validationMessages,
} from "../utils/validation.js";

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: validationMessages.name });
  }

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: validationMessages.email });
  }

  if (!password || !validatePassword(password)) {
    return res.status(400).json({ message: validationMessages.password });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: validationMessages.email });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  next();
};

export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: validationMessages.email });
  }

  next();
};

export const validateResetPassword = (req, res, next) => {
  const { email, resetToken, newPassword } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: validationMessages.email });
  }

  if (!resetToken) {
    return res.status(400).json({ message: "Reset code is required" });
  }

  if (!newPassword || !validatePassword(newPassword)) {
    return res.status(400).json({ message: validationMessages.password });
  }

  next();
};
