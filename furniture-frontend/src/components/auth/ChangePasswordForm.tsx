import { Loader2 } from "lucide-react";
import {
  Link,
  useActionData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "react-router";
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
import { useState } from "react";

const formSchema = z.object({
  oldPassword: z
    .string()
    .min(8, "Password must be 8 digits.")
    .max(8, "Password must be 8 digits.")
    .regex(/^\d+$/, "Password must be number."),
  newPassword: z
    .string()
    .min(8, "New Password must be 8 digits")
    .max(8, "New Password must be 8 digits.")
    .regex(/^\d+$/, "Password must be number."),
  newConfirmPassword: z
    .string()
    .min(8, "Comfirm Password must be 8 digits")
    .max(8, "Confirm Password must be 8 digits.")
    .regex(/^\d+$/, "Password must be number."),
});
const ChangePasswordForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  const navigate = useNavigate();
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
      oldPassword: "",
      newPassword: "",
      newConfirmPassword: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.newPassword !== values.newConfirmPassword) {
      setClientError("Password do not match.");
      return;
    }
    setClientError(null);
    console.log(values);
    //Call Api
    submit(values, { method: "patch", action: "." });
    // "." meaning refer self route.
  }
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              autoComplete="off"
            >
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Old Password</FormLabel>
                    <FormControl>
                      <PasswordInput inputMode="numeric" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <PasswordInput inputMode="numeric" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newConfirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput inputMode="numeric" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {clientError && <p className="text-red-500">{clientError}</p>}
              {actionData && (
                <div className="flex gap-2">
                  <p className="text-red-500">{actionData.message}</p>
                  <Link to="/" className="text-sm underline underline-offset-4">
                    Go Back To Home
                  </Link>
                </div>
              )}
              <div className="flex flex-row justify-between gap-2">
                <Button type="button" onClick={() => navigate(-1)}>
                  Cancle
                </Button>
                <Button type="submit" className="">
                  {isSubmitting ? <Loader2 /> : "Change Password"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
