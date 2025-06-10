import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import api from ".";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      //   retry: 2,
    },
  },
});

// const fetchProducts = async (q?: string) => {
//   const response = await api.get(`users/products${q ?? ""}`);
//   return response.data;
// };

const fetchProducts = (q?: string) =>
  api.get(`user/products${q ?? ""}`).then((res) => res.data);

const fetchPosts = (q?: string) =>
  api.get(`user/posts/infinite${q ?? ""}`).then((res) => res.data);

export const productQuery = (q?: string) => ({
  queryKey: ["products", q],
  queryFn: () => fetchProducts(q),
});

export const postQuery = (q?: string) => ({
  queryKey: ["posts", q],
  queryFn: () => fetchPosts(q),
});

const fetchPostsInfinite = async ({ pageParam = null }) => {
  const page = pageParam ? `?limit=4&cursor=${pageParam}` : "?limit=4";
  const response = await api.get(`user/posts/infinite${page}`);
  return response.data;
};

export const postInfiniteQuery = () => ({
  queryKey: ["posts", "infinite"],
  queryFn: fetchPostsInfinite,
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
  // getPreviousPageCursor: (firstpage: any, pages: any) =>
  //   firstpage.prevCursor ?? undefined,
  maxPages: 6, // nummber of pages
});

export const fetchOnePost = async (postId: number) => {
  const post = await api.get(`user/posts/${postId}`);
  if (!post) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }
  return post.data;
};

export const onePostQuery = (id: number) => ({
  queryKey: ["posts", "detail", id],
  queryFn: () => fetchOnePost(id),
});

const fetchCategoryAndType = () =>
  api.get("/user/filter-type").then((res) => res.data);

export const categoryAndTypeQuery = () => ({
  queryKey: ["category", "type"],
  queryFn: fetchCategoryAndType,
});

const fetchInfiniteProducts = async ({
  pageParam = null,
  categories = null,
  types = null,
}: {
  pageParam?: null | number;
  categories?: null | string;
  types?: null | string;
}) => {
  let query = pageParam ? `?limit=3&cursor=${pageParam}` : "?limit=3";
  if (categories) query += `&category=${categories}`;
  if (types) query += `&type=${types}`;
  const response = await api.get(`user/products${query}`);
  return response.data;
};

export const productInfiniteQuery = (
  categories: null | string = null,
  types: null | string = null,
) => ({
  queryKey: [
    "products",
    "infinite",
    categories ?? undefined,
    types ?? undefined,
  ],
  queryFn: ({ pageParam }: { pageParam: null | number }) =>
    fetchInfiniteProducts({ pageParam, categories, types }),
  placeholderData: keepPreviousData,
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});

export const fetchOneProduct = async (productId: number) => {
  const product = await api.get(`user/products/${productId}`);
  if (!product) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }
  return product.data;
};

export const oneProductQuery = (id: number) => ({
  queryKey: ["products", "detail", id],
  queryFn: () => fetchOneProduct(id),
});
