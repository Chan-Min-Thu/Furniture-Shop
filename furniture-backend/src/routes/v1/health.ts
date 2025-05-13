import express from "express";
import { check } from "../../middlewares/check";
import { healthCheckController } from "../../controllers/healthCheckController";

const router = express.Router();

router.get("/health", check, healthCheckController);

export default router;
