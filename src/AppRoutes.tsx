
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/refactored-auth";
import { MainRoutes } from "./routes/MainRoutes";
import { ProtectedRoutes } from "./routes/ProtectedRoutes";
import { PortfolioRoutes } from "./routes/PortfolioRoutes";
import { TaskRoutes } from "./routes/TaskRoutes";

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();
  
  console.log('AppRoutes - Current auth state:', { isAuthenticated });

  return (
    <Routes>
      {MainRoutes}
      {ProtectedRoutes}
      {PortfolioRoutes}
      {TaskRoutes}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

