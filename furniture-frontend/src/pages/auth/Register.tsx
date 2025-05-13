import React from "react";
import { Link } from "react-router";
import { Icons } from "@/components/Icon";
// import RegisterForm from "@/components/auth/RegisterForm";

function Register() {
  return (
    <div className="flex min-h-screen w-full place-items-center justify-center px-4 lg:px-0">
      <Link
        to={"/"}
        className="-tracking-colors fixed left-6 top-6 flex items-center text-center text-lg font-bold tracking-tight text-foreground/80 hover:text-foreground"
      >
        <Icons.home className="mr-2 size-6" />
        <h2 className="text-">Furniture Shop</h2>
      </Link>
      {/* <RegisterForm /> */}
    </div>
  );
}

export default Register;
