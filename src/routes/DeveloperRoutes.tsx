
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
