import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment";
import { Request, Response, NextFunction } from "express";
import { body, Result, validationResult } from "express-validator";
import { errorCode } from "../config/errorCode";
import {
  createOtp,
  createUser,
  getOtpByPhone,
  getUserById,
  getUserByPhone,
  updateOtp,
  updateUser,
} from "../services/authService";
import {
  checkOtpErrorIfSameDate,
  checkUserIfNotExit,
  checkUserExit,
} from "../utils/auth";
import { checkOtpRow } from "../utils/check";
import { generateToken } from "../utils/generate";
import { createError } from "../utils/error";

interface CustomRequest extends Request {
  userId?: number;
}

// for registratin progress ,

/*
-first of all , we need to validate the phone number with express validator.
-we will check the user row.=> the phone number is registered or not -> if registered ,error occurs.
-if not registered, we will need to send the otp.
-Before sending the otp, need to check the otp table that the opt row exit or not with this phone number
-If not exit, we will create the otp hashing code and remember-token in OTP table.
-if exit, we will control the otp plan by using updateAt and count, in this case we will limit count as mostly 3.

*/
export const register = [
  //Adding middleware Validation phone number with express validator.
  body("phone", "Invalid phone number.")
    .trim() // Don't let write with white-space
    .notEmpty() // Don't let be empty.
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 })
    .withMessage("Phone number should be between 5 and 10."),
  async (req: Request, res: Response, next: NextFunction) => {
    // validate with above middleware
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    let phone = req.body.phone;
    //slice  09
    if (phone.slice(0, 2) === "09") {
      phone = phone.substring(2, phone.length);
    }
    //getUser by using phone number
    const user = await getUserByPhone(phone);
    checkUserExit(user);
    //OTP Sending
    const otp = 123456; //For testing
    // const otp = generateOtp();  For useage in production
    const salt = await bcrypt.genSalt(10);
    const hashOtp = await bcrypt.hash(String(otp), salt);
    const token = generateToken();

    //Check OtpRow with phone number
    const otpRow = await getOtpByPhone(phone);
    let resultData;

    if (!otpRow) {
      // Check OtpRow with unique phone;
      const otpData: any = {
        phone,
        otp: hashOtp,
        rememberToken: token,
        count: 1,
      };

      // Cuz didn't find the phone  ,OtpRow created.
      resultData = await createOtp(otpData);
    } else {
      const lastOtpRequest = new Date(otpRow.updatedAt).toLocaleDateString();
      const today = new Date(Date.now()).toLocaleDateString();
      const isSameDate = today === lastOtpRequest;
      checkOtpErrorIfSameDate(isSameDate, otpRow.error);

      if (!isSameDate) {
        // if not the same day,we will find otpRow with phone and update otpData
        const otpData: any = {
          phone,
          otp: hashOtp,
          rememberToken: token,
          count: 1,
        };
        resultData = await updateOtp(otpRow.id, otpData);
      } else {
        //otp count is 3 times.
        if (otpRow.count === 3) {
          return next(
            createError(
              "OTP is allowed to request 3 times pre day.",
              405,
              errorCode.invalid
            )
          );
        } else {
          // updateOtp if count is less than 3.
          const otpData = {
            otp: hashOtp,
            rememberToken: token,
            count: {
              //   otpRow.count +1
              increment: 1,
            },
          };
          resultData = await updateOtp(otpRow.id, otpData);
        }
      }
    }
    //Response
    res.status(200).json({
      message: `We've already sent to otp to 09${resultData.phone}`,
      phone: `09${resultData.phone}`,
      otp: resultData.otp,
      token: resultData.rememberToken,
    });
  },
];

/* verify OTP ********************************* */

