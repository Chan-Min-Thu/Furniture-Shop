import React, { useState } from "react";
import { EyeNoneIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  return (
    <div className="relative">
      <Input
        // defaultValue={"23456789"}
        type={showPassword ? "text" : "password"}
        ref={ref}
        className={cn("pr-2", className)}
        {...props}
      />
      <Button
        type="button"
        variant={"ghost"}
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-0 top-1/2 h-full -translate-y-1/2 transform px-2 py-1 hover:bg-transparent"
        disabled={props.value === "" || props.disabled}
      >
        {showPassword ? (
          <EyeNoneIcon className="size-6" />
        ) : (
          <EyeOpenIcon className="size-6" />
        )}
      </Button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
