// src/middleware/checkAuth.js
import jwt from "jsonwebtoken";

// Secret should be stored securely (env variable)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or malformed token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Attach user info to request for downstream handlers
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
