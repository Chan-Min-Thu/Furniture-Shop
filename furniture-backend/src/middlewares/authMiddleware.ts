import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorCode } from "../config/errorCode";
import { getUserById, updateUser } from "../services/authService";
import { createError } from "../utils/error";
interface CustomRequest extends Request {
  userId?: number;
}

/*
  In case of AccessToken in mobile
  -api request 
  -if response is error.expired.
  -call refresh api
  - response is 2 new tokens 
*/

/*
if Every Api is called , http cookie return res.

*/
export const authMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  //the way of request from mobile
  const platform = req.headers["x-platform"];
  // you need to add in the headers ,x-platform,authorization
  if (platform === "mobile") {
    const accessTokenMobile = req.headers.authorization?.split(" ")[1];
    console.log("accessTokenMobile", accessTokenMobile);
  } else {
    console.log("Request is from Web.");
  }

  const accessToken = req.cookies ? req.cookies.accessToken : null;
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;

  //if refresh token is not in the cookie
  if (!refreshToken) {
    return next(
      createError(
        "You are not an authenticated user.",
        401,
        errorCode.unauthenticated
      )
    );
  }

  //generate new token
  const generateNewToken = async () => {
    let decoded;
    try {
      decoded = (await jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      )) as {
        id: number;
        phone: string;
      };
    } catch (error) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated
        )
      );
    }

    if (isNaN(decoded.id)) {
      return next(
        createError(
          "You are not an authenticated user.",
          401,
          errorCode.unauthenticated
        )
      );
    }
    const user = await getUserById(decoded!.id);
    if (!user) {
      return next(
        createError(
          "This accunt has not registered.",
          401,
          errorCode.unauthenticated
        )
      );
    }
    if (user.phone !== decoded.phone) {
      return next(
        createError(
          "This accunt has not registered.",
          401,
          errorCode.unauthenticated
        )
      );
    }
    if (user.randomToken !== refreshToken) {
      return next(
        createError(
          "This accunt has not registered.",
          401,
          errorCode.unauthenticated
        )
      );
    }
    const accessTokenPayload = { id: user.id };
    const refreshTokenPayload = { id: user.id, phone: user.phone };

    const newAccessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15,
      }
    );
    const newRefreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "30d",
      }
    );

    const newUserData = {
      randomToken: newRefreshToken,
    };
    await updateUser(user.id, newUserData);
    // token is kept in the cookie.
    console.log("newAccessToken", newAccessToken);
    res
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    req.userId = user.id;
    next();
  };

  console.log(generateNewToken);
  if (!accessToken) {
    generateNewToken();
    // const error: any = new Error("Access Token has expired.");
    // error.status = 401;
    // error.code = errorCode.accessTokenExpired;
    // return next(error);
  }
  /*--------------Verify Token------------*/
  let decoded;
  try {
    decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as {
      id: number;
    };
    if (isNaN(decoded.id)) {
      return next(
        createError(
          "This accunt has not registered.",
          401,
          errorCode.unauthenticated
        )
      );
    }
    req.userId = decoded.id;
    next();
  } catch (error: any) {
    if ((error.name = "TokenExpiredError")) {
      generateNewToken();
      // error.name = "Access token has expired.";
      // error.status = 401;
      // error.code = errorCode.accessTokenExpired;
    } else {
      return next(
        createError("Access Token is invalid", 400, errorCode.attack)
      );
    }
  }
};
