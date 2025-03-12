
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Lock } from "lucide-react";

export const SecondaryHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse the active tab from URL query or default to "users"
  const urlParams = new URLSearchParams(location.search);
  const activeTab = urlParams.get('tab') || 'users';
  
  const handleTabChange = (value: string) => {
    navigate(`/admin/users-management?tab=${value}`);
  };
  
  return (
    <div className="w-full bg-white border-b py-3 mb-6">
      <div className="container mx-auto">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="flex justify-center border-b rounded-none bg-white h-12">
            <TabsTrigger 
              value="users" 
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <Users className="h-4 w-4" />
              المستخدمين
            </TabsTrigger>
            
            <TabsTrigger 
              value="roles" 
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <Shield className="h-4 w-4" />
              الأدوار
            </TabsTrigger>
            
            <TabsTrigger 
              value="permissions" 
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <Lock className="h-4 w-4" />
              الصلاحيات
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
