import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import { users } from "./auth.js";

const router = express.Router();

const assignments = [
  { id: "a1", title: "Design System Audit Report", course: "Advanced UI/UX Systems", due: "Oct 20, 2025", marks: 100, urgent: true, icon: "🎨", color: "#b50064" },
  { id: "a2", title: "User Research Synthesis Report", course: "Design Thinking Fundamentals", due: "Oct 25, 2025", marks: 80, urgent: false, icon: "📝", color: "#006590" },
  { id: "a3", title: "Data Visualization Challenge", course: "Strategic Data Insights", due: "Oct 28, 2025", marks: 90, urgent: false, icon: "📊", color: "#b50064" },
];

router.get("/dashboard", checkAuth, (req, res) => {
  const progressRecords = [
    { title: "Advanced UI/UX Systems", progress: 72, emoji: "🎨", badge: "Design", desc: "Master modern interface design patterns", next: "Week 4: Prototyping" },
    { title: "Design Thinking Fundamentals", progress: 100, emoji: "🧠", badge: "Design", desc: "Human-centered design methodology", next: "Review & Certificate" },
    { title: "Strategic Data Insights", progress: 45, emoji: "📊", badge: "Business", desc: "Data-driven decision making", next: "Week 3: Visualization" },
  ];
  res.json({
    menteeName: users.find(u => u.id === req.user.id)?.name || "Mentee",
    progressRecords,
    dueAssignments: assignments,
  });
});

router.get("/assignments", checkAuth, (req, res) => {
  res.json(assignments);
});

router.post("/assignments/:id/accept", checkAuth, (req, res) => {
  const a = assignments.find(x => x.id === req.params.id);
  if (!a) return res.status(404).json({ message: "Assignment not found" });
  res.json({ message: "Assignment accepted", assignment: a });
});

router.get("/stats", checkAuth, (req, res) => {
  res.json({
    hoursLearned: 24.5,
    skillsEarned: 12,
    avgGrade: 86,
    coursesCompleted: 1,
  });
});

export default router;
