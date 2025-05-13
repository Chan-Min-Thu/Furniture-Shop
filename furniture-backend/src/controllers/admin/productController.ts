import { Request, Response, NextFunction } from "express";
import { body, check, query, validationResult } from "express-validator";
import path from "path";
import { unlink } from "fs";

import { errorCode } from "../../config/errorCode";
import { createError } from "../../utils/error";
import { checkUserIfNotExit } from "../../utils/auth";
import { checkFileExit, checkModelIfNotExit } from "../../utils/check";
import { getUserById } from "../../services/authService";
import imageQueue from "../../jobs/queues/imageQueues";
import cacheQueue from "./../../jobs/queues/cacheQueues";
import {
  deleteOneProduct,
  updatedOneProduct,
  createOneProduct,
  getProductById,
  productArgs,
} from "../../services/productService";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
  files?: any;
}

const removeFile = async (
  originalFiles: string[],
  optimizeFiles: string[] | null
) => {
  for (const originalFile of originalFiles) {
    const originalFilePath = path.join(
      __dirname,
      "../../..",
      "/uploads/images",
      originalFile
    );
    unlink(originalFilePath, (err) => {
      console.log("Error while deleting original file", err);
    });
  }
  if (optimizeFiles) {
    for (const optimizeFile of optimizeFiles) {
      const optimizeFilePath = path.join(
        __dirname,
        "../../..",
        "/uploads/optimize",
        optimizeFile
      );
      unlink(optimizeFilePath, (err) => {
        console.log("Error while deleting optimized file", err);
      });
    }
  }
};

/********************************Create Product ***********************************/
export const createProduct = [
  // for body checking middleware with express validator
  body("name", "Name is required.").trim().notEmpty().escape(),
  body("description", "Description is required.").trim().notEmpty().escape(),
  body("price", "Price is required.")
    .isFloat({ min: 0.1 })
    .isDecimal({ decimal_digits: "1,2" }),
  body("discount", "Discount is required.")
    .isFloat({ min: 0.1 })
    .isDecimal({ decimal_digits: "1,2" }),
  body("inventory", "Inventory is required.").isInt({ min: 1 }),
  body("category", "Category is required.").trim().notEmpty().escape(),
  body("type", "Type is required.").trim().notEmpty().escape(),
  body("tags", "Tags is invalid")
    .optional({ nullable: true })
    .customSanitizer((value) => {
      if (value) {
        return value.split(",").filter((tag: string) => tag.trim() !== "");
      }
      return value;
    }),
  // callback function
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    //first of all checking request
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      if (req.files && req.files.length) {
        const originalFiles = req.files.map((file: any) => file.filename);
        await removeFile(originalFiles, null);
      }
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    const {
      name,
      description,
      price,
      discount,
      inventory,
      category,
      type,
      tags,
    } = req.body;

    checkFileExit(req.files && req.files.length > 0);
    //

    await Promise.all(
      req.files.map(async (file: any) => {
        const splitedFileName = file.filename.split(".")[0];
        return imageQueue.add(
          "optimizedImage",
          {
            filePath: file.path,
            fileName: `${splitedFileName}.webp`,
            width: 835,
            height: 577,
            quality: 100,
          },
          {
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 1000,
            },
          }
        );
      })
    );
    const originalFileNames = req.files.map((file: any) => ({
      path: file.filename,
    }));
    const data: productArgs = {
      name,
      description,
      price,
      discount,
      inventory: Number(inventory),
      category,
      type,
      tags,
      images: originalFileNames,
    };
    const product = await createOneProduct(data);

    await cacheQueue.add(
      "invalidate-product-cache",
      {
        pattern: "products:*",
      },
      {
        jobId: `invalidate-${Date.now()}`,
        priority: 1,
      }
    );
    res.status(200).json({
      message: "Post created successfully.",
      data: product,
    });
  },
];
/*********************************Update Product *********************************/
export const updateProduct = [
  // for body checking middleware with express validator
  body("id", "Product id is required.").isInt({ min: 1 }),
  body("name", "Name is required.").trim().notEmpty().escape(),
  body("description", "Description is required.").trim().notEmpty().escape(),
  body("price", "Price is required.")
    .isFloat({ min: 0.1 })
    .isDecimal({ decimal_digits: "1,2" }),
  body("discount", "Discount is required.")
    .isFloat({ min: 0.1 })
    .isDecimal({ decimal_digits: "1,2" }),
  body("inventory", "Inventory is required.").isInt({ min: 1 }),
  body("category", "Category is required.").trim().notEmpty().escape(),
  body("type", "Type is required.").trim().notEmpty().escape(),
  body("tags", "Tags is invalid")
    .optional({ nullable: true })
    .customSanitizer((value) => {
      if (value) {
        return value.split(",").filter((tag: string) => tag.trim() !== "");
      }
      return value;
    }),
  // callback function
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    //first of all checking request
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      if (req.files && req.files.length) {
        const originalFiles = req.files.map((file: any) => file.filename);
        await removeFile(originalFiles, null);
      }
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    const {
      id,
      name,
      description,
      price,
      discount,
      inventory,
      category,
      type,
      tags,
    } = req.body;

    const product = await getProductById(id);

    if (!product) {
      if (req.files && req.files.length > 0) {
        const originalFiles = req.files.map((file: any) => ({
          path: file.filename,
        }));
        removeFile(originalFiles, null);
      }
      return next(
        createError("This data model does not exit.", 409, errorCode.invalid)
      );
    }

    let originalFileNames = [];

    if (req.files && req.files.length > 0) {
      originalFileNames = req.files.map((file: any) => ({
        path: file.filename,
      }));
    }

    const data: productArgs = {
      name,
      description,
      price,
      discount,
      inventory: Number(inventory),
      category,
      type,
      tags,
      images: originalFileNames,
    };
    //updating the images
    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map(async (file: any) => {
          const splitedFileName = file.filename.split(".")[0];
          return imageQueue.add("optimizedImage", {
            filePath: file.path,
            fileName: `${splitedFileName}.webp`,
            width: 835,
            height: 577,
            quality: 100,
          });
        })
      );
      const originalFiles = product.images.map((image) => image.path);
      const optimizedFiles = product.images.map(
        (image) => image.path.split(".")[0] + ".webp"
      );

      await removeFile(originalFiles, optimizedFiles);
    }
    const updatedProduct = await updatedOneProduct(id, data);
    await cacheQueue.add(
      "invalidate-product-cache",
      {
        pattern: "products:*",
      },
      {
        jobId: `invalidate-${Date.now()}`,
        priority: 1,
      }
    );
    res.status(200).json({
      message: "Successfully updated post.",
      id: updatedProduct?.id,
    });
  },
];

/*******************************************Delete Product **********************************/

export const deleteProduct = [
  body("id", "Product id is required.").isInt({ min: 1 }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    const id = Number(req.body.id);

    const product = await getProductById(id);
    checkModelIfNotExit(product);

    await deleteOneProduct(id);

    await cacheQueue.add(
      "invalidate-product-cache",
      {
        pattern: "products:*",
      },
      {
        jobId: `invalidate-${Date.now()}`,
        priority: 1,
      }
    );
    const originalFiles = product!.images.map((image) => image.path);
    const optimizedFiles = product!.images.map(
      (image) => image.path.split(".")[0] + ".webp"
    );

    await removeFile(originalFiles, optimizedFiles);

    res.status(201).json({
      message: "Sucessfully deleted product.",
    });
  },
];

export const updateFavouriteProduct = [];
