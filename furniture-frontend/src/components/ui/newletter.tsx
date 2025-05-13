import { useState } from "react";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "../Icon";

const emailSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
});

export default function NewLetterForm() {
  const [loading, setLoading] = useState(false);
  // 1. Define your form.
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof emailSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    console.log(values);
    setLoading(true);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid w-full pr-8 lg:pr-0"
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="relative space-y-0">
              <FormLabel className="sr-only">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="eg. example@gmail.com"
                  {...field}
                  className="pr-12"
                />
              </FormControl>
              <FormMessage />
              <Button
                size="icon"
                className="absolute right-[3.5px] top-[4px] z-20 size-7"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Icons.paperPlane className="size-3" aria-hidden={true} />
                )}{" "}
                <span className="sr-only">Join news letter.</span>
              </Button>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
