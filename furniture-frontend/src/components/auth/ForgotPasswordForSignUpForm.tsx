import { Link, useSubmit, useNavigation, useActionData } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icons } from "../Icon";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  phone: z
    .string()
    .min(7, "Phone number is too short.")
    .max(12, "Phone number is too long.")
    .regex(/^\d+$/, "Phone number must be number."),
});

const ForgotPasswordForSignUpForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) => {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData() as {
    error?: string;
    message?: string;
  };
  const isSubmitting = navigation?.state === "submitting";
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    //Call Api
    submit(values, { method: "post", action: "." });
    // "." meaning refer self route.
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <Link to="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <Icons.logo className="mr-2 size-6" />
            </div>
            <span className="sr-only">Furniture Shop.</span>
          </Link>
          <h1 className="text-xl font-bold">Reset To Your Password.</h1>
          <div className="text-center text-sm">
            Do You Remember Your Password?{" "}
            <Link to="/logIn" className="underline underline-offset-4">
              Sign In
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            {/* <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="09777888999" required /> */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                autoComplete="off"
              >
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          // defaultValue={"09794834517"}
                          placeholder="+9597********"
                          inputMode="numeric"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {actionData && (
                  <p className="text-red-500">{actionData.message}</p>
                )}
                <div>
                  <Button type="submit" className="mt-6 w-full">
                    {isSubmitting ? <Loader2 /> : "Reset"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our{" "}
        <Link to="#">Terms of Service</Link>
        and <Link to="#">Privacy Policy</Link>.
      </div>
    </div>
  );
};

export default ForgotPasswordForSignUpForm;
