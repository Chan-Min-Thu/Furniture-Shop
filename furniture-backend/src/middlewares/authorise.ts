import { Result } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { getUserById } from "../services/authService";
import { errorCode } from "../config/errorCode";
import { createError } from "../utils/error";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

/*
  Authorise (true,Admin | Author) || Authorise(false,User)
*/

export const authorise = (permission: boolean, ...roles: string[]) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userId as number;
    const user = await getUserById(userId);
    if (!user) {
      return next(
        createError(
          "This accunt has not registered.",
          401,
          errorCode.unauthenticated
        )
      );
    }
    const result = roles.includes(user.role);
    if (permission && !result) {
      return next(
        createError("This action is not allowed.", 401, errorCode.unauthorised)
      );
    }
    if (!permission && result) {
      return next(
        createError("This action is not allowed.", 401, errorCode.unauthorised)
      );
    }
    req.user = user;
    next();
  };
};
