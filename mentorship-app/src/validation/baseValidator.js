// src/validation/baseValidator.js
import Joi from "joi";

// Example: sanitize and validate a user registration form
export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[a-z]/, "lowercase")
    .pattern(/[0-9]/, "number")
    .required(),
  role: Joi.string().valid("mentee", "mentor", "admin").default("mentee"),
  phone: Joi.string().trim().max(20).allow("").optional(),
  city: Joi.string().trim().max(100).allow("").optional(),
});

// Helper middleware for Express routes
export const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({ message: "Validation error", details: error.details });
  }
  req.body = value; // sanitized
  next();
};
