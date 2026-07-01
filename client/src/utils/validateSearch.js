export function validateSearchQuery(query) {
  const trimmed = query.trim();

  if (!trimmed) {
    return { valid: true, query: "" };
  }

  if (trimmed.length < 2) {
    return {
      valid: false,
      message: "Enter at least 2 characters to search.",
    };
  }

  if (!/[a-zA-Z0-9]/.test(trimmed)) {
    return {
      valid: false,
      message: "Search must include letters or numbers.",
    };
  }

  if (trimmed.length > 100) {
    return {
      valid: false,
      message: "Search is too long. Use 100 characters or fewer.",
    };
  }

  return { valid: true, query: trimmed };
}
