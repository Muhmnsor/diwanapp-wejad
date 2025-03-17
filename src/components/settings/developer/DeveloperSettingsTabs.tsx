
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "./tabs/GeneralSettingsTab";
import { DebugTab } from "./tabs/DebugTab";
import { PermissionsTab } from "./tabs/PermissionsTab";
import { LogsTab } from "./tabs/LogsTab";
import { CacheTab } from "./tabs/CacheTab";
import { SmartCacheTab } from "./tabs/SmartCacheTab";
import { PerformanceTab } from "./tabs/PerformanceTab";
import { RoleMappingDebugTab } from "./tabs/RoleMappingDebugTab";
import { DocumentationSection } from "./documentation/DocumentationSection";
import { DeveloperSettings } from "@/types/developer";
import { DeveloperPermissionChecks } from "@/components/users/permissions/types";

interface DeveloperSettingsTabsProps {
  developerId?: string;
  settings: DeveloperSettings;
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
  settings,
  developerPermissions,
  hasDeveloperAccess,
  onToggleDeveloperRole,
  roleAssigning,
  onRefreshPermissions
}: DeveloperSettingsTabsProps) => {
  return (
    <Tabs defaultValue="general" className="w-full" dir="rtl">
      <TabsList className="mb-6 grid grid-cols-4 md:grid-cols-8 lg:grid-cols-9">
        <TabsTrigger value="general">عام</TabsTrigger>
        <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
        <TabsTrigger value="debug">التشخيص</TabsTrigger>
        <TabsTrigger value="roles">الأدوار</TabsTrigger>
        <TabsTrigger value="logs">السجلات</TabsTrigger>
        <TabsTrigger value="cache">التخزين المؤقت</TabsTrigger>
        <TabsTrigger value="smart-cache">التخزين الذكي</TabsTrigger>
        <TabsTrigger value="performance">الأداء</TabsTrigger>
        <TabsTrigger value="docs">التوثيق</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general">
        <GeneralSettingsTab settings={settings} />
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
        <DebugTab settings={settings} />
      </TabsContent>
      
      <TabsContent value="roles">
        <RoleMappingDebugTab />
      </TabsContent>
      
      <TabsContent value="logs">
        <LogsTab />
      </TabsContent>
      
      <TabsContent value="cache">
        <CacheTab settings={settings} />
      </TabsContent>
      
      <TabsContent value="smart-cache">
        <SmartCacheTab settings={settings} />
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
