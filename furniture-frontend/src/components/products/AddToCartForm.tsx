// import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Icons } from "../Icon";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { useEffect } from "react";

const quantitySchema = z.object({
  quantity: z
    .string()
    .min(1, "Quantity must not be empty.") // minimun length of 1
    .max(4, "Too many!Is it real?") // maximum length of 4
    .regex(/^\d+$/, "Must be a number"),
});
interface canBuyNowProps {
  canBuyNow: boolean;
  onHandleCart: (quantity: number) => void;
  idInCart: number;
}

export default function AddToCartForm({
  canBuyNow,
  idInCart,
  onHandleCart,
}: canBuyNowProps) {
  // const [loading, setLoading] = useState(false);
  // 1. Define your form.
  const cartItem = useCartStore((state) =>
    state.carts.find((item) => item.id === Number(idInCart)),
  );

  const form = useForm<z.infer<typeof quantitySchema>>({
    resolver: zodResolver(quantitySchema),
    defaultValues: {
      quantity: cartItem ? cartItem.quantity.toString() : "1",
    },
  });

  const { setValue, watch } = form;
  const currentQuantity = Number(watch("quantity"));
  useEffect(() => {
    if (cartItem) {
      setValue("quantity", cartItem.quantity.toString(), {
        shouldValidate: true,
      });
    }
  }, [cartItem, setValue]);

  const handleDecrease = () => {
    const updateQuantity = Math.max(currentQuantity - 1, 0);
    setValue("quantity", updateQuantity.toString(), { shouldValidate: true });
  };

  const handleIncrease = () => {
    const updateQuantity = Math.min(currentQuantity + 1, 9999);
    setValue("quantity", updateQuantity.toString(), { shouldValidate: true });
  };
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof quantitySchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    onHandleCart(Number(values.quantity));
    // setLoading(true);
    toast.success(
      cartItem
        ? "Updated product to cart successfully."
        : "Product is added to cart successfully.",
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex max-w-[260px] flex-col gap-4"
      >
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleDecrease}
            disabled={currentQuantity <= 1}
            className="size-8 shrink-0 rounded-r-none"
          >
            <Icons.minus className="size-3" aria-hidden="true" />
            <span className="sr-only">Remove one item</span>
          </Button>
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormControl>
                  <Input
                    className="-webkit-appearance-none h-8 w-16 rounded-none border-x-0 text-center [appearance:textfiled] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleIncrease}
            disabled={currentQuantity >= 9999}
            className="size-8 shrink-0 rounded-l-none"
          >
            <Icons.plus className="size-3" aria-hidden="true" />
            <span className="sr-only">Add one item</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2.5">
          <Button
            type="button"
            aria-label="Buy now"
            size="sm"
            disabled={!canBuyNow}
            className={cn(
              "w-full bg-own font-bold",
              !canBuyNow && "bg-slate-400",
            )}
          >
            Buy Now
          </Button>
          <Button
            type="submit"
            aria-label="Add to cart"
            variant={canBuyNow ? "outline" : "default"}
            className="w-full font-semibold"
            size="sm"
          >
            {!cartItem ? "Add To Cart" : "Update Cart"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
