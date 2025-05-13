import { errorCode } from "../config/errorCode";

export const checkOtpRow = (otp: any) => {
  if (!otp) {
    const error: any = new Error("Phone is not found.");
    error.status = 400;
    error.code = errorCode.unauthenticated;
    throw error;
  }
};

export const checkFileExit = (file: any) => {
  if (!file) {
    const error: any = new Error("File is not found.");
    error.status = 409;
    error.code = errorCode.unauthenticated;
    throw error;
  }
};

export const checkModelIfNotExit = (model: any) => {
  if (!model) {
    const error: any = new Error("This model does not exit.");
    error.status = 401;
    error.code = errorCode.invalid;
    throw error;
  }
};
