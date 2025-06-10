import { limiter } from "./../../middlewares/rateLimiter";
import { Request, Response, NextFunction } from "express";
import { param, body, query, validationResult } from "express-validator";

import { createError } from "../../utils/error";
import { errorCode } from "../../config/errorCode";
import { getUserById } from "../../services/authService";
import { checkUserExit, checkUserIfNotExit } from "./../../utils/auth";
import { getOrSetCache } from "../../utils/cache";
import {
  getProductCategories,
  getProductLists,
  getProductsByCategoryAndType,
  getProductTypes,
  getProductWithRelations,
} from "../../services/productService";
import { checkModelIfNotExit } from "../../utils/check";
import {
  addFavouriteProduct,
  removeFavouriteProduct,
} from "../../services/userService";
import cacheQueue from "../../jobs/queues/cacheQueues";
interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}
export const getProduct = [
  // for body checking middleware with express validator
  param("id", "ProductId is required.").isInt({ gt: 0 }),
  // callback function
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    //first of all checking request
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }
    // checking authenticated user
    const userId = req?.userId;
    const productId = req.params.id;
    const user = await getUserById(userId!);
    checkUserIfNotExit(user);

    const cachedKey = `products:${JSON.stringify(req.params.id)}`;
    const product = await getOrSetCache(cachedKey, async () => {
      return await getProductWithRelations(+productId, user!.id);
    });
    // const product = await getProductWithRelations(+productId);
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
    checkModelIfNotExit(product);
    res.status(200).json({
      message: "Ok",
      data: product,
    });
  },
];

export const getProductsByPagination = [
  query("cursor", "Page number must be unsigned integer.")
    .isInt({ gt: 0 })
    .optional(),
  query("limit", "Limit number must be unsigned integer.")
    .isInt({ gt: 2 })
    .optional(),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 404, errorCode.invalid));
    }
    const cursor = Number(req.query.cursor);
    const limit = Number(req.query.limit) || 5;
    const category = req.query.category;
    const type = req.query.type;

    let categoryList: number[] = [];
    let typeList: number[] = [];
    if (category) {
      categoryList = category
        ?.toString()
        .split(",")
        .map((cat) => Number(cat))
        .filter((c) => c > 0);
    }
    if (type) {
      typeList = type
        .toString()
        .split(",")
        .map((t) => Number(t))
        .filter((c) => c > 0);
    }
    const where = {
      AND: [
        categoryList.length > 0 ? { categoryId: { in: categoryList } } : {},
        typeList.length > 0 ? { typeId: { in: typeList } } : {},
      ],
    };
    const options = {
      where,
      take: Number(limit) + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        discount: true,
        status: true,
        images: {
          select: {
            id: true,
            path: true,
          },
          take: 1, // just only take 1 phote limitly
        },
      },
      orderBy: {
        id: "asc",
      },
    };
    const cacheKey = `products:${JSON.stringify(req.query)}`;
    console.log(cacheKey);
    const products = await getOrSetCache(cacheKey, async () => {
      return await getProductLists(options);
    });
    const hasNextPage = products.length > limiter;

    if (hasNextPage) {
      products.pop();
    }

    const nextCursor =
      products.length > 0 ? products[products.length - 1].id : null;

    res.status(200).json({
      message: "Get All infinite posts",
      hasNextPage,
      nextCursor,
      prevCursor: cursor,
      products,
    });
  },
];

export const getCategoryType = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req?.userId);
  const user = await getUserById(userId);
  checkUserIfNotExit(user);

  const categories = await getProductCategories();
  const types = await getProductTypes();
  res.status(200).json({
    message: "OK",
    categories,
    types,
  });
};

export const toggleFavourite = [
  body("id", "ProductId must be integer.").isInt({ gt: 0 }),
  body("favourite", "Favourite must be boolean.").isBoolean(),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 404, errorCode.invalid));
    }
    const userId = req.userId;
    const user = await getUserById(userId!);
    checkUserIfNotExit(user);

    const productId = Number(req.body.id);
    const favourite = req.body.favourite;
    if (favourite) {
      await addFavouriteProduct(userId!, productId);
    } else {
      await removeFavouriteProduct(userId!, productId);
    }
    await cacheQueue.add(
      "invalidate-product-cache",
      {
        pattern: `products:*`,
      },
      {
        jobId: `invalidate-${Date.now()}`,
        priority: 1,
      }
    );
    res.status(200).json({
      message: favourite
        ? "Added to favourite successfully."
        : "Removed from favourite successfully.",
    });
  },
];
