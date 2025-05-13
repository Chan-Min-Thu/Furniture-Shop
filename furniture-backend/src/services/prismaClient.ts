import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";

export const prisma = new PrismaClient().$extends({
  result: {
    user: {
      fullName: {
        needs: { firstName: true, lastName: true },
        compute(user) {
          return `${user?.firstName} ${user.lastName}`;
        },
      },
      image: {
        needs: { image: true },
        compute(user) {
          if (user?.image) {
            return `/optimize/${user?.image.split(".")[0]}.webp`;
          }
          return null;
        },
      },
    },
    image: {
      path: {
        needs: { path: true },
        compute(image) {
          return `/optimize/${image.path.split(".")[0]}.webp`;
        },
      },
    },
    post: {
      originalImage: {
        needs: { image: true },
        compute(post) {
          return post.image;
        },
      },
      image: {
        needs: { image: true },
        compute(post) {
          return `/optimize/${post.image.split(".")[0]}.webp`;
        },
      },

      updatedAt: {
        needs: { updatedAt: true },
        compute(post) {
          return post?.updatedAt.toLocaleDateString("en-Us", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        },
      },
    },
  },
});
