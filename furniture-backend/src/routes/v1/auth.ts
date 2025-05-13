import express from "express";
import {
  register,
  verifyOtp,
  confirmPassword,
  login,
  logout,
  forgotPassword,
  verifyOtpForgotPassword,
  resetPassword,
  authCheck,
} from "./../../controllers/authController";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/verifyOtp", verifyOtp);
router.post("/confirmPassword", confirmPassword);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyOtpForgotPassword", verifyOtpForgotPassword);
router.post("/resetPassword", resetPassword);

router.get("/auth-check", authMiddleware, authCheck);
/* ----------In Mobile (in case of refreshtoken)----------- */
//router.post("/refreshToken",refreshToken)

export default router;
