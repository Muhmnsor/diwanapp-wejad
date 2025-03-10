
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabsNavigationProps {
  selectedRoleId: string | null;
}

export const TabsNavigation = ({ selectedRoleId }: TabsNavigationProps) => {
  return (
    <TabsList className="w-full mb-4">
      <TabsTrigger value="roles" className="flex-1">
        الأدوار
      </TabsTrigger>
      <TabsTrigger 
        value="permissions" 
        className="flex-1"
        disabled={!selectedRoleId}
      >
        الصلاحيات
      </TabsTrigger>
    </TabsList>
  );
};
