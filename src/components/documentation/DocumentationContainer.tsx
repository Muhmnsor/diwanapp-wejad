
import { useLocation } from "react-router-dom";
import { TabsContent } from "@/components/ui/tabs";
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
      <TabsContent value="overview" className={activeTab === 'overview' ? 'block' : 'hidden'}>
        <SystemOverview />
      </TabsContent>
      
      <TabsContent value="components" className={activeTab === 'components' ? 'block' : 'hidden'}>
        <ComponentsDocumentation />
      </TabsContent>
      
      <TabsContent value="database" className={activeTab === 'database' ? 'block' : 'hidden'}>
        <DatabaseDocumentation />
      </TabsContent>
      
      <TabsContent value="ui" className={activeTab === 'ui' ? 'block' : 'hidden'}>
        <UIDocumentation />
      </TabsContent>
      
      <TabsContent value="technical" className={activeTab === 'technical' ? 'block' : 'hidden'}>
        <TechnicalDocumentation />
      </TabsContent>
    </div>
  );
};
