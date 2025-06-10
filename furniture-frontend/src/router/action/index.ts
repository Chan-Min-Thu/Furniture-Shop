import { ActionFunctionArgs, redirect } from "react-router";
import api, { authapi } from "@/api";
import { AxiosError } from "axios";
import useAuthStore, { Status } from "@/store/authStore";
import { queryClient } from "@/api/query";

export const loginAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const authData = Object.fromEntries(formData);
  // const authData = {
  //   phone: formData.get("phone"),
  //   password: formData.get("password"),
  // };

  try {
    const response = await authapi.post("login?lng=en", authData);
    // const response = await fetch(import.meta.env.VITE_BASE_URL + "/login", {
    //   method: "POST",
    //   headers: {
    //     "content-type": "application/json",
    //   },
    //   body: JSON.stringify(authData),
    //   credentials: "include",
    // });
    if (response.status !== 200) {
      return { error: response.data || "Login Failed !" };
    }
    const redirectTo = new URL(request.url).searchParams.get("redirect") || "/";
    return redirect(redirectTo);
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data || { error: "Login Failed !" };
    } else throw error;
  }
};

export const logoutAction = async () => {
  try {
    await api.post("logout");
    return redirect("/login");
  } catch (error) {
    console.log("Logout Failed :", error);
  }
};

// Sign Up Actions
export const registerAction = async ({ request }: ActionFunctionArgs) => {
  const authStore = useAuthStore.getState();
  const formData = await request.formData();
  const credentials = Object.fromEntries(formData);
  try {
    const response = await authapi.post("register", credentials);
    if (response.status !== 200) {
      return { error: response.data || "Sending OTP Failed !" };
    }

    //Client State Management
    authStore.setAuth(response.data?.phone, response.data.token, Status.otp);

    return redirect("/register/otp");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data || { error: "Sending OTP Failed !" };
    } else throw error;
  }
};

export const otpAction = async ({ request }: ActionFunctionArgs) => {
  const authStore = useAuthStore.getState();
  const formData = await request.formData();
  const credentials = {
    phone: authStore.phone,
    token: authStore.token,
    otp: formData.get("otp"),
  };
  try {
    const response = await authapi.post("verifyOtp", credentials);
    console.log("action", response);
    if (response.status !== 200) {
      return { error: response?.data || "Verifing OTP Failed." };
    }
    authStore.setAuth(response.data.phone, response.data.token, Status.confirm);
    return redirect("/register/confirmPassword");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data || { error: "Verifing OTP Failed !" };
    } else throw error;
  }
};

export const confirmAction = async ({ request }: ActionFunctionArgs) => {
  const authStore = useAuthStore.getState();
  console.log(authStore);
  const formData = await request.formData();
  const credentials = {
    phone: authStore.phone,
    token: authStore.token,
    password: formData.get("password"),
  };
  try {
    console.log(credentials);
    const response = await authapi.post("confirmPassword", credentials);
    if (response.status !== 201) {
      return { error: response?.data || "Registration Failed." };
    }
    authStore.clearAuth();
    return redirect("/");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data || { error: "Registration Failed !" };
    } else throw error;
  }
};

// Favourite Action
export const favouriteAction = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  if (!params.productId) {
    throw new Error("No PostId Provided.");
  }
  const formData = await request.formData();
  const data = {
    id: Number(params.productId),
    favourite: formData.get("favourite") === "true",
  };
  try {
    const response = await authapi.patch("user/products/toggleFavourite", data);
    if (response.status !== 200) {
      return { error: response?.data || "Setting favourite failed." };
    }
    await queryClient.invalidateQueries({
      queryKey: ["products", "detail", params.productId],
    });
    return null;
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data || { error: "Registration Failed !" };
    } else throw error;
  }
};

//Forgot Password Action

export const ForgotPasswordAction = async ({ request }: ActionFunctionArgs) => {
  const authStore = useAuthStore.getState();
  const formData = await request.formData();
  const credentials = Object.fromEntries(formData);
  try {
    const response = await authapi.post("forgotPassword", credentials);
    console.log(response.data);
    if (response.status !== 200) {
      return { error: response.data || "Sending OTP Failed !" };
    }

    //Client State Management
    authStore.setAuth(
      response.data?.phone,
      response.data.token,
      Status.verifyOtp,
    );

    return redirect("/forgotPassword/verifyOtp");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data || { error: "Sending OTP Failed !" };
    } else throw error;
  }
};

export const VerifyOtpAction = async ({ request }: ActionFunctionArgs) => {
  const authStore = useAuthStore.getState();
  const formData = await request.formData();
  const credentials = {
    phone: authStore.phone,
    token: authStore.token,
    otp: formData.get("otp"),
  };
  try {
    const response = await authapi.post("verifyOtpForgotPassword", credentials);
    console.log("action", response);
    if (response.status !== 200) {
      return { error: response?.data || "Verifing OTP Failed." };
    }
    authStore.setAuth(
      response.data.phone,
      response.data.token,
      Status.confirmForForgotPassword,
    );
    return redirect("/forgotPassword/resetConfirmPassword");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data || { error: "Verify OTP failed" };
    } else throw error;
  }
};

export const resetConfirmAction = async ({ request }: ActionFunctionArgs) => {
  const authStore = useAuthStore.getState();
  const formData = await request.formData();
  const credentials = {
    phone: authStore.phone,
    token: authStore.token,
    password: formData.get("password"),
  };
  try {
    const response = await authapi.post("resetPassword", credentials);
    if (response.status !== 201) {
      return { error: response?.data || "Reset Password Failed." };
    }
    authStore.clearAuth();
    return redirect("/");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data || { error: "Registration Failed !" };
    } else throw error;
  }
};

//ChangePassword

export const changePasswordAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const credentials = {
    oldPassword: Number(formData.get("oldPassword")),
    newPassword: Number(formData.get("newPassword")),
    newConfirmPassword: Number(formData.get("newConfirmPassword")),
  };
  try {
    const response = await authapi.patch("updatePassword", credentials);
    if (response.status !== 200) {
      return { error: response?.data || "Change Password Failed." };
    }
    return redirect("/");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data || { error: "Change Password Failed !" };
    } else throw error;
  }
};

//Update Profile Action

export const updateProfileAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  try {
    const response = await authapi.patch(
      "/user/profile/upload/optimize",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    if (response.status !== 200) {
      return { error: response?.data || "Update Profile Failed." };
    }
    // Invalidate the user query to refresh the profile data
    await queryClient.invalidateQueries({ queryKey: ["user"] });
    return redirect("/");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data || { error: "Update Profile Failed !" };
    } else throw error;
  }
};
