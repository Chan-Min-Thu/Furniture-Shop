import useAuthStore, { Status } from "@/store/authStore";
import { authapi } from "@/api";
import { redirect, LoaderFunctionArgs } from "react-router";
import {
  categoryAndTypeQuery,
  onePostQuery,
  oneProductQuery,
  postInfiniteQuery,
  postQuery,
  productInfiniteQuery,
  productQuery,
  queryClient,
} from "@/api/query";

export const homeLoader = async () => {
  // try {
  //   // const products = await api.get("user/products?limit=8");
  //   // const posts = await api.get("/user/posts/infinite");
  //   const [products, posts] = await Promise.all([
  //     api.get("user/products?limit=8"),
  //     api.get("user/posts/infinite?limit=3"),
  //   ]);
  //   return { productData: products.data, postData: posts.data };
  // } catch (error) {
  //   console.log("Home loader error :", error);
  await queryClient.ensureQueryData(productQuery("?limit=8"));
  await queryClient.ensureQueryData(postQuery("?limit=3"));
};
// }
export const loginLoader = async () => {
  try {
    const response = await authapi.get("auth-check");
    if (response.status !== 200) {
      return null;
    }
    return redirect("/");
  } catch (error) {
    console.log("Loader error :", error);
  }
};

export const otpLoader = async () => {
  const authStore = useAuthStore.getState();
  // console.log(authStore);
  if (authStore.status !== Status.otp) {
    return redirect("/register");
  }
  return null;
};

export const verifyOtpLoader = async () => {
  const authStore = useAuthStore.getState();
  if (authStore.status !== Status.verifyOtp) {
    return redirect("/forgotPassword");
  }
};

export const confirmLoader = async () => {
  const authStore = useAuthStore.getState();
  if (authStore.status !== Status.confirm) {
    return redirect("/register");
  }
  return null;
};

export const resetConfirmLoader = async () => {
  const authStore = useAuthStore.getState();
  if (authStore.status !== Status.confirmForForgotPassword) {
    return redirect("/forgotPassword");
  }
  return null;
};
export const postsInfiniteLoader = async () => {
  await queryClient.ensureInfiniteQueryData(postInfiniteQuery());
  return null;
};

export const postLoader = async ({ params }: LoaderFunctionArgs) => {
  if (!params.postId) {
    throw new Error("No PostId Provided.");
  }
  await queryClient.ensureQueryData(postQuery("?limit=6"));
  await queryClient.ensureQueryData(onePostQuery(Number(params?.postId)));
  return { postId: params.postId };
};

export const productsInfiniteLoader = async () => {
  await queryClient.ensureQueryData(categoryAndTypeQuery());
  await queryClient.ensureInfiniteQueryData(productInfiniteQuery());
};

export const productLoader = async ({ params }: LoaderFunctionArgs) => {
  if (!params.productId) {
    throw new Error("No ProductId Provided.");
  }
  await queryClient.ensureQueryData(productQuery("?limit=3"));
  await queryClient.ensureQueryData(oneProductQuery(Number(params?.productId)));
  return { productId: params.productId };
};
