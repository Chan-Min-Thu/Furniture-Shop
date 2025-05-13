import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

export enum Status {
  otp = "otp",
  verifyOtp = "verifyOtp",
  confirmForForgotPassword = "confirmForForgotPassword",
  confirm = "confirm",
  verify = "verify",
  reset = "reset",
  none = "none",
}

type State = {
  phone: string | null;
  token: string | null;
  status: Status;
};

// What include?
const initialState: State = {
  phone: null,
  token: null,
  status: Status.none,
};

// How do they work?
type Actions = {
  setAuth: (phone: string, token: string, status: Status) => void;
  clearAuth: () => void;
};

// StartWorking

const useAuthStore = create<State & Actions>()(
  persist(
    immer((set) => ({
      ...initialState,
      //setAuth
      setAuth: (phone, token, status) => {
        set((state) => {
          state.phone = phone;
          state.token = token;
          state.status = status;
        });
      },
      // clearAuth
      clearAuth: () => set(initialState),
    })),
    {
      name: "auth-credentials", //key for sessionStorate
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useAuthStore;
