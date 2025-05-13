import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
  userId?: number;
}

export const healthCheckController = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({
    message: "Hello , we are ready for sending response.",
    userId: req.userId,
  });
};
