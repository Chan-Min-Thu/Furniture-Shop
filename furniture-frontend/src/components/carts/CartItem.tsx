import React from "react";
import type { Cart } from "@/types";
import { fromatPrice } from "@/lib/utils";
import { Separator } from "../ui/separator";
import Editable from "./Editable";
import { useCartStore } from "@/store/cartStore";

interface CartProps {
  cart: Cart;
}

const imageUrl = import.meta.env.VITE_IMAGE_URL;
function CartItem({ cart }: CartProps) {
  const { updateItem, removeItem } = useCartStore();
  const updateHandler = (quantity: number) => {
    updateItem(cart.id, quantity);
  };
  const removeHandler = () => {
    removeItem(cart.id);
  };
  return (
    <div className="mt-2 space-y-3">
      <div className="flex gap-4">
        <img
          src={imageUrl + cart.image}
          alt={cart.name}
          loading="lazy"
          decoding="async"
          aria-hidde={true}
          className="w-16 object-cover"
        />
        <div className="flex flex-col">
          <span className="line-clamp-1 text-sm font-medium">{cart.name}</span>
          <span className="text-xs text-muted-foreground">
            {fromatPrice(cart.price)} x {cart.quantity} ={" "}
            {fromatPrice((cart.price * cart.quantity).toFixed(2))}
          </span>
        </div>
      </div>
      <div>
        <Editable
          onUpdate={updateHandler}
          onDelete={removeHandler}
          quantity={cart.quantity}
        />
      </div>
      <Separator className="my-2" />
    </div>
  );
}

export default CartItem;
