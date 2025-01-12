import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "@/pages/Index";
import PortfolioDetails from "@/pages/PortfolioDetails";
import PortfolioProjectDetails from "@/pages/PortfolioProjectDetails";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/portfolios/:id",
    element: <PortfolioDetails />,
  },
  {
    path: "/portfolio-workspaces/:workspaceId",
    element: <PortfolioProjectDetails />,
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;