import { Link } from "react-router";
import LoginForm from "@/components/auth/LoginForm";
import { Icons } from "@/components/Icon";
import home from "@/data/images/house.webp";

function Login() {
  return (
    <div className="relative">
      <Link
        to={"#"}
        className="-tracking-colors fixed left-6 top-6 flex items-center text-center text-lg font-bold tracking-tight text-foreground/80 hover:text-foreground"
      >
        <Icons.home className="mr-2 size-6" />
        <h2 className="text-">Furniture Shop</h2>
      </Link>
      <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="flex w-full items-center justify-center px-4 lg:px-0">
          <LoginForm />
        </div>
        <div className="relative hidden lg:block">
          <img
            src={home}
            alt="Home logo"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </main>
    </div>
  );
}

export default Login;
