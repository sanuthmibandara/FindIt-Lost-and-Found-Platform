const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/~`]).{8,}$/;

export const validateEmail = (email) => EMAIL_REGEX.test(email);

export const validatePassword = (password) => PASSWORD_REGEX.test(password);

export const validationMessages = {
  email: "Please enter a valid email address",
  password:
    "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
  name: "Name must be at least 2 characters",
};

export const validateRegisterForm = ({ name, email, password }) => {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = validationMessages.name;
  }

  if (!email || !validateEmail(email)) {
    errors.email = validationMessages.email;
  }

  if (!password || !validatePassword(password)) {
    errors.password = validationMessages.password;
  }

  return errors;
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!email || !validateEmail(email)) {
    errors.email = validationMessages.email;
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
};

export const validateForgotForm = ({ email }) => {
  const errors = {};

  if (!email || !validateEmail(email)) {
    errors.email = validationMessages.email;
  }

  return errors;
};

export const validateResetForm = ({ email, resetToken, newPassword }) => {
  const errors = {};

  if (!email || !validateEmail(email)) {
    errors.email = validationMessages.email;
  }

  if (!resetToken) {
    errors.resetToken = "Reset code is required";
  }

  if (!newPassword || !validatePassword(newPassword)) {
    errors.newPassword = validationMessages.password;
  }

  return errors;
};
