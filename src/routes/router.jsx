import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import RouteErrorBoundary from "./RouteErrorBoundary";
import { getEnabledAdminModules } from "../config/adminModules";
import { AdminProtectedRoute } from "../components/admin/common";

const lazyPage = (loader) => async () => ({
  Component: (await loader()).default,
});

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        lazy: lazyPage(() => import("../pages/Home")),
      },
      {
        path: "details",
        lazy: lazyPage(() => import("../pages/Details")),
      },
      {
        path: "rsvp",
        lazy: lazyPage(() => import("../pages/Rsvp")),
      },
      {
        path: "rsvp/create",
        lazy: lazyPage(() => import("../pages/RsvpCreate")),
      },
      {
        path: "rsvp/edit",
        lazy: lazyPage(() => import("../pages/RsvpEdit")),
      },
      {
        path: "admin",
        lazy: lazyPage(() => import("../pages/Admin")),
      },
      {
        element: <AdminProtectedRoute />,
        children: getEnabledAdminModules().map((module) => ({
          path: `admin/${module.path}`,
          lazy: lazyPage(module.load),
        })),
      },
    ],
  },
]);
