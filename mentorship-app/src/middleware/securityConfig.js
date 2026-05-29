// src/middleware/securityConfig.js
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import express from "express";

// CORS options – allow origin from env or default to same origin
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Rate limiter – 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Apply security middleware to an Express app
export const applySecurity = (app) => {
  // Set secure HTTP headers with CSP relaxed for Lottie animations
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-eval'"],
          connectSrc: ["'self'", "https://assets-v2.lottiefiles.com"],
          imgSrc: ["'self'", "data:", "https://assets-v2.lottiefiles.com"],
        },
      },
    })
  );

  // Enable CORS
  app.use(cors(corsOptions));

  // Parse JSON bodies (should be before rate limiter if you want to limit all routes)
  app.use(express.json());

  // Apply rate limiting to all API routes
  app.use("/api", apiLimiter);
};
