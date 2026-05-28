import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";

const router = express.Router();

const defaultCourses = [
  { id: "c1", title: "Advanced UI/UX Systems", instructor: "Marcus Chen", role: "Lead Designer", badge: "Design", duration: "8 weeks", level: "Intermediate", enrolled: [], enrolledCount: 12 },
  { id: "c2", title: "Strategic Data Insights", instructor: "Aisha Patel", role: "Data Scientist", badge: "Business", duration: "6 weeks", level: "Intermediate", enrolled: [], enrolledCount: 8 },
  { id: "c3", title: "Design Thinking Fundamentals", instructor: "Dr. Sarah Jenkins", role: "UX Director", badge: "Design", duration: "5 weeks", level: "Beginner", enrolled: [], enrolledCount: 15 },
  { id: "c4", title: "Full-Stack Web Development", instructor: "James Wilson", role: "Software Architect", badge: "Engineering", duration: "10 weeks", level: "Advanced", enrolled: [], enrolledCount: 22 },
  { id: "c5", title: "Product Management 101", instructor: "Maria Gonzalez", role: "PM Lead", badge: "Business", duration: "7 weeks", level: "Beginner", enrolled: [], enrolledCount: 5 },
  { id: "c6", title: "Creative Brand Strategy", instructor: "Tom Nakamura", role: "Brand Director", badge: "Design", duration: "6 weeks", level: "Intermediate", enrolled: [], enrolledCount: 3 },
];

let courses = [...defaultCourses];

const checkAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
};

router.get("/", checkAuth, checkAdmin, (req, res) => {
  const result = courses.map(c => ({
    ...c,
    enrolledMentees: c.enrolled.map(e => ({ userId: e.userId, name: e.name, email: e.email })),
    enrolledCount: c.enrolled.length || c.enrolledCount,
  }));
  res.json(result);
});

router.post("/", checkAuth, (req, res) => {
  const { title, instructor, instructorRole, badge, duration, level } = req.body;
  if (!title) return res.status(400).json({ message: "Title required" });
  const course = {
    id: Date.now().toString(),
    title,
    instructor: instructor || "Unknown",
    role: instructorRole || "Mentor",
    badge: badge || "General",
    duration: duration || "",
    level: level || "Beginner",
    enrolled: [],
    enrolledCount: 0,
  };
  courses.push(course);
  res.status(201).json(course);
});

router.post("/enroll", checkAuth, (req, res) => {
  const { courseId, userName } = req.body;
  if (!courseId) return res.status(400).json({ message: "Course ID required" });
  const course = courses.find(c => c.id === courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });
  const already = course.enrolled.find(e => e.userId === req.user.id);
  if (already) return res.json({ message: "Already enrolled", course });
  course.enrolled.push({ userId: req.user.id, name: userName || req.user.email, email: req.user.email });
  res.json({ message: "Enrolled successfully", course });
});

router.get("/my-enrollments", checkAuth, (req, res) => {
  const enrolled = courses
    .filter(c => c.enrolled.some(e => e.userId === req.user.id))
    .map(c => ({ id: c.id, title: c.title, instructor: c.instructor }));
  res.json(enrolled);
});

export default router;
