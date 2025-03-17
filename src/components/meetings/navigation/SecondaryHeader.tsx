
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  FileText, 
  CheckSquare 
} from "lucide-react";

export const SecondaryHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the meeting ID from the URL
  const pathParts = location.pathname.split('/');
  const meetingId = pathParts[pathParts.length - 1];
  
  // Get the active tab from URL search params or default to "overview"
  const urlParams = new URLSearchParams(location.search);
  const activeTab = urlParams.get('tab') || 'overview';
  
  const handleTabChange = (value: string) => {
    navigate(`/meetings/${meetingId}?tab=${value}`);
  };
  
  return (
    <div className="w-full bg-white border-t py-3">
      <div className="flex justify-center">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="flex justify-center border-b rounded-none bg-white">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <LayoutDashboard className="h-4 w-4" />
              نظرة عامة
            </TabsTrigger>
            
            <TabsTrigger 
              value="tasks" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <ListTodo className="h-4 w-4" />
              المهام
            </TabsTrigger>
            
            <TabsTrigger 
              value="participants" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <Users className="h-4 w-4" />
              المشاركون
            </TabsTrigger>
            
            <TabsTrigger 
              value="minutes" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <FileText className="h-4 w-4" />
              المحضر
            </TabsTrigger>
            
            <TabsTrigger 
              value="decisions" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <CheckSquare className="h-4 w-4" />
              القرارات
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
