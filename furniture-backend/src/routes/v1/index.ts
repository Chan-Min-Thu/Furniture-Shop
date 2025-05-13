import express from "express";
import healthCheckRouter from "./health";
import adminRouter from "./admin";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { authorise } from "../../middlewares/authorise";
import { maintenance } from "../../middlewares/maintenance";
import authRouter from "./auth";
import viewRouter from "./web/view";
import userRouter from "./api";

const router = express.Router();
// API
// router.use(viewRouter);
// router.use("/api/v1", healthCheckRouter);
router.use("/api/v1", authRouter);
router.use(
  "/api/v1/admin",
  // maintenance,
  authMiddleware,
  authorise(true, "ADMIN"),
  adminRouter
);
// router.use("/api/v1/user", maintenance, userRouter);
router.use("/api/v1/user", userRouter);

export default router;
