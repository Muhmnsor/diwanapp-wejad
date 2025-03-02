
import { Role } from "../types";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabsNavigationProps {
  selectedRoleId: string | null;
}

export const TabsNavigation = ({ selectedRoleId }: TabsNavigationProps) => {
  return (
    <TabsList>
      <TabsTrigger value="roles">قائمة الأدوار</TabsTrigger>
      <TabsTrigger value="permissions" disabled={!selectedRoleId}>
        صلاحيات الدور
      </TabsTrigger>
    </TabsList>
  );
};
