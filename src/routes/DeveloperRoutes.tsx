import { Route } from "react-router-dom";
import DeveloperSettings from "@/pages/DeveloperSettings";
import Documentation from "@/pages/Documentation";
import DeveloperRoute from "@/components/DeveloperRoute";

export const DeveloperRoutes = (
  <>
    <Route 
      path="/admin/developer-settings" 
      element={
        <DeveloperRoute>
          <DeveloperSettings />
        </DeveloperRoute>
      } 
    />
    {/* Keep documentation route for backwards compatibility, 
        but it will redirect to developer-settings with tab parameter */}
    <Route 
      path="/admin/documentation" 
      element={
        <DeveloperRoute>
          <Documentation />
        </DeveloperRoute>
      } 
    />
  </>
);
