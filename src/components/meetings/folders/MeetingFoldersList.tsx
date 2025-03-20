
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FolderKanban, MoreVertical, Pencil, Trash2, Users } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
import { EditFolderDialog } from "./EditFolderDialog";
import { FolderMembersDialog } from "./FolderMembersDialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useNavigate } from "react-router-dom";
import { useUserRoles } from "@/hooks/useUserRoles";

interface MeetingFolder {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator: {
    display_name: string;
  };
  _count: {
    meetings: number;
    members: number;
  };
}

interface MeetingFoldersListProps {
  refreshTrigger?: number;
  onSuccess?: () => void;
}

export const MeetingFoldersList = ({ refreshTrigger = 0, onSuccess }: MeetingFoldersListProps) => {
  const navigate = useNavigate();
  const { hasAdminRole } = useUserRoles();
  const [folderToEdit, setFolderToEdit] = useState<MeetingFolder | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [folderForMembers, setFolderForMembers] = useState<MeetingFolder | null>(null);

  const fetchFolders = async () => {
    // Fetch folders with proper join to profiles table for creator information
    const { data: folderData, error: folderError } = await supabase
      .from('meeting_folders')
      .select(`
        *,
        creator:profiles!meeting_folders_created_by_fkey(display_name)
      `);

    if (folderError) throw folderError;

    // For each folder, count meetings and members
    const folderIds = folderData.map(folder => folder.id);
    
    // Count meetings in each folder
    const { data: meetingCounts, error: meetingError } = await supabase
      .from('count_meetings_by_folder')
      .select('*');
    
    if (meetingError) throw meetingError;
    
    // Get meeting counts by folder
    const meetingCountMap = new Map();
    meetingCounts?.forEach(item => {
      meetingCountMap.set(item.folder_id, item.count);
    });
    
    // Count members in each folder
    const { data: memberCounts, error: memberError } = await supabase
      .from('meeting_folder_members')
      .select('folder_id')
      .in('folder_id', folderIds);
    
    if (memberError) throw memberError;
    
    // Process member counts to create a map
    const memberCountMap = new Map();
    if (memberCounts) {
      // Group by folder_id and count
      const folderMemberCounts = {};
      memberCounts.forEach(item => {
        if (!folderMemberCounts[item.folder_id]) {
          folderMemberCounts[item.folder_id] = 0;
        }
        folderMemberCounts[item.folder_id]++;
      });
      
      // Convert to map
      Object.entries(folderMemberCounts).forEach(([folderId, count]) => {
        memberCountMap.set(folderId, count);
      });
    }
    
    // Combine data
    return folderData.map(folder => ({
      ...folder,
      _count: {
        meetings: meetingCountMap.get(folder.id) || 0,
        members: memberCountMap.get(folder.id) || 0
      }
    }));
  };
  
  const { data: folders, isLoading, error } = useQuery({
    queryKey: ['meetingFolders', refreshTrigger],
    queryFn: fetchFolders
  });

  const handleViewMeetings = (folderId: string) => {
    navigate(`/admin/meetings/folder/${folderId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
        <span>جاري تحميل التصنيفات...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل تصنيفات الاجتماعات: {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!folders || folders.length === 0) {
    return (
      <EmptyState
        title="لا توجد تصنيفات"
        description="لم يتم إنشاء أي تصنيفات للاجتماعات بعد"
        icon={<FolderKanban className="h-8 w-8" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم التصنيف</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>الاجتماعات</TableHead>
              <TableHead>الأعضاء</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {folders.map((folder) => (
              <TableRow key={folder.id}>
                <TableCell className="font-medium">{folder.name}</TableCell>
                <TableCell>{folder.description || '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline">{folder._count.meetings}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{folder._count.members}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewMeetings(folder.id)}
                    >
                      عرض الاجتماعات
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setFolderForMembers(folder)}
                        >
                          <Users className="h-4 w-4 ml-2" />
                          إدارة الأعضاء
                        </DropdownMenuItem>
                        {hasAdminRole && (
                          <>
                            <DropdownMenuItem
                              onClick={() => setFolderToEdit(folder)}
                            >
                              <Pencil className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setFolderToDelete(folder.id)}
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {folderToEdit && (
        <EditFolderDialog
          open={!!folderToEdit}
          onOpenChange={(open) => {
            if (!open) setFolderToEdit(null);
          }}
          folder={folderToEdit}
          onSuccess={() => {
            if (onSuccess) onSuccess();
            setFolderToEdit(null);
          }}
        />
      )}
      
      {folderToDelete && (
        <DeleteFolderDialog
          open={!!folderToDelete}
          onOpenChange={(open) => {
            if (!open) setFolderToDelete(null);
          }}
          folderId={folderToDelete}
          onSuccess={() => {
            if (onSuccess) onSuccess();
            setFolderToDelete(null);
          }}
        />
      )}
      
      {folderForMembers && (
        <FolderMembersDialog
          open={!!folderForMembers}
          onOpenChange={(open) => {
            if (!open) setFolderForMembers(null);
          }}
          folder={folderForMembers}
          onSuccess={() => {
            if (onSuccess) onSuccess();
            setFolderForMembers(null);
          }}
        />
      )}
    </div>
  );
};
