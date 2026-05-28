import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";

const router = express.Router();

const defaultGradebook = {
  mentees: [
    { name: "Alex Rivera", initials: "AR", color: "#006590", scores: { "Design System Audit": 92, "UX Research": 78, "Brand Strategy": 88 }, avg: 86 },
    { name: "Jamie Chen", initials: "JC", color: "#b50064", scores: { "Brand Identity": 95, "Brand Strategy": 90, "UX Research": 82 }, avg: 89 },
    { name: "Sarah Kim", initials: "SK", color: "#cca800", scores: { "UX Research": 74, "Design System Audit": 68 }, avg: 71 },
    { name: "David Park", initials: "DP", color: "#0298D7", scores: { "Data Strategy": 88, "Design System Audit": 91 }, avg: 89.5 },
    { name: "Olivia Foster", initials: "OF", color: "#8B5CF6", scores: { "Design System Audit": 65, "UX Research": 72 }, avg: 68.5 },
    { name: "James Kim", initials: "JK", color: "#E67E22", scores: { "Design System Audit": 81 }, avg: 81 },
  ],
};

const gradebooks = {};

router.get("/", checkAuth, (req, res) => {
  const key = req.user.email || "default";
  if (!gradebooks[key]) {
    gradebooks[key] = JSON.parse(JSON.stringify(defaultGradebook));
  }
  res.json(gradebooks[key]);
});

router.put("/", checkAuth, (req, res) => {
  const key = req.user.email || "default";
  const { mentees } = req.body;
  if (!Array.isArray(mentees)) {
    return res.status(400).json({ message: "Invalid data" });
  }
  gradebooks[key] = { mentees };
  res.json({ message: "Gradebook saved", mentees });
});

export default router;
