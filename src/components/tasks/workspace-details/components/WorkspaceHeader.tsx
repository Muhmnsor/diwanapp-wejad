
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "../../project-details/utils/taskFormatters";
import { ProjectMember } from "../../project-details/types/projectMember";

interface WorkspaceHeaderProps {
  workspace: {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    status?: string;
  };
  members: ProjectMember[];
}

export const WorkspaceHeader = ({ workspace, members }: WorkspaceHeaderProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">تفاصيل مساحة العمل</h3>
            <p className="text-sm text-gray-500 mb-4">{workspace.description || 'لا يوجد وصف'}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">تاريخ الإنشاء:</span>
                <span>{formatDate(workspace.created_at)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">الحالة:</span>
                <span>{workspace.status === 'active' ? 'نشط' : 'غير نشط'}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">أعضاء مساحة العمل</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {members.length > 0 ? (
                members.map((member) => (
                  <TooltipProvider key={member.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="cursor-pointer">
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.user_display_name || "")}&background=random`} />
                          <AvatarFallback>{member.user_display_name?.substring(0, 2) || "??"}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{member.user_display_name}</p>
                        <p className="text-xs text-gray-500">{member.user_email}</p>
                        <p className="text-xs font-medium capitalize">{member.role}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))
              ) : (
                <p className="text-sm text-gray-500">لا يوجد أعضاء</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
