export const sanitizeInput = (value) => {
  if (typeof value !== "string") return value;
  return value
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/`/g, "&#96;");
};

export const sanitizeObject = (obj) => {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    out[key] = typeof value === "string" ? sanitizeInput(value) : value;
  }
  return out;
};
