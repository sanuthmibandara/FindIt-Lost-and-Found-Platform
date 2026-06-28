const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Min 8 chars, uppercase, lowercase, number, special character
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
