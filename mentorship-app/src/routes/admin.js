import express from "express";
import { checkAuth } from "../middleware/checkAuth.js";
import { users } from "./auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const checkAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
};

const notifications = [];
const helpMessages = [];
const startUpGuides = [];
const communitySettings = { postsEnabled: true, commentsEnabled: true, memberLimit: 100 };

router.get("/users", checkAuth, checkAdmin, (req, res) => {
  const safe = users.map(u => ({
    id: u.id, name: u.name, email: u.email, role: u.role,
    verified: u.verified || false, phone: u.phone || "", city: u.city || "",
    bio: u.bio || "", dobMonth: u.dobMonth || "", dobDay: u.dobDay || "", dobYear: u.dobYear || "",
    interests: u.interests || [], skills: u.skills || [], photo: u.photo || "",
  }));
  res.json(safe);
});

router.post("/verify-user", checkAuth, checkAdmin, (req, res) => {
  const { userId, verified } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ message: "Cannot verify an admin" });
  user.verified = verified;
  res.json({ message: `User ${verified ? "verified" : "unverified"} successfully`, user: { id: user.id, name: user.name, email: user.email, role: user.role, verified: user.verified } });
});

router.get("/notifications", checkAuth, checkAdmin, (req, res) => {
  res.json(notifications);
});

router.post("/notifications", checkAuth, checkAdmin, (req, res) => {
  const { title, message, targetRole } = req.body;
  if (!title || !message) return res.status(400).json({ message: "Title and message required" });
  const notif = { id: Date.now().toString(), title, message, targetRole: targetRole || "all", createdAt: new Date().toISOString() };
  notifications.unshift(notif);
  res.status(201).json(notif);
});

router.delete("/notifications/:id", checkAuth, checkAdmin, (req, res) => {
  const idx = notifications.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Notification not found" });
  notifications.splice(idx, 1);
  res.json({ message: "Deleted" });
});

router.get("/help-messages", checkAuth, checkAdmin, (req, res) => {
  res.json(helpMessages);
});

router.post("/help-messages", checkAuth, checkAdmin, (req, res) => {
  const { type, message, userId, userEmail, userName } = req.body;
  if (!type || !message) return res.status(400).json({ message: "Type and message required" });
  const msg = { id: Date.now().toString(), type, message, userId, userEmail, userName, status: "open", createdAt: new Date().toISOString() };
  helpMessages.unshift(msg);
  res.status(201).json(msg);
});

router.put("/help-messages/:id/status", checkAuth, checkAdmin, (req, res) => {
  const msg = helpMessages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ message: "Message not found" });
  msg.status = req.body.status || "resolved";
  res.json(msg);
});

router.get("/startup-guides", checkAuth, checkAdmin, (req, res) => {
  res.json(startUpGuides);
});

router.post("/startup-guides", checkAuth, checkAdmin, (req, res) => {
  const { title, content, targetRole } = req.body;
  if (!title || !content) return res.status(400).json({ message: "Title and content required" });
  const guide = { id: Date.now().toString(), title, content, targetRole: targetRole || "all", createdAt: new Date().toISOString() };
  startUpGuides.push(guide);
  res.status(201).json(guide);
});

router.delete("/startup-guides/:id", checkAuth, checkAdmin, (req, res) => {
  const idx = startUpGuides.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Guide not found" });
  startUpGuides.splice(idx, 1);
  res.json({ message: "Deleted" });
});

router.get("/community-settings", checkAuth, checkAdmin, (req, res) => {
  res.json(communitySettings);
});

router.put("/community-settings", checkAuth, checkAdmin, (req, res) => {
  const { postsEnabled, commentsEnabled, memberLimit } = req.body;
  if (postsEnabled !== undefined) communitySettings.postsEnabled = postsEnabled;
  if (commentsEnabled !== undefined) communitySettings.commentsEnabled = commentsEnabled;
  if (memberLimit !== undefined) communitySettings.memberLimit = memberLimit;
  res.json(communitySettings);
});

router.get("/analytics", checkAuth, checkAdmin, (req, res) => {
  const total = users.length;
  const admins = users.filter(u => u.role === "admin").length;
  const mentors = users.filter(u => u.role === "mentor").length;
  const mentees = users.filter(u => u.role === "mentee").length;
  const verified = users.filter(u => u.verified).length;
  const pending = users.filter(u => !u.verified && u.role !== "admin").length;
  res.json({ total, admins, mentors, mentees, verified, pending });
});

export default router;
