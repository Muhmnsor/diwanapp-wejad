
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/refactored-auth";
import { MainRoutes } from "./routes/MainRoutes";
import { ProtectedRoutes } from "./routes/ProtectedRoutes";
import { PortfolioRoutes } from "./routes/PortfolioRoutes";
import { TaskRoutes } from "./routes/TaskRoutes";
import { DeveloperRoutes } from "./routes/DeveloperRoutes";
import { DeveloperToolbar } from "./components/developer/DeveloperToolbar";
import { useEffect, useState } from "react";
import { isDeveloper } from "./utils/developer/roleManagement";

const AppRoutes = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [showDevTools, setShowDevTools] = useState(false);
  const [isCheckingDeveloper, setIsCheckingDeveloper] = useState(false);
  
  useEffect(() => {
    const checkDeveloperStatus = async () => {
      if (!isAuthenticated || !user || isLoading) {
        setShowDevTools(false);
        return;
      }
      
      try {
        setIsCheckingDeveloper(true);
        const hasDeveloperRole = await isDeveloper(user.id);
        setShowDevTools(hasDeveloperRole);
        
        console.log('Developer tools visibility:', { 
          show: hasDeveloperRole, 
          userId: user.id, 
          email: user.email,
          role: user.role,
          hasDeveloperRole
        });
      } catch (error) {
        console.error('Error checking developer status:', error);
        setShowDevTools(false);
      } finally {
        setIsCheckingDeveloper(false);
      }
    };
    
    checkDeveloperStatus();
  }, [isAuthenticated, user, isLoading]);
  
  console.log('AppRoutes - Current auth state:', { 
    isAuthenticated, 
    userEmail: user?.email,
    userRole: user?.role,
    isLoading,
    isCheckingDeveloper
  });

  return (
    <>
      <Routes>
        {MainRoutes}
        {ProtectedRoutes}
        {PortfolioRoutes}
        {TaskRoutes}
        {DeveloperRoutes}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {showDevTools && <DeveloperToolbar />}
    </>
  );
};

export default AppRoutes;
