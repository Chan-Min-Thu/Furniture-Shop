import { Request, Response, NextFunction } from "express";
import { query, param, validationResult } from "express-validator";

import { errorCode } from "../../config/errorCode";
import { createError } from "../../utils/error";
import { checkUserIfNotExit } from "../../utils/auth";
import { getUserById } from "../../services/authService";
import {
  getPostById,
  getPostLists,
  getPostWithRelations,
} from "../../services/postService";

import { getOrSetCache } from "../../utils/cache";
import { checkModelIfNotExit } from "../../utils/check";

interface CustomRequest extends Request {
  userId?: number;
}
export const getPost = [
  // for body checking middleware with express validator
  param("id", "PostId is required.").isInt({ gt: 1 }),
  // callback function
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    //first of all checking request
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    // checking authenticated user
    const userId = req?.userId;
    const postId = Number(req?.params.id);
    const user = await getUserById(userId!);
    checkUserIfNotExit(user);

    const cachedKey = `posts:${JSON.stringify(postId)}`;
    const post = await getOrSetCache(cachedKey, async () => {
      return await getPostWithRelations(postId);
    });
    // const post = await getPostWithRelations(+postId);
    // we don't need to use this code becuase we are using getPostWithRelation order to modify the post with relations by using prisma
    // const modifiedPost = {
    //   id: post?.id,
    //   title: post?.title,
    //   content: post?.content,
    //   body: post?.body,
    //   image: "/optimize/" + post?.image.split(".")[0] + ".webp",
    //   updatedAt: post?.updatedAt,
    //   fullName: post?.fullName,
    //   category: post?.category.name,
    //   type: post?.type.name,
    //   tags: post?.tags.map((tag) => tag.name) ?? null,
    // };
    checkModelIfNotExit(post);
    res.status(200).json({
      message: "Ok",
      post,
    });
  },
];

export const getPostsByPagination = [
  // for query checking middleware with express validator
  query("page", "Page number must be unsigned integer.")
    .isInt({ gt: 0 })
    .optional(),
  query("limit", "Limit number must be unsigned integer.")
    .isInt({ gt: 2 })
    .optional(),
  // callback function
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    //first of all checking request
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExit(user);

    const skip = (Number(page) - 1) * Number(limit);
    const options = {
      skip,
      take: limit + 1,
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        user: {
          select: {
            fullName: true,
          },
        },
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "asc",
      },
    };

    const cachedKey = `posts:${JSON.stringify(req.query)}`;
    const posts = await getOrSetCache(cachedKey, async () => {
      return await getPostLists(options);
    });

    // const posts =;
    const hasNextPage = posts.length > limit;
    const previousPage = page !== 1 ? page - 1 : null;
    let nextPage = null;
    if (hasNextPage) {
      posts.pop();
      nextPage = page + 1;
    } else {
    }

    res.status(200).json({
      message: "Get all posts.",
      posts,
      currentPage: page,
      nextPage,
      previousPage,
    });
  },
];

export const getInfinitePostsByPagination = [
  // for query checking middleware with express validator
  query("cursor", "Cursor number must be unsigned integer.")
    .isInt({ gt: 0 })
    .optional(),
  query("limit", "Limit number must be unsigned integer.")
    .isInt({ gt: 2 })
    .optional(),
  // callback function
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    //first of all checking request
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    const lastCursor = Number(req.query.cursor);
    const limiter = Number(req.query.limit) || 5;
    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExit(user);
    const options = {
      take: +limiter + 1,
      skip: lastCursor ? 1 : 0,
      cursor: lastCursor ? { id: lastCursor } : undefined,
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        updatedAt: true,
        user: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    };

    const cacheKey = `posts:${JSON.stringify(req.query)}`;
    const posts = await getOrSetCache(cacheKey, async () => {
      return await getPostLists(options);
    });

    const hasNextPage = posts.length > limiter;

    if (hasNextPage) {
      posts.pop();
    }

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].id : null;

    res.status(200).json({
      message: "Get All infinite posts",
      hasNextPage,
      nextCursor,
      prevCursor: lastCursor,
      posts,
    });
  },
];
