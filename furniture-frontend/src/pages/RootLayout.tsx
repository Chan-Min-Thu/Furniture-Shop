import { Outlet } from "react-router";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import { userQuery } from "@/api/query";
import { useQuery } from "@tanstack/react-query";
function RootLayout() {
  const { data: user, isLoading } = useQuery(userQuery());
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }
  // const user = null;
  console.log("User in RootLayout:", user);
  return (
    <div className="flex min-h-screen flex-col overflow-hidden md:mx-4">
      <Header user={user} />
      <main className="mt-16 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default RootLayout;
