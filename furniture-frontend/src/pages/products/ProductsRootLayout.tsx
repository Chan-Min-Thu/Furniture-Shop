import { Outlet } from "react-router";

function ProductsRootLayout() {
  return (
    <div className="container mx-auto mt-8 px-4">
      {/* I am the ProductsRootLayout */}
      <Outlet />
    </div>
  );
}

export default ProductsRootLayout;