export const verifyOtp = [
  // for body checking middleware with express validator
  body("phone", "Invalid phone number.")
    .trim()
    .matches("^[0-9]+$")
    .notEmpty()
    .isLength({ min: 5, max: 12 }),
  body("otp", "Invalid OTP Number.")
    .trim()
    .matches("^[0-9]+$")
    .notEmpty()
    .isLength({ min: 6, max: 6 }),

  body("token", "Invalid Token.").notEmpty().escape().trim(),
  // callback function
  async (req: Request, res: Response, next: NextFunction) => {
    //first of all checking request
    const errors = validationResult(req).array({ onlyFirstError: true });

    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    const { phone, otp, token } = req.body;
    // checking user exit or not
    const slicedPhone = phone.slice(0, 2) === "09" ? phone.substring(2) : phone;
    const user = await getUserByPhone(slicedPhone);
    checkUserExit(user);
    // checking otp row exit or not
    const otpRow = await getOtpByPhone(slicedPhone);
    checkOtpRow(otpRow);

    const lastOtpVerify = new Date(otpRow!.updatedAt).toLocaleDateString();
    const today = new Date(Date.now()).toLocaleDateString();
    const isSameDate = today === lastOtpVerify;
    checkOtpErrorIfSameDate(isSameDate, otpRow!.error);
    // If otp verify is in the same date and over limit

    if (otpRow?.rememberToken !== token) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);
      return next(createError("Invalid token.", 400, errorCode.invalid));
    }
    //OTP is expired.
    const isExpired = moment().diff(otpRow!.updatedAt, "minutes") > 2;
    if (isExpired) {
      const error: any = "OTP is expired";
      error.status = 403;
      error.code = errorCode.otpExpired;
      throw error;
    }

    const isMatchOption = await bcrypt.compare(otp, otpRow!.otp);
    // If OTP is wrong,
    if (!isMatchOption) {
      if (!isSameDate) {
        // if Otp is wrong and not the same date ,otp is reset as default 1;
        const otpData = {
          error: 1,
        };
        await updateOtp(otpRow!.id, otpData);
      } else {
        //if Otp is wrong but the same date ,otp is incresed 1;
        const otpData = {
          error: {
            increment: 1,
          },
        };
        await updateOtp(otpRow!.id, otpData);
      }
      // if OTP doesn't match,
      return next(createError("Invalid Otp", 401, errorCode.invalid));
    }
    // Preparing Data to send server as optData;D
    const verifyToken = generateToken();
    const otpData = {
      verifyToken,
      error: 0,
      count: 1,
    };

    // Everything is Ok.
    const result = await updateOtp(otpRow!.id, otpData);
    res.status(200).json({
      message: "OTP is sucessfully verified.",
      phone: `09${result.phone}`,
      token: result.verifyToken,
    });
  },
];

export const confirmPassword = [
  // for body checking middleware with express validator
  body("phone", "Invalid phone number.")
    .trim()
    .matches("^[0-9]+$")
    .notEmpty()
    .isLength({ min: 5, max: 12 }),
  body("password", "Password must be 8 digits.")
    .trim()
    .matches("^[0-9]+$")
    .notEmpty()
    .isLength({ min: 8, max: 8 }),

  body("token", "Invalid Token.").notEmpty().escape().trim(),
  // callback function
  async (req: Request, res: Response, next: NextFunction) => {
    //first of all checking request
    console.log(req.body.password);
    const errors = validationResult(req).array({ onlyFirstError: true });

    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { phone, password, token } = req.body;

    //this step should be user does not exit in the user Table
    const slicedPhone = phone.slice(0, 2) === "09" ? phone.substring(2) : phone;
    const user = await getUserByPhone(slicedPhone);
    //If not, there were will occur error.
    checkUserExit(user);

    //Inside the Otp table, this row must be
    const otpRow = await getOtpByPhone(slicedPhone);
    checkOtpRow(otpRow);
    // Otp error count is overLimit
    if (otpRow?.error === 5) {
      // if not , that is an attack.
      return next(
        createError("This request may be an attack.", 400, errorCode.invalid)
      );
    }

    //To verify the OTP,
    if (otpRow?.verifyToken !== token) {
      const otpData = {
        error: 5,
      };

      await updateOtp(otpRow!.id, otpData);
      const error: any = new Error("Invalid Token.");
      error.status = 401;
      error.code = errorCode.invalid;
      return next(createError("Invalid Token", 401, errorCode.invalid));
    }
    //request is expired.
    const isExpired = moment().diff(otpRow?.updatedAt, "minutes") > 5;
    if (isExpired) {
      const error: any = new Error();
      error.status = 403;
      error.code = errorCode.requestExpired;
      return next(
        createError(
          "Your request is expired.Please try again later.",
          403,
          errorCode.requestExpired
        )
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const randomToken = "I will replace refresh token soon.";

    const userData = {
      phone: phone.slice(2, phone.length),
      password: hashPassword,
      randomToken,
    };
    const newUser = await createUser(userData);

    const accessTokenPayload = { id: newUser.id };
    const refreshTokenPayload = { id: newUser.id, phone: newUser.phone };
    //token is created with jwt
    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: 60 * 15 }
    );
    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "30d" }
    );

    const userUpdateData = {
      randomToken: refreshToken,
    };

    await updateUser(newUser?.id, userUpdateData);

    res
      // token is kept in the cookie.
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 2 * 60,
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
      })
      .status(201)
      .json({
        message: "Successfully created an account.",
        userId: newUser.id,
      });
  },
];

