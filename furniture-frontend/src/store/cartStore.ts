import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  carts: CartItem[];
}

interface CartActions {
  getTotalItems: () => number;
  getTotalPrice: () => number;
  addItem: (item: CartItem) => void;
  updateItem: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
}

const initialState: CartState = {
  carts: [],
};

export const useCartStore = create<CartState & CartActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      //getTotalItems
      getTotalItems: () => {
        const { carts } = get();
        return carts.reduce(
          (total: number, item: CartItem) => total + item.quantity,
          0,
        );
      },
      getTotalPrice: () => {
        const { carts } = get();
        return carts.reduce(
          (total: number, item: CartItem) => total + item.price * item.quantity,
          0,
        );
      },
      addItem: (item: CartItem) =>
        set((state: CartState) => {
          const exitingItem = state.carts.find((i) => i.id === item.id);
          if (exitingItem) {
            exitingItem.quantity = item.quantity || 1;
          } else {
            state.carts.push({ ...item, quantity: item.quantity || 1 });
          }
        }),
      updateItem: (id: number, quantity: number) =>
        set((state: CartState) => {
          const exitingItem = state.carts.find((i) => i.id === id);
          if (exitingItem) {
            exitingItem.quantity = quantity;
          }
        }),
      removeItem: (id: number) =>
        set((state: CartState) => {
          state.carts = state.carts.filter((i) => i.id !== id);
        }),
      clearCart: () => set(initialState),
    })),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
