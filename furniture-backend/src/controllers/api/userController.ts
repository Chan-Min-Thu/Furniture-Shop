import { Request, Response, NextFunction } from "express";
import { query, validationResult } from "express-validator";
import { unlink } from "fs";
import sharp from "sharp";
import path from "path";
import { errorCode } from "../../config/errorCode";
import { authorise } from "../../utils/authorise";
import { getUserById, updateUser } from "../../services/authService";
import { checkUserIfNotExit } from "../../utils/auth";
import { checkFileExit } from "../../utils/check";
import imageQueue from "../../jobs/queues/imageQueues";

interface CustomRequest extends Request {
  userId?: number;
  file?: any;
}

export const changeLanguage = [
  query("lng", "Invalid language code.")
    .trim()
    .matches("^[a-z]+$")
    .notEmpty()
    .isLength({ min: 2, max: 3 }),
  (req: Request, res: Response, next: NextFunction) => {
    //first of all checking query
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = errorCode.invalid;
      return next(error);
    }
    const { lng } = req.query;
    res.cookie("i18next", lng);
    res.status(200).json({
      //interpolation Dynamically
      message: req.t("changelanguage", { lang: lng }),
    });
  },
];

export const testPermission = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const user = await getUserById(userId!);
  checkUserIfNotExit(user);
  const info: any = {
    title: "This is premission testing.",
  };
  const canPermit = authorise(true, user!.role, "ADMIN");
  if (canPermit) {
    info.content = "You can permit this action.";
  }
  res.status(200).json(info);
};

export const uploadProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId as number;
  const imagefile = req.file;

  const user = await getUserById(userId);
  checkUserIfNotExit(user);
  checkFileExit(imagefile);

  if (user?.image) {
    // this is to old path of the file of the user.image
    const filePath = path.join(
      __dirname,
      "../../..",
      "/uploads/images",
      user.image
    );

    unlink(filePath, (err) => {
      console.log(err);
    });
  }

  const userData = {
    image: imagefile?.filename,
  };
  const newUser = await updateUser(userId, userData);
  res.status(200).json({
    message: "File uploaded successfully",
    image: newUser.image,
  });
};

export const getMyPhoto = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const pathName = path.join(
    __dirname,
    "../../..",
    "/uploads/images",
    "1743869039576-687399969-CMT-Logo.jpeg"
  );

  res.sendFile(pathName, (err) => {
    if (err) {
      res.status(404).send("File not found.");
    }
  });
};

export const uploadMultiple = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId as number;
  const imagefile = req.files;
  const user = await getUserById(userId);
  // checkUserIfNotExit(user);
  // checkFileExit(imagefile);
  res.status(200).json({
    message: "File uploaded successfully",
    image: imagefile,
  });
};
// const userData = {

export const uploadProfileOptimize = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId as number;
  const imagefile = req.file;
  const user = await getUserById(userId);
  checkUserIfNotExit(user);
  checkFileExit(imagefile);
  const splitedFileName = req.file.filename.split(".")[0];

  const job = await imageQueue.add(
    "optimizedImage",
    {
      filePath: req.file?.path,
      fileName: `${splitedFileName}.webp`,
      width: 300,
      height: 300,
      quality: 50,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    }
  );

  // try {
  //   const filePath = path.join(
  //     __dirname,
  //     "../../..",
  //     "uploads/images",
  //     fileName
  //   );
  //   await sharp(req.file.buffer)
  //     .resize(300, 300)
  //     .webp({ quality: 50 })
  //     .toFile(filePath);
  // } catch (err) {
  //   console.log(err);
  //   res.status(500).json({ message: "Image Optimization failed." });
  //   return;
  // }
  const optimizedImage = user!.image?.split(".")[0] + ".webp";
  if (user?.image) {
    const filePath = path.join(
      __dirname,
      "../../..",
      "/uploads/images",
      user?.image
    );
    const optimizePath = path.join(
      __dirname,
      "../../..",
      "/uploads/optimize",
      optimizedImage
    );
    unlink(filePath, (err) => {
      console.log(err);
    });
    unlink(optimizePath, (err) => {
      console.log(err);
    });
  }

  const userData = {
    image: req.file.filename,
  };
  const updatedUser = await updateUser(userId, userData);

  res.status(200).json({
    message: "File uploaded successfully",
    user: updatedUser,
    jobId: job.id,
  });
};