export const login = [
  // for body checking middleware with express validator
  body("phone", "Invalid phone number.")
    .trim()
    .matches("^[0-9]+$")
    .notEmpty()
    .isLength({ min: 5, max: 12 }),
  body("password", "Password must be 8 digits.")
    .trim()
    .matches("^[0-9]+$")
    .notEmpty()
    .isLength({ min: 8, max: 8 }),
  async (req: Request, res: Response, next: NextFunction) => {
    //first of all checking request
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = errorCode.invalid;
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    let phone = req.body.phone;
    const password = req.body.password;
    if (phone.slice(0, 2) === "09") {
      phone = phone.substring(2, phone.length);
    }
    const user = await getUserByPhone(phone);
    checkUserIfNotExit(user);

    // user.status is Freeze
    if (user?.status === "FREEZE") {
      return next(
        createError(
          "Your accont is temporarily locked.Please contact us.",
          401,
          errorCode.accountFreeze
        )
      );
    }

    const isMatchPassword = await bcrypt.compare(password, user!.password);

    if (!isMatchPassword) {
      /* -----------------Starting to record the password wrong time-------------*/
      const lastRequest = new Date(user!.updatedAt).toLocaleDateString();
      const isSameDate = new Date().toLocaleDateString() === lastRequest;
      if (!isSameDate) {
        // if not the same day,we will start to record errorCount;
        const userData = {
          errorCount: 1,
        };
        await updateUser(user!.id, userData);
      } else {
        // if errorCount is 2 or greater than 2
        if (user!.errorCount > 2) {
          const userData = {
            status: "FREEZE",
          };
          await updateUser(user!.id, userData);
        } else {
          const userData = {
            errorCount: {
              increment: 1,
            },
          };
          await updateUser(user!.id, userData);
        }
      }
      //if password does not match ,
      return next(createError(req.t("wrongPassword"), 401, errorCode.invalid));
    }

    const accessTokenPayload = { id: user!.id };
    const refreshTokenPayload = { id: user!.id, phone: user!.phone };
    //token is created with jwt
    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: 15 * 60 }
    );
    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "30d" }
    );

    const userUpdateData = {
      errorCount: 0,
      randomToken: refreshToken,
    };

    await updateUser(user!.id, userUpdateData);

    res
      // token is kept in the cookie.
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
      })
      .status(200)
      .json({
        message: "Successfully created an account.",
        userId: user!.id,
      });
  },
];

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;

  //If you don't have the token,your logout option is meaningless.
  if (!refreshToken) {
    return next(
      createError("You are not authenticated user.", 400, errorCode.invalid)
    );
  }

  //Token decoded
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
      id: number;
      phone: string;
    };
  } catch (err) {
    // wrong token
    return next(
      createError("You are not authenticated user.", 400, errorCode.invalid)
    );
  }
  const user = await getUserById(decoded.id);
  checkUserIfNotExit(user);
  if (user?.phone !== decoded.phone) {
    // token decoded phone and database phone check
    return next(
      createError("You are not authenticated user.", 400, errorCode.invalid)
    );
  }
  // if your old randomtoken remove , need to update by replacing new random token.
  const userData = {
    randomToken: generateToken(),
  };
  await updateUser(user.id, userData);
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    message: "You are successfully logged out.",
  });
};

