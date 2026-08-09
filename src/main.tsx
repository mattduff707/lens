import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { router } from "./lib/router";
import { syncUiAttributes, useUiStore } from "./store/ui";

syncUiAttributes(useUiStore.getState());
useUiStore.subscribe((state) => {
  syncUiAttributes(state);
});
useUiStore.persist.onFinishHydration((state) => {
  if (state) syncUiAttributes(state);
});

// Create a query client
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
