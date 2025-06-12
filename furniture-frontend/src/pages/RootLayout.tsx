import { Outlet } from "react-router";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import { userQuery } from "@/api/query";
import { useQuery } from "@tanstack/react-query";

function RootLayout() {
  const { data: user, isLoading } = useQuery(userQuery());

  // const user = null;
  console.log("User in RootLayout:", user);
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden md:mx-4">
      <Header user={user} isLoading={isLoading} />
      <main className="no-scroll mt-16 flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default RootLayout;
