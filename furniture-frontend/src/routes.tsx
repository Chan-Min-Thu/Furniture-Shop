import { lazy, Suspense } from "react";
import { createBrowserRouter, redirect } from "react-router";
import Home from "@/pages/Home";
import RootLayout from "@/pages/RootLayout";
// import Blogs from "@/pages/blogs/Blogs";
const BlogsRootLayout = lazy(() => import("@/pages/blogs/BlogsRootLayout"));
const Blogs = lazy(() => import("@/pages/blogs/Blogs"));
const BlogsDetail = lazy(() => import("@/pages/blogs/BlogsDetail"));
// import BlogsDetail from "@/pages/blogs/BlogsDetail";
// import BlogsRootLayout from ;
import Products from "@/pages/products/Products";
import Error from "@/pages/Error";
import About from "@/pages/About";
import Service from "@/pages/Service";

import ProductsRootLayout from "@/pages/products/ProductsRootLayout";
import ProductDetail from "@/pages/products/ProductDetail";
import Login from "./pages/auth/Login";
import {
  postsInfiniteLoader,
  confirmLoader,
  // homeLoader,
  postLoader,
  loginLoader,
  otpLoader,
  productsInfiniteLoader,
  productLoader,
  verifyOtpLoader,
  resetConfirmLoader,
} from "./router/loader";
import {
  changePasswordAction,
  confirmAction,
  ForgotPasswordAction,
  // with React routerI
  // favouriteAction,
  loginAction,
  logoutAction,
  otpAction,
  registerAction,
  resetConfirmAction,
  VerifyOtpAction,
} from "./router/action";
import RegisterLayout from "@/pages/auth/RegisterLayout";
import ForgotPasswordLayout from "@/pages/auth/ForgotPasswordLayout";
import SignUpForm from "@/pages/auth/SignUp";
import OTPPage from "@/pages/auth/Otp";
import ConfirmPassword from "@/pages/auth/ConfirmPassword";
import ForgotPasswordForSignUp from "./pages/auth/ForgotPasswordForSignUp";
import VerifyOtp from "./pages/auth/VerifyOtp";
// import ConfirmPasswordForForgotPasswordForm from "./components/auth/ConfirmPasswordForForgotPasswordForm";
import ResetConfirmPassword from "./pages/auth/ResetConfirmPassword";
import ChangePassword from "./pages/auth/ChangePassword";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
        // loader: homeLoader,
      },
      {
        path: "blogs",
        element: (
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <BlogsRootLayout />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense
                fallback={<div className="text-center">Loading...</div>}
              >
                <Blogs />
              </Suspense>
            ),
            loader: postsInfiniteLoader,
          },
          {
            path: ":postId",
            element: (
              <Suspense
                fallback={<div className="text-center">Loading...</div>}
              >
                <BlogsDetail />
              </Suspense>
            ),
            loader: postLoader,
          },
        ],
      },
      {
        path: "products",
        element: <ProductsRootLayout />,
        children: [
          {
            index: true,
            element: <Products />,
            loader: productsInfiniteLoader,
          },
          {
            path: ":productId",
            element: <ProductDetail />,
            loader: productLoader,
            // with React router
            // action: favouriteAction,
          },
        ],
      },
      { path: "about", element: <About /> },
      { path: "services", element: <Service /> },
      {
        path: "changePassword",
        element: <ChangePassword />,
        action: changePasswordAction,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
    loader: loginLoader,
    action: loginAction,
  },
  {
    path: "/register",
    element: <RegisterLayout />,
    children: [
      {
        index: true,
        element: <SignUpForm />,
        loader: loginLoader,
        action: registerAction,
      },
      {
        path: "otp",
        element: <OTPPage />,
        loader: otpLoader,
        action: otpAction,
      },
      {
        path: "confirmPassword",
        element: <ConfirmPassword />,
        loader: confirmLoader,
        action: confirmAction,
      },
    ],
  },
  {
    path: "/forgotPassword",
    element: <ForgotPasswordLayout />,
    children: [
      {
        index: true,
        element: <ForgotPasswordForSignUp />,
        // loader: loginLoader,
        action: ForgotPasswordAction,
      },
      {
        path: "verifyOtp",
        element: <VerifyOtp />,
        loader: verifyOtpLoader,
        action: VerifyOtpAction,
      },
      {
        path: "resetConfirmPassword",
        element: <ResetConfirmPassword />,
        loader: resetConfirmLoader,
        action: resetConfirmAction,
      },
    ],
  },
  {
    path: "/logout",
    action: logoutAction,
    loader: () => redirect("/"),
  },
]);
