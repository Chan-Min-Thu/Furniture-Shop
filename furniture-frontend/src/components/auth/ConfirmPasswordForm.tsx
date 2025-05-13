import { Loader2 } from "lucide-react";
import { Link, useActionData, useNavigation, useSubmit } from "react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import PasswordInput from "./PasswordInput";
import { Icons } from "../Icon";
import { useState } from "react";

const formSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be 8 digits.")
    .max(8, "Password must be 8 digits.")
    .regex(/^\d+$/, "Password must be number."),
  confirmPassword: z
    .string()
    .min(8, "Comfirm Password must be 8 digits")
    .max(8, "Confirm Password must be 8 digits.")
    .regex(/^\d+$/, "Password must be number."),
});
const ConfirmPasswordForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  const submit = useSubmit();
  const navigation = useNavigation();
  const [clientError, setClientError] = useState<string | null>(null);
  const actionData = useActionData() as {
    error?: string;
    message?: string;
  };
  const isSubmitting = navigation?.state === "submitting";
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.password !== values.confirmPassword) {
      setClientError("Password do not match.");
      return;
    }
    setClientError(null);
    //Call Api
    submit(values, { method: "post", action: "." });
    // "." meaning refer self route.
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <Icons.logo className="size-6" />
            </div>
            <span className="sr-only">Confirm Password.</span>
          </a>
          <h1 className="text-xl font-bold">
            Please confirm to your password.
          </h1>
          <div className="text-center text-sm">
            Password must be 8 digits long and contain only number.They must
            match.
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                autoComplete="off"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          inputMode="numeric"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          inputMode="numeric"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {clientError && <p className="text-red-500">{clientError}</p>}
                {actionData && (
                  <div className="flex gap-2">
                    <p className="text-red-500">{actionData.message}</p>
                    <Link
                      to="/register"
                      className="text-sm underline underline-offset-4"
                    >
                      Go Back To Register
                    </Link>
                  </div>
                )}
                <div>
                  <Button type="submit" className="mt-4 w-full">
                    {isSubmitting ? <Loader2 /> : "Sign Up"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPasswordForm;
