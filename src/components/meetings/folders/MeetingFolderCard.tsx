
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { MeetingFolder } from "@/types/meetingFolders";
import { getFolderIcon } from "./folderIcons";

interface MeetingFolderCardProps {
  folder: MeetingFolder;
  meetingsCount: number;
  isCountLoading: boolean;
  onClick: () => void;
}

export const MeetingFolderCard = ({ 
  folder, 
  meetingsCount, 
  isCountLoading,
  onClick 
}: MeetingFolderCardProps) => {
  const IconComponent = getFolderIcon(folder.type, folder.icon);
  
  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">{folder.name}</CardTitle>
          </div>
          
          <Badge variant="outline" className="font-normal">
            {isCountLoading ? (
              <Loader2 className="h-3 w-3 animate-spin ml-1" />
            ) : (
              <span>{meetingsCount} اجتماع</span>
            )}
          </Badge>
        </div>
      </CardHeader>
      
      {folder.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {folder.description}
          </p>
        </CardContent>
      )}
      
      <CardFooter className="bg-muted/10 text-xs text-muted-foreground py-2">
        آخر تحديث: {new Date(folder.updated_at).toLocaleDateString('ar-SA')}
      </CardFooter>
    </Card>
  );
};
