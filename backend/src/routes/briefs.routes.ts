import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createBrief, listBriefs } from "../controllers/briefs.controller.js";

const router = Router();

const createBriefLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many requests. Please try again later." },
  },
});

router.get("/", listBriefs);
router.post("/", createBriefLimiter, createBrief);

export default router;