export const forgotPassword = [
  body("phone", "Invalid phone number.")
    .trim()
    .matches("^[0-9]+$")
    .notEmpty()
    .isLength({ min: 5, max: 12 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    let phone = req.body.phone;
    //slice  09
    if (phone.slice(0, 2) === "09") {
      phone = phone.substring(2, phone.length);
    }
    const user = await getUserByPhone(phone);
    checkUserIfNotExit(user);
    //Check OtpRow with phone number
    const otpExit = await getOtpByPhone(phone);
    checkOtpRow(otpExit);
    //OTP Sending
    const otp = 234567; //For testing
    // const otp = generateOtp();  For useage in production
    const salt = await bcrypt.genSalt(10);
    const hashOtp = await bcrypt.hash(String(otp), salt);
    const token = generateToken();

    let resultData;

    const lastOtpRequest = new Date(otpExit!.updatedAt).toLocaleDateString();
    const today = new Date(Date.now()).toLocaleDateString();
    const isSameDate = today === lastOtpRequest;
    checkOtpErrorIfSameDate(isSameDate, otpExit!.error);

    if (!isSameDate) {
      // if not the same day,we will find otpRow with phone and update otpData
      const otpData: any = {
        phone,
        otp: hashOtp,
        rememberToken: token,
        count: 1,
      };
      resultData = await updateOtp(otpExit!.id, otpData);
    } else {
      if (otpExit?.count === 3) {
        return next(
          createError(
            "OTP is allowed to request 3 times pre day.",
            405,
            errorCode.invalid
          )
        );
      } else {
        // updateOtp if count is less than 3.
        const otpData = {
          otp: hashOtp,
          rememberToken: token,
          count: {
            //   otpRow.count +1
            increment: 1,
          },
        };
        resultData = await updateOtp(otpExit!.id, otpData);
      }
    }
    //Response
    res.status(200).json({
      message: `We've already sent to otp to 09${phone}`,
      otp: resultData.otp,
      phone: `09${resultData.phone}`,
      token: resultData.rememberToken,
    });
  },
];

export const verifyOtpForgotPassword = [
  body("phone", "Invalid phone number.")
    .trim()
    .matches("^[0-9]+$")
    .notEmpty()
    .isLength({ min: 5, max: 12 }),
  body("otp", "Invalid OTP Number.")
    .trim()
    .matches("^[0-9]+$")
    .isLength({ min: 6, max: 6 })
    .notEmpty(),
  body("token", "Invalid Token.").notEmpty().escape().trim(),
  async (req: Request, res: Response, next: NextFunction) => {
    const error = validationResult(req).array({ onlyFirstError: true });
    if (error.length > 0) {
      return next(createError(error[0].msg, 400, errorCode.invalid));
    }
    const { phone, otp, token } = req.body;

    // checking user exit or not
    //slice  09
    let slicedPhone;
    if (phone.slice(0, 2) === "09") {
      slicedPhone = phone.substring(2, phone.length);
    }
    const user = await getUserByPhone(slicedPhone);
    checkUserIfNotExit(user);
    // checking otp row exit or not
    const otpRow = await getOtpByPhone(slicedPhone);
    checkOtpRow(otpRow);

    const lastOtpVerify = new Date(otpRow!.updatedAt).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    const isSameDate = today === lastOtpVerify;

    checkOtpErrorIfSameDate(isSameDate, otpRow!.error);
    // checking otp error count
    if (otpRow?.rememberToken !== token) {
      const otpData = {
        errorCount: 5,
      };
      await updateOtp(otpRow!.id, otpData);
      return next(createError("Invalid token", 400, errorCode.invalid));
    }
    //OTP is expired.
    const isExpired = moment().diff(otpRow!.updatedAt, "minutes") > 2;
    if (isExpired) {
      const error: any = "OTP is expired";
      error.status = 403;
      error.code = errorCode.otpExpired;
      throw error;
    }

    const isMatchOption = await bcrypt.compare(otp, otpRow!.otp);
    // If OTP is wrong,
    if (!isMatchOption) {
      if (!isSameDate) {
        // if Otp is wrong and not the same date ,otp is reset as default 1;
        const otpData = {
          error: 1,
        };
        await updateOtp(otpRow!.id, otpData);
      } else {
        //if Otp is wrong but the same date ,otp is incresed 1;
        const otpData = {
          error: {
            increment: 1,
          },
        };
        await updateOtp(otpRow!.id, otpData);
      }
      // if OTP doesn't match,
      const error: any = new Error("Invalid Otp.");
      error.status = 401;
      error.code = errorCode.invalid;
      return next(createError("Invalid Otp", 401, errorCode.invalid));
    }
    // Preparing Data to send server as optData;D
    const verifyToken = generateToken();
    const otpData = {
      verifyToken,
      error: 0,
      count: 1,
    };

    // Everything is Ok.
    const result = await updateOtp(otpRow!.id, otpData);
    res.status(200).json({
      message: "OTP is sucessfully verified.",
      phone: `09${result.phone}`,
      token: result.verifyToken,
    });
  },
];

export const resetPassword = [
  // for body checking middleware with express validator
  body("phone", "Invalid phone number.")
    .trim()
    .matches("^[0-9]+$")
    .notEmpty()
    .isLength({ min: 5, max: 12 }),
  body("password", "Password must be 8 digits.")
    .trim()
    .matches("^[0-9]+$")
    .notEmpty()
    .isLength({ min: 8, max: 8 }),
  body("token", "Invalid Token.").notEmpty().escape().trim(),
  // callback function
  async (req: Request, res: Response, next: NextFunction) => {
    //first of all checking request
    const errors = validationResult(req).array({ onlyFirstError: true });
    errors;
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = errorCode.invalid;
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    const { phone, password, token } = req.body;

    //this step should be user does not exit in the user Table
    let slicedPhone;
    if (phone.slice(0, 2) === "09") {
      slicedPhone = phone.substring(2, phone.length);
    }
    const user = await getUserByPhone(slicedPhone);
    //If not, there were will occur error.
    checkUserIfNotExit(user);

    //Inside the Otp table, this row must be
    const otpRow = await getOtpByPhone(slicedPhone);
    checkOtpRow(otpRow);
    // Otp error count is overLimit
    if (otpRow?.error === 5) {
      // if not , that is an attack.
      return next(
        createError("This request may be an attack.", 400, errorCode.invalid)
      );
    }
    //To verify the OTP,
    if (otpRow?.verifyToken !== token) {
      const otpData = {
        error: 5,
      };
      //update otpRow with error count
      await updateOtp(otpRow!.id, otpData);
      // if token is not matched
      const error: any = new Error("Invalid Token.");
      error.status = 401;
      error.code = errorCode.invalid;
      return next(createError("Invalid Token", 401, errorCode.invalid));
    }
    //request is expired.
    const isExpired = moment().diff(otpRow?.updatedAt, "minutes") > 10;
    if (isExpired) {
      const error: any = new Error();
      error.status = 403;
      error.code = errorCode.requestExpired;
      return next(
        createError(
          "Your request is expired.Please try again later.",
          403,
          errorCode.requestExpired
        )
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const accessTokenPayload = { id: user!.id };
    const refreshTokenPayload = { id: user!.id, phone: user!.phone };
    //token is created with jwt
    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: 15 * 60 }
    );
    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "30d" }
    );

    const userUpdateData = {
      randomToken: refreshToken,
      password: hashPassword,
    };

    await updateUser(user!.id, userUpdateData);

    res
      // token is kept in the cookie.
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: "Successfully created an account.",
        userId: user!.id,
      });
  },
];

export const authCheck = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const user = await getUserById(userId!);
  checkUserIfNotExit(user);
  res.status(200).json({
    message: "You are authenticated",
    userId: user?.id,
    username: user?.fullName,
    image: user?.image,
  });
};
