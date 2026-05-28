import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";

const router = express.Router();

const posts = [
  { id: "p1", name: "Marcus Chen", role: "Lead Designer", avatarColor: "#b50064", time: "2h ago", text: "Just published a new case study on our design system evolution!", likes: 12, liked: false, comments: ["Love the case study!", "Great insights Marcus"] },
  { id: "p2", name: "Aisha Patel", role: "Data Scientist", avatarColor: "#006590", time: "5h ago", text: "Great workshop today on predictive modeling. Here are my notes.", likes: 8, liked: true, comments: ["Thanks for sharing!"] },
  { id: "p3", name: "Dr. Sarah Jenkins", role: "UX Director", avatarColor: "#ffd200", time: "1d ago", text: "Reminder: Design Thinking session this Friday on advanced prototyping.", likes: 5, liked: false, comments: [] },
];

const members = [
  { name: "Alex Rivera", role: "UI Design Track", online: true },
  { name: "Priya Sharma", role: "Data Track", online: true },
  { name: "James Kim", role: "Engineering Track", online: false },
  { name: "Olivia Foster", role: "Product Track", online: true },
  { name: "Liam O'Brien", role: "Design Track", online: false },
];

const events = [
  { name: "Design Critique Session", day: "14", month: "Oct", meta: "2:00 PM · Virtual · 12 attending" },
  { name: "Guest Speaker: AI in Design", day: "18", month: "Oct", meta: "3:00 PM · Room 401 · 28 attending" },
  { name: "Portfolio Review Workshop", day: "21", month: "Oct", meta: "10:00 AM · Design Lab · 15 spots left" },
];

router.get("/posts", checkAuth, (req, res) => {
  res.json(posts);
});

router.post("/posts", checkAuth, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Post text required" });
  const post = {
    id: Date.now().toString(),
    name: req.user.email || "User",
    role: "Member",
    avatarColor: "#b50064",
    time: "Just now",
    text,
    likes: 0,
    liked: false,
    comments: [],
  };
  posts.unshift(post);
  res.status(201).json(post);
});

router.post("/posts/:id/like", checkAuth, (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  res.json(post);
});

router.get("/members", checkAuth, (req, res) => {
  res.json(members);
});

router.get("/events", checkAuth, (req, res) => {
  res.json(events);
});

export default router;
