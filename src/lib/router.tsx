import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";
import AdminLogin from "../pages/AdminLogin";
import AdminPanel from "../pages/AdminPanel";
import AdminPanelMusic from "../pages/AdminPanelMusic";
import Film from "../pages/Film";
import Music from "../pages/Music";

// Root route with layout
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Layout route with navbar for main app
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: () => (
    <div className="min-h-full grid grid-rows-[auto_1fr] bg-secondary">
      <Navbar />
      <main className="bg-secondary">
        <div className=" bg-secondary p-4">
          <Outlet />
        </div>
      </main>
    </div>
  ),
});

// Music route (root page)
const musicRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: Music,
});

// Film route
const filmRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/film",
  component: Film,
});

// Admin panel route (with navbar)
const adminPanelRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/admin-panel",
  component: AdminPanel,
});

// Admin panel music route (with navbar)
const adminPanelMusicRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/admin-panel/music",
  component: AdminPanelMusic,
});

// Admin login route (no navbar)
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-login",
  component: AdminLogin,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    musicRoute,
    filmRoute,
    adminPanelRoute,
    adminPanelMusicRoute,
  ]),
  adminLoginRoute,
]);

// Create and export the router
export const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
