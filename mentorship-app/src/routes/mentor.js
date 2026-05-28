import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import { users } from "./auth.js";

const router = express.Router();

const mentees = [
  { name: "Alex Rivera", email: "alex.riv@example.com", path: "Advanced UI Design", progress: 72, online: true, lastActive: "Today, 10:45 AM", initials: "AR", avatarColor: "#006590" },
  { name: "Jamie Chen", email: "j.chen@corp.com", path: "Brand Leadership", progress: 100, online: false, lastActive: "2 days ago", initials: "JC", avatarColor: "#b50064" },
  { name: "Sarah Kim", email: "s.kim@design.io", path: "UX Research", progress: 55, online: true, lastActive: "Today, 9:30 AM", initials: "SK", avatarColor: "#cca800" },
  { name: "David Park", email: "d.park@tech.dev", path: "Data Strategy", progress: 88, online: false, lastActive: "Yesterday", initials: "DP", avatarColor: "#0298D7" },
];

const gradingQueue = [
  { initials: "JD", name: "UX Case Study", by: "John Doe", time: "2h ago" },
  { initials: "AS", name: "Brand Strategy", by: "Alice Smith", time: "5h ago" },
  { initials: "ML", name: "Python Final", by: "Mark Lee", time: "1d ago" },
  { initials: "KR", name: "Research Paper", by: "Kate Ross", time: "1d ago" },
];

router.get("/dashboard", checkAuth, (req, res) => {
  const mentor = users.find(u => u.id === req.user.id);
  res.json({
    mentorName: mentor?.name || "Mentor",
    totalMentees: mentees.length,
    gradingQueue,
    mentees,
  });
});

router.get("/mentees", checkAuth, (req, res) => {
  res.json(mentees);
});

router.post("/report", checkAuth, (req, res) => {
  res.json({ message: "Report exported", url: "/exports/mentor-report.pdf" });
});

router.post("/schedule-call", checkAuth, (req, res) => {
  const { menteeName, date } = req.body;
  res.json({ message: `Call scheduled with ${menteeName || "mentee"} on ${date || "TBD"}` });
});

export default router;
