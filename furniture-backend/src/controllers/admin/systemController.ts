import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { createError } from "../../utils/error";
import { createOrUpdateSettingStatus } from "../../services/settingService";

interface CustomRequest extends Request {
  user?: any;
}
export const setMaintenanceMode = [
  body("mode", "Mode must be boolean").isBoolean(),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, "validation_error"));
    }
    const { mode } = req.body;
    const value = mode ? "true" : "false";
    const message = mode
      ? "Set successfully maintenance mode"
      : "Successfully turn off maintenance mode";

    await createOrUpdateSettingStatus("maintenance", value);
    res.status(200).json({
      message,
    });
  },
];
