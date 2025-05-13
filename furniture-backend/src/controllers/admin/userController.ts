import { User } from "@prisma/client";
import express, { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
  user?: User;
}

const router = express.Router();

export const getAllUsers = (req: CustomRequest, res: Response) => {
  const user = req.user;
  res.status(200).json({
    data: "users",
    message: req.t("welcome"),
    userRole: user?.role,
  });
};

export default router;
