
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DeveloperSettings } from "@/types/developer";
import { DeveloperPermissionChecks } from "@/components/users/permissions/types";
import { GeneralSettingsTab } from "./tabs/GeneralSettingsTab";
import { PermissionsTab } from "./tabs/PermissionsTab";
import { CacheTab } from "./tabs/CacheTab";
import { DebugTab } from "./tabs/DebugTab";
import { PerformanceTab } from "./tabs/PerformanceTab";
import { LogsTab } from "./tabs/LogsTab";

interface DeveloperSettingsTabsProps {
  activeTab: string;
  settings: DeveloperSettings;
  permissions: DeveloperPermissionChecks;
  onRefresh: () => Promise<void>;
  hasDeveloperAccess: boolean;
  onToggleDeveloperRole: () => Promise<void>;
  roleAssigning: boolean;
}

export const DeveloperSettingsTabs = ({
  activeTab,
  settings,
  permissions,
  onRefresh,
  hasDeveloperAccess,
  onToggleDeveloperRole,
  roleAssigning
}: DeveloperSettingsTabsProps) => {
  return (
    <Tabs value={activeTab} className="w-full">
      <TabsContent value="general">
        <GeneralSettingsTab settings={settings} />
      </TabsContent>
      
      <TabsContent value="permissions">
        <PermissionsTab 
          permissions={permissions}
          hasDeveloperAccess={hasDeveloperAccess}
          onToggleDeveloperRole={onToggleDeveloperRole}
          roleAssigning={roleAssigning}
          onRefresh={onRefresh}
        />
      </TabsContent>
      
      <TabsContent value="cache">
        <CacheTab settings={settings} />
      </TabsContent>
      
      <TabsContent value="debug">
        <DebugTab settings={settings} />
      </TabsContent>
      
      <TabsContent value="performance">
        <PerformanceTab />
      </TabsContent>
      
      <TabsContent value="logs">
        <LogsTab />
      </TabsContent>
    </Tabs>
  );
};
