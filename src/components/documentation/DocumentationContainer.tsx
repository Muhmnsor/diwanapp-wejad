
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComponentsDocumentation } from "./sections/ComponentsDocumentation";
import { DatabaseDocumentation } from "./sections/DatabaseDocumentation";
import { UIDocumentation } from "./sections/UIDocumentation";
import { TechnicalDocumentation } from "./sections/TechnicalDocumentation";
import { SystemOverview } from "./sections/SystemOverview";

export const DocumentationContainer = () => {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="w-full justify-stretch bg-secondary/50">
        <TabsTrigger value="overview" className="flex-1">نظرة عامة</TabsTrigger>
        <TabsTrigger value="components" className="flex-1">المكونات الرئيسية</TabsTrigger>
        <TabsTrigger value="database" className="flex-1">قاعدة البيانات</TabsTrigger>
        <TabsTrigger value="ui" className="flex-1">واجهة المستخدم</TabsTrigger>
        <TabsTrigger value="technical" className="flex-1">المعلومات التقنية</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <SystemOverview />
      </TabsContent>
      
      <TabsContent value="components">
        <ComponentsDocumentation />
      </TabsContent>
      
      <TabsContent value="database">
        <DatabaseDocumentation />
      </TabsContent>
      
      <TabsContent value="ui">
        <UIDocumentation />
      </TabsContent>
      
      <TabsContent value="technical">
        <TechnicalDocumentation />
      </TabsContent>
    </Tabs>
  );
};
