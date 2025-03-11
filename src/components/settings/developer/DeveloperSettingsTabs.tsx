
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "./tabs/GeneralSettingsTab";
import { DebugTab } from "./tabs/DebugTab";
import { PermissionsTab } from "./tabs/PermissionsTab";
import { LogsTab } from "./tabs/LogsTab";
import { CacheTab } from "./tabs/CacheTab";
import { PerformanceTab } from "./tabs/PerformanceTab";
import { RoleMappingDebugTab } from "./tabs/RoleMappingDebugTab";
import { DocumentationSection } from "./documentation/DocumentationSection";

interface DeveloperSettingsTabsProps {
  developerId?: string;
  developerPermissions: {
    canAccessDeveloperTools: boolean;
    canModifySystemSettings: boolean;
    canAccessApiLogs: boolean;
  };
  hasDeveloperAccess: boolean;
  onToggleDeveloperRole: () => Promise<void>;
  roleAssigning: boolean;
  onRefreshPermissions: () => Promise<void>;
}

export const DeveloperSettingsTabs = ({
  developerId,
  developerPermissions,
  hasDeveloperAccess,
  onToggleDeveloperRole,
  roleAssigning,
  onRefreshPermissions
}: DeveloperSettingsTabsProps) => {
  return (
    <Tabs defaultValue="general" className="w-full" dir="rtl">
      <TabsList className="mb-6 grid grid-cols-4 md:grid-cols-7 lg:grid-cols-8">
        <TabsTrigger value="general">عام</TabsTrigger>
        <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
        <TabsTrigger value="debug">التشخيص</TabsTrigger>
        <TabsTrigger value="roles">الأدوار</TabsTrigger>
        <TabsTrigger value="logs">السجلات</TabsTrigger>
        <TabsTrigger value="cache">التخزين المؤقت</TabsTrigger>
        <TabsTrigger value="performance">الأداء</TabsTrigger>
        <TabsTrigger value="docs">التوثيق</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general">
        <GeneralSettingsTab developerId={developerId} />
      </TabsContent>
      
      <TabsContent value="permissions">
        <PermissionsTab 
          permissions={developerPermissions}
          hasDeveloperAccess={hasDeveloperAccess}
          onToggleDeveloperRole={onToggleDeveloperRole}
          roleAssigning={roleAssigning}
          onRefresh={onRefreshPermissions}
        />
      </TabsContent>
      
      <TabsContent value="debug">
        <DebugTab />
      </TabsContent>
      
      <TabsContent value="roles">
        <RoleMappingDebugTab />
      </TabsContent>
      
      <TabsContent value="logs">
        <LogsTab />
      </TabsContent>
      
      <TabsContent value="cache">
        <CacheTab />
      </TabsContent>
      
      <TabsContent value="performance">
        <PerformanceTab />
      </TabsContent>
      
      <TabsContent value="docs">
        <DocumentationSection />
      </TabsContent>
    </Tabs>
  );
};
