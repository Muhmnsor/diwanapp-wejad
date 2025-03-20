
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";

interface MeetingFolder {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator: {
    display_name: string;
  } | null;
  _count: {
    meetings: number;
    members: number;
  };
}

interface MeetingFolderCardProps {
  folder: MeetingFolder;
  onEdit?: (folder: MeetingFolder) => void;
  onDelete?: (folder: MeetingFolder) => void;
  onManageMembers?: (folder: MeetingFolder) => void;
}

export const MeetingFolderCard: React.FC<MeetingFolderCardProps> = ({
  folder,
  onEdit,
  onDelete,
  onManageMembers
}) => {
  const { name, description, creator, _count, created_at } = folder;
  const createdDate = new Date(created_at).toLocaleDateString('ar-SA');
  const creatorName = creator?.display_name || 'مستخدم غير معروف';
  
  // Get a color based on the first letter of the folder name
  const getFolderColor = (name: string) => {
    const colors = [
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-green-100 text-green-700 border-green-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-rose-100 text-rose-700 border-rose-200',
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-cyan-100 text-cyan-700 border-cyan-200',
    ];
    
    // Get the first character's code and use it to select a color
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };
  
  const folderColor = getFolderColor(name);

  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-md ${folderColor}`}>
            <Folder className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg line-clamp-1">{name}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
          {description || 'لا يوجد وصف لهذا التصنيف'}
        </p>
        
        <div className="mt-4 flex gap-3">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4 text-primary/70" />
                <span>{_count.meetings}</span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-fit p-2">
              <span className="text-xs">عدد الاجتماعات: {_count.meetings}</span>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Users className="h-4 w-4 text-primary/70" />
                <span>{_count.members}</span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-fit p-2">
              <span className="text-xs">عدد الأعضاء: {_count.members}</span>
            </HoverCardContent>
          </HoverCard>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Badge variant="outline" className="h-5 px-2 text-xs">
                  {creatorName}
                </Badge>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-fit p-2">
              <span className="text-xs">تم الإنشاء بواسطة: {creatorName}</span>
              <br />
              <span className="text-xs">تاريخ الإنشاء: {createdDate}</span>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 pb-3">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => onManageMembers?.(folder)}
        >
          <Users className="h-3 w-3 mr-1" />
          الأعضاء
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onEdit?.(folder)}
          >
            تعديل
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => onDelete?.(folder)}
          >
            حذف
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
