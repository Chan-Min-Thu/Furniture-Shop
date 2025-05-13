import { errorCode } from "../config/errorCode";
export const checkUserExit = (user: any) => {
  if (user) {
    const error: any = new Error(
      "This phone number has alteady been registered."
    );
    error.status = 409;
    error.code = errorCode.userExit;
    throw error;
  }
};

export const checkUserIfNotExit = (user: any) => {
  if (!user) {
    const error: any = new Error("This phone number has not registered.");
    error.status = 401;
    error.code = errorCode.userExit;
    throw error;
  }
};

export const checkOtpErrorIfSameDate = (
  isSameDay: boolean,
  errorCount: number
) => {
  if (isSameDay && errorCount === 5) {
    const error: any = new Error("OTP is wrong.Please try again tomorrow.");
    error.status = 401;
    error.code = errorCode.overLimit;
    throw error;
  }
};
