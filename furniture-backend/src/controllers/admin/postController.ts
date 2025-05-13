import { Request, Response, NextFunction } from "express";
import { body, check, query, validationResult } from "express-validator";
import sanitizeHtml from "sanitize-html";
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
  updateOnePost,
  createOnePost,
  getPostById,
  PostArgs,
  deleteOnePost,
} from "../../services/postService";
import { constants } from "perf_hooks";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
  file?: any;
}

// title      String    @db.VarChar(255)
// content    String
// body       String
// categoryId Int
// typeId     Int
// createdAt  DateTime  @default(now())
// updatedAt  DateTime  @updatedAt
// user       User      @relation(fields: [authorId], references: [id])
// category   Category  @relation(fields: [categoryId], references: [id])
// type       Type      @relation(fields: [typeId], references: [id])
// tags       PostTag[]

const removeFile = async (
  originalFile: string,
  optimizeFile: string | null
) => {
  const filePath = path.join(
    __dirname,
    "../../..",
    "/uploads/images",
    originalFile
  );

  unlink(filePath, (err) => {
    console.log(err);
  });
  if (optimizeFile) {
    const optimizePath = path.join(
      __dirname,
      "../../..",
      "/uploads/optimize",
      optimizeFile
    );
    unlink(optimizePath, (err) => {
      console.log(err);
    });
  }
};

export const createPost = [
  // for body checking middleware with express validator
  body("title", "Title is requiredI.").trim().notEmpty().escape(),
  body("content", "Content is required.").trim().notEmpty().escape(),
  body("body", "Body is required.")
    .trim()
    .notEmpty()
    .customSanitizer((val) => sanitizeHtml(val))
    .notEmpty(),
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
      if (req.file) {
        await removeFile(req.file.filename, null);
      }
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    const { title, content, body, category, tags, type } = req.body;

    const user = req.user;
    const image = req.file;
    checkFileExit(image);
    const splitedFileName = req.file.filename.split(".")[0];
    await imageQueue.add(
      "optimizedImage",
      {
        filePath: req.file.path,
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
    const postData: PostArgs = {
      title,
      content,
      body,
      image: req.file!.filename,
      authorId: user!.id,
      category: category,
      type,
      tags,
    };
    const post = await createOnePost(postData);
    await cacheQueue.add(
      "invalidate-post-cache",
      {
        pattern: "posts:*",
      },
      {
        jobId: `invalidate-${Date.now()}`,
        priority: 1,
      }
    );
    res.status(200).json({
      message: "Post created successfully.",
      data: post,
    });
  },
];

export const updatePost = [
  // for body checking middleware with express validator
  body("id", "Post id is required.").trim().notEmpty().isInt({ min: 1 }),
  body("title", "Title is requiredI.").trim().notEmpty().escape(),
  body("content", "Content is required.").trim().notEmpty().escape(),
  body("body", "Body is required.")
    .trim()
    .notEmpty()
    .customSanitizer((val) => sanitizeHtml(val))
    .notEmpty(),
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
      if (req.file) {
        await removeFile(req.file.filename, null);
      }
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    const { id, title, content, body, category, tags, type } = req.body;
    const user = req.user;
    // checkFileExit(req.file);

    // do post inlcude in the table?
    const post = await getPostById(+id);
    if (!post) {
      await removeFile(req.file.filename, null);
      return next(
        createError("This data model does not exit.", 401, errorCode.invalid)
      );
    }
    //check user is real author

    if (user.id !== post.authorId) {
      return next(
        createError(
          "This action is not allowed.",
          403,
          errorCode.unauthenticated
        )
      );
    }
    const postData: PostArgs = {
      id,
      title,
      content,
      body,
      image: req.file,
      authorId: user!.id,
      category: category,
      type,
      tags,
    };
    if (req.file) {
      postData.image = req.file.filename;
      const splitedFileName = req.file.filename.split(".")[0];
      await imageQueue.add(
        "optimizedImage",
        {
          filePath: req.file?.path,
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
      const optimizedFile = post.image.split("/")[2];
      await removeFile(post.originalImage, optimizedFile);
    }
    const updatedPost = await updateOnePost(id, postData);
    await cacheQueue.add(
      "invalidate-post-cache",
      {
        pattern: "posts:*",
      },
      {
        jobId: `invalidate-${Date.now()}`,
        priority: 1,
      }
    );

    res.status(200).json({
      message: "Successfully updated post.",
      data: updatedPost,
    });
  },
];

export const deletePost = [
  // for body checking middleware with express validator
  body("id", "PostId is required.").trim().notEmpty().isInt({ min: 1 }),
  // callback function
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    //first of all checking request
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    const { id } = req.body;
    const user = req.user;

    const post = await getPostById(+id);
    checkModelIfNotExit(post);

    if (user!.id !== post!.authorId) {
      return next(
        createError(
          "This action is not allowed.",
          403,
          errorCode.unauthenticated
        )
      );
    }
    const postDelete = await deleteOnePost(+id);
    const optimizedFile = post?.image.split(".")[0] + ".webp";
    await removeFile(post!.image, optimizedFile);
    await cacheQueue.add(
      "invalidate-post-cache",
      {
        pattern: "posts:*",
      },
      {
        jobId: `invalidate-${Date.now()}`,
        priority: 1,
      }
    );

    res.status(200).json({
      message: "Successfully deleted post.",
      postId: postDelete.id,
    });
  },
];
