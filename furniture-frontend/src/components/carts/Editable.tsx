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
import { Input } from "@/components/ui/input";
import { Icons } from "../Icon";
// import { toast } from "sonner";

const quantitySchema = z.object({
  quantity: z
    .string()
    .min(1, "Quantity must not be empty.") // minimun length of 1
    .max(4, "Too many!Is it real?") // maximum length of 4
    .regex(/^\d+$/, "Must be a number"),
});

interface EditProps {
  onUpdate: (quantity: number) => void;
  onDelete: () => void;
  quantity: number;
}

export default function Editable({ onUpdate, onDelete, quantity }: EditProps) {
  // const [loading, setLoading] = useState(false);
  // 1. Define your form.
  const form = useForm<z.infer<typeof quantitySchema>>({
    resolver: zodResolver(quantitySchema),
    defaultValues: {
      quantity: quantity.toString(),
    },
  });
  const { setValue, watch } = form;
  const currentQuantity = Number(watch("quantity"));

  const handleDecrease = () => {
    const updateQuantity = Math.max(currentQuantity - 1, 0);
    setValue("quantity", updateQuantity.toString(), { shouldValidate: true });
    onUpdate(updateQuantity);
  };

  const handleIncrease = () => {
    const updateQuantity = Math.min(currentQuantity + 1, 9999);
    setValue("quantity", updateQuantity.toString(), { shouldValidate: true });
    onUpdate(updateQuantity);
  };

  // console.log(loading);
  // 2. Define a submit handler.
  // function onSubmit(values: z.infer<typeof quantitySchema>) {
  //   // Do something with the form values.
  //   // ✅ This will be type-safe and validated.I
  //   setLoading(true);
  //   toast.success("Product is added to cart successfully.");
  // }

  return (
    <Form {...form}>
      <form
        // onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center justify-between"
      >
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 shrink-0 rounded-r-none"
            onClick={handleDecrease}
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
                    type="number"
                    inputMode="numeric"
                    min={0}
                    {...field}
                    className="&::-webkit-outer-spin-button]:appearance-none h-8 w-16 rounded-none border-x-0 text-center [appearance:textfield] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none"
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
            className="size-8 shrink-0 rounded-l-none"
          >
            <Icons.plus className="size-3" aria-hidden="true" />
            <span className="sr-only">Add one item</span>
          </Button>
        </div>
        <Button
          type="button"
          aria-label="Delete cart"
          variant="outline"
          className="size-8 font-semibold"
          size="icon"
          onClick={onDelete}
        >
          <Icons.trash className="size-3" aria-hidden="true" />
          <span className="sr-only">Trash Icon</span>
        </Button>
      </form>
    </Form>
  );
}
