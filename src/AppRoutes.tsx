
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
import UpdateProfile from "./pages/UpdateProfile";
import { EventNotFound } from "./components/events/EventNotFound";
import HR from "./pages/HR";
import Accounting from "./pages/Accounting";
import InternalMail from "./pages/InternalMail";

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [showDevTools, setShowDevTools] = useState(false);
  
  useEffect(() => {
    const checkDeveloperStatus = async () => {
      if (isAuthenticated && user) {
        const hasDeveloperRole = await isDeveloper(user.id);
        setShowDevTools(hasDeveloperRole);
        
        console.log('Developer tools visibility:', { 
          show: hasDeveloperRole, 
          userId: user.id, 
          email: user.email,
          role: user.role,
          hasDeveloperRole
        });
      } else {
        setShowDevTools(false);
      }
    };
    
    checkDeveloperStatus();
  }, [isAuthenticated, user]);
  
  console.log('AppRoutes - Current auth state:', { 
    isAuthenticated, 
    userEmail: user?.email,
    userRole: user?.role 
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
        <Route path="/admin/hr" element={<HR />} />
        <Route path="/admin/accounting" element={<Accounting />} />
        <Route path="/admin/internal-mail" element={<InternalMail />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        {/* Add a catchall route that will display the EventNotFound component */}
        <Route path="*" element={<EventNotFound />} />
      </Routes>
      
      {showDevTools && <DeveloperToolbar />}
    </>
  );
};

export default AppRoutes;
