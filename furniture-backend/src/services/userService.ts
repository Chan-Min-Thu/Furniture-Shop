import { prisma } from "./prismaClient";

export const addFavouriteProduct = async (
  userId: number,
  productId: number
) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      products: {
        connect: {
          id: productId,
        },
      },
    },
  });
};

export const removeFavouriteProduct = async (
  userId: number,
  productId: number
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { products: { disconnect: { id: productId } } },
  });
};
