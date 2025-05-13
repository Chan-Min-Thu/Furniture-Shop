import { Request, Response, NextFunction } from "express";
import { getSettingStatus } from "../services/settingService";
import { createError } from "../utils/error";
import { error } from "console";
import { errorCode } from "../config/errorCode";

const whiteList = ["127.0.0.1"];
export const maintenance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip: any = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (whiteList.includes(ip)) {
    next();
  } else {
    const setting = await getSettingStatus("maintenance");
    if (setting?.value === "true") {
      return next(
        createError(
          "The server is under maintenance.",
          503,
          errorCode.maintenance
        )
      );
    }
  }
  next();
};
