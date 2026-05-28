// src/routes/protected.js
import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";

const router = express.Router();

router.get("/dashboard", checkAuth, (req, res) => {
  res.json({
    message: "Welcome to the protected dashboard",
    user: req.user,
  });
});

export default router;
