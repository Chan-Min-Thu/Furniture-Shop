import { prisma } from "./prismaClient";

export type PostArgs = {
  id?: number;
  title: string;
  content: string;
  body: string;
  image: string;
  authorId: number;
  category: string;
  type: string;
  tags: string[];
};

/************************************Create Post *********************************/
export const createOnePost = async (postData: PostArgs) => {
  const data: any = {
    title: postData.title,
    content: postData.content,
    body: postData.body,
    image: postData.image,
    user: {
      connect: {
        id: postData.authorId,
      },
    },
    category: {
      connectOrCreate: {
        where: { name: postData.category },
        create: {
          name: postData.category,
        },
      },
    },
    type: {
      connectOrCreate: {
        where: { name: postData.type },
        create: {
          name: postData.type,
        },
      },
    },
  };

  if (postData.tags && postData.tags.length > 0) {
    data.tags = {
      connectOrCreate: postData.tags.map((tagName) => ({
        where: { name: tagName },
        create: { name: tagName },
      })),
    };
  }
  return prisma.post.create({
    data,
  });
};

/* ************************** Update Post *************************** */
export const updateOnePost = async (id: number, postData: PostArgs) => {
  const data: any = {
    title: postData.title,
    content: postData.content,
    body: postData.body,
    category: {
      connectOrCreate: {
        where: { name: postData.category },
        create: {
          name: postData.category,
        },
      },
    },
    type: {
      connectOrCreate: {
        where: { name: postData.type },
        create: {
          name: postData.type,
        },
      },
    },
  };
  if (postData.image) {
    data.image = postData.image;
  }
  if (postData.tags && postData.tags.length > 0) {
    data.tags = {
      set: [],
      connectOrCreate: postData.tags.map((tagName) => ({
        where: { name: tagName },
        create: { name: tagName },
      })),
    };
  }
  return prisma.post.update({
    where: { id: Number(id) },
    data,
  });
};

/************************************Get Post By Id ************************ */
export const getPostById = async (id: number) => {
  return prisma.post.findUnique({
    where: { id },
  });
};

/************************************Delete Post By Id ************************ */
export const deleteOnePost = async (id: number) => {
  return prisma.post.delete({
    where: { id },
  });
};

/************************************Get Post With Relations ************************ */
export const getPostWithRelations = async (id: number) => {
  return prisma.post.findUnique({
    where: { id: Number(id) },
    // omit: { createdAt: true },
    //include:{user:ture,category:true},
    select: {
      id: true,
      title: true,
      content: true,
      body: true,
      image: true,
      updatedAt: true,
      user: {
        select: {
          fullName: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      type: {
        select: {
          name: true,
        },
      },
      tags: {
        select: {
          name: true,
        },
      },
    },
  });
};

/************************************Get Post Lists ************************ */
export const getPostLists = async (options: any) => {
  return prisma.post.findMany(options);
};
