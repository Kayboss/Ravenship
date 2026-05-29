// src/server.js
import dotenv from "dotenv";
import express from "express";
import { fileURLToPath } from "url";
import { applySecurity } from "./middleware/securityConfig.js";
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import coursesRouter from "./routes/courses.js";
import protectedRouter from "./routes/protected.js";
import menteeRouter from "./routes/mentee.js";
import mentorRouter from "./routes/mentor.js";
import communityRouter from "./routes/community.js";
import gradebookRouter from "./routes/gradebook.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

applySecurity(app);

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/protected", protectedRouter);
app.use("/api/mentee", menteeRouter);
app.use("/api/mentor", mentorRouter);
app.use("/api/community", communityRouter);
app.use("/api/gradebook", gradebookRouter);

app.use("*", (req, res) => {
  res.status(404).json({ message: "Not found" });
});

const isEntryPoint =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isEntryPoint) {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
}

export default app;
