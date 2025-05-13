import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/query";
import "./index.css";
import { router } from "./routes";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "sonner";

const root = document.getElementById("root");

ReactDOM.createRoot(root!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
