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
import { useState } from "react";
import { Input } from "../ui/input";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  firstName: z
    .string()
    .regex(/^[a-zA-Z]+$/, "First Name must be string.")
    .optional(),
  lastName: z
    .string()
    .regex(/^[a-zA-Z]+$/, "Last Name must be string.")
    .optional(),
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: " File size must be less than 10MB",
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Only image files are allowed (jpeg,jpg,png,webg)",
    })
    .nullable()
    .optional(),
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
      firstName: "",
      lastName: "",
      avatar: null, // Assuming you will handle file upload separately
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    setClientError(null);
    const formData = new FormData();
    formData.append("firstName", values.firstName || "");
    formData.append("lastName", values.lastName || "");
    if (values.avatar) {
      formData.append("avatar", values.avatar);
    }
    //Call Api
    submit(formData, {
      method: "patch",
      action: "/editProfile",
      encType: "multipart/form-data",
    });
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
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo Upload</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        required
                        onChange={(e) =>
                          e.target.files?.length
                            ? field.onChange(e.target.files[0])
                            : field.onChange(null)
                        }
                        className="file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
                  {isSubmitting ? <Loader2 /> : "Update Profile"}
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
