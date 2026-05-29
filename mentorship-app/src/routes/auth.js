import express from "express";
import jwt from "jsonwebtoken";
import { validateBody, registerSchema } from "../validation/baseValidator.js";
import { checkAuth } from "../middleware/checkAuth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const users = [
  { id: "1", name: "Sarah Johnson", email: "sarah@test.com", password: "Test1234!", role: "mentee", verified: true, phone: "", city: "" },
  { id: "2", name: "Marcus Chen", email: "mentor@test.com", password: "Mentor123!", role: "mentor", verified: true, phone: "", city: "" },
  { id: "admin1", name: "Kay", email: "tripelkay@gmail.com", password: "Raven@26", role: "admin", verified: true, phone: "", city: "" },
];

export { users };

router.post("/register", validateBody(registerSchema), (req, res) => {
  const { name, email, password, role, phone, city } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: "User already exists" });
  }
  if (role === "admin") {
    const adminCount = users.filter(u => u.role === "admin").length;
    if (adminCount >= 3) return res.status(403).json({ message: "Maximum 3 administrators allowed" });
  }
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    role: role || "mentee",
    verified: role === "admin" ? true : false,
    phone: phone || "",
    city: city || "",
  };
  users.push(newUser);
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.status(201).json({
    message: role !== "admin" ? "Registration successful. Please wait for admin verification." : "Admin registered successfully",
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      verified: newUser.verified,
      phone: newUser.phone,
      city: newUser.city,
    },
  });
});

router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  const user = users.find((u) => u.email === email);
  if (user) {
    console.log(`[dev] Password reset link sent to ${email}`);
  }
  res.json({ message: "If an account exists, a reset link has been sent." });
});

router.post("/login", (req, res) => {
  const { email, password, role } = req.body;
  const user = users.find(
    u => u.email === email && u.password === password && u.role === (role || u.role)
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if (!user.verified && user.role !== "admin") {
    return res.status(403).json({ message: "Your account is pending admin verification. Please wait for approval." });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      phone: user.phone,
      city: user.city,
    },
  });
});

router.put("/profile", checkAuth, (req, res) => {
  const { name, email, phone, city, bio, dobMonth, dobDay, dobYear, interests, skills, photo } = req.body;
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (city !== undefined) user.city = city;
  if (bio !== undefined) user.bio = bio;
  if (dobMonth !== undefined) user.dobMonth = dobMonth;
  if (dobDay !== undefined) user.dobDay = dobDay;
  if (dobYear !== undefined) user.dobYear = dobYear;
  if (interests !== undefined) user.interests = interests;
  if (skills !== undefined) user.skills = skills;
  if (photo !== undefined) user.photo = photo;
  res.json({
    message: "Profile updated successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      phone: user.phone,
      city: user.city,
      bio: user.bio,
      dobMonth: user.dobMonth,
      dobDay: user.dobDay,
      dobYear: user.dobYear,
      interests: user.interests,
      skills: user.skills,
      photo: user.photo,
    },
  });
});

export default router;
