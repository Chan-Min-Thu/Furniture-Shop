import { realpathSync } from "fs";
import { prisma } from "./prismaClient";

export type productArgs = {
  id?: number;
  name: string;
  description: string;
  price: number;
  rating?: number;
  discount: number;
  inventory: number;
  category: string;
  type: string;
  tags: string[];
  images?: string[];
};

// ***********************Create Product *******************************
export const createOneProduct = async (data: productArgs) => {
  const productData: any = {
    name: data.name,
    description: data.description,
    price: data.price,
    discount: data.discount,
    inventory: data.inventory,
    category: {
      connectOrCreate: {
        where: { name: data.category },
        create: {
          name: data.category,
        },
      },
    },
    type: {
      connectOrCreate: {
        where: { name: data.type },
        create: {
          name: data.type,
        },
      },
    },

    images: {
      create: data.images,
    },
  };

  if (data.tags && data.tags.length) {
    productData.tags = {
      connectOrCreate: data.tags.map((tagName: any) => ({
        where: { name: tagName },
        create: { name: tagName },
      })),
    };
  }

  return prisma.product.create({
    data: productData,
  });
};
// *****************************************updated product *********************************************
export const updatedOneProduct = async (id: number, data: productArgs) => {
  const productData: any = {
    name: data.name,
    description: data.description,
    price: data.price,
    discount: data.discount,
    inventory: data.inventory,
    category: {
      connectOrCreate: {
        where: { name: data.category },
        create: {
          name: data.category,
        },
      },
    },
    type: {
      connectOrCreate: {
        where: { name: data.type },
        create: {
          name: data.type,
        },
      },
    },
  };

  if (data.tags && data.tags.length) {
    productData.tags = {
      set: [],
      connectOrCreate: data.tags.map((tagName: any) => ({
        where: { name: tagName },
        create: { name: tagName },
      })),
    };
  }

  if (data.images && data.images.length > 0) {
    productData.images = {
      deleteMany: {},
      create: data.images,
    };
  }
  return prisma.product.update({
    where: { id: Number(id) },
    data: productData,
  });
};
// find product

export const getProductById = async (id: number) => {
  return prisma.product.findUnique({
    where: { id: Number(id) },
    include: {
      images: true,
    },
  });
};

/*******************************Delte Product ******************************/

export const deleteOneProduct = async (id: number) => {
  return prisma.product.delete({
    where: { id: Number(id) },
  });
};

/*******************Get Product With Realtions************************/
export const getProductWithRelations = async (id: number, userId: number) => {
  return prisma.product.findUnique({
    where: { id },

    omit: { createdAt: true, updatedAt: true, categoryId: true, typeId: true },
    include: {
      images: {
        select: {
          id: true,
          path: true,
        },
      },
      users: {
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      },
    },
  });
};

/************************************Get Post Lists ************************ */
export const getProductLists = async (options: any) => {
  return prisma.product.findMany(options);
};

export const getProductsByCategoryAndType = async (options: any) => {
  return prisma.product.findMany({
    where: {
      category: {
        name: options.category,
      },
      type: {
        name: options.type,
      },
    },
    omit: { createdAt: true, updatedAt: true, categoryId: true, typeId: true },
    include: {
      images: {
        select: {
          id: true,
          path: true,
        },
      },
    },
  });
};

export const getProductCategories = async () => {
  return prisma.category.findMany();
};

export const getProductTypes = async () => {
  return prisma.type.findMany();
};
