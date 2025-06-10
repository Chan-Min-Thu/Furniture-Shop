import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";

const fileStorage = multer.diskStorage({
  // destination: function (req, file, cb) {
  destination: function (req, file, cb) {
    cb(null, "uploads/images");
    //   const type =file.mimetype.split('/')[0]
    //   if (type === 'image') {
    //     cb(null, 'uploads/images')
    //   }
    //   else(type === 'file') {
    //     cb(null, 'uploads/files')
    //   }}
  },
  //filename: function (req, file, cb) {
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + ext;
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  console.log("file", file);
  console.log("req", req.body);
  // Accept images only
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const upload = multer({
  storage: fileStorage,
  fileFilter,
  limits: {
    fieldSize: 1024 * 1024 * 10, // for testing purpose 2MB
  },
});

export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10,
  }, // maximum file size 10MB, so we need to optimize the image
});
