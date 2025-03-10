
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ComponentsDocumentation } from "./sections/ComponentsDocumentation";
import { DatabaseDocumentation } from "./sections/DatabaseDocumentation";
import { UIDocumentation } from "./sections/UIDocumentation";
import { TechnicalDocumentation } from "./sections/TechnicalDocumentation";
import { SystemOverview } from "./sections/SystemOverview";

export const DocumentationContainer = () => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const activeTab = urlParams.get('tab') || 'overview';
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} className="w-full">
        <TabsContent value="overview" className="mt-6">
          <SystemOverview />
        </TabsContent>
        
        <TabsContent value="components" className="mt-6">
          <ComponentsDocumentation />
        </TabsContent>
        
        <TabsContent value="database" className="mt-6">
          <DatabaseDocumentation />
        </TabsContent>
        
        <TabsContent value="ui" className="mt-6">
          <UIDocumentation />
        </TabsContent>
        
        <TabsContent value="technical" className="mt-6">
          <TechnicalDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
};
