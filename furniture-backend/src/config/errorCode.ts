import { machine } from "os";
import { maintenance } from "../middlewares/maintenance";

export const errorCode = {
  invalid: "Error_Invalid",
  unauthenticated: "Error_unauthenticated",
  attack: "Error_Attack",
  accessTokenExpired: "Error_AccessTokenExpired",
  userExit: "Error_UserAlreadyExit",
  overLimit: "Error_OverLimit",
  otpExpired: "Error_OtpExpired",
  requestExpired: "Error_RequestExpired",
  accountFreeze: "Error_AccountFreeze",
  unauthorised: "Error_Unauthorised",
  maintenance: "Error_Maintenance",
};
