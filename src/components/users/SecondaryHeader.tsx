
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50/80 to-transparent pb-0 py-0 my-0">
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList dir="rtl" className="w-full justify-start border-b rounded-none bg-white mx-0 px-0 h-12">
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
    </div>
  );
};
