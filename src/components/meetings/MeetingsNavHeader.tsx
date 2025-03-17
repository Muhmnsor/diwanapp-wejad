
import { Link, useLocation } from "react-router-dom";
import { 
  CalendarClock, 
  ClipboardList, 
  Users, 
  FileText, 
  CheckSquare, 
  ListTodo, 
  FileUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MeetingsNavHeaderProps {
  meetingId?: string;
}

export const MeetingsNavHeader = ({ meetingId }: MeetingsNavHeaderProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="bg-background border-b mb-6 py-2 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 no-scrollbar">
          <Link
            to="/admin/meetings"
            className={cn(
              "px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors",
              isActive("/admin/meetings") 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            )}
          >
            <CalendarClock className="h-4 w-4" />
            <span>لوحة المعلومات</span>
          </Link>
          
          <Link
            to="/admin/meetings/list"
            className={cn(
              "px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors",
              isActive("/admin/meetings/list") 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            )}
          >
            <ClipboardList className="h-4 w-4" />
            <span>الاجتماعات</span>
          </Link>
          
          {meetingId && (
            <>
              <div className="text-muted-foreground px-2 py-1">|</div>
              
              <Link
                to={`/admin/meetings/${meetingId}`}
                className={cn(
                  "px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors",
                  location.pathname === `/admin/meetings/${meetingId}` && !location.pathname.includes('/participants') && !location.pathname.includes('/agenda') && !location.pathname.includes('/minutes') && !location.pathname.includes('/decisions') && !location.pathname.includes('/tasks') && !location.pathname.includes('/attachments')
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <CalendarClock className="h-4 w-4" />
                <span>تفاصيل الاجتماع</span>
              </Link>
              
              <Link
                to={`/admin/meetings/${meetingId}/participants`}
                className={cn(
                  "px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors",
                  location.pathname.includes(`/admin/meetings/${meetingId}/participants`)
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <Users className="h-4 w-4" />
                <span>المشاركون</span>
              </Link>
              
              <Link
                to={`/admin/meetings/${meetingId}/agenda`}
                className={cn(
                  "px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors",
                  location.pathname.includes(`/admin/meetings/${meetingId}/agenda`)
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <ClipboardList className="h-4 w-4" />
                <span>جدول الأعمال</span>
              </Link>
              
              <Link
                to={`/admin/meetings/${meetingId}/minutes`}
                className={cn(
                  "px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors",
                  location.pathname.includes(`/admin/meetings/${meetingId}/minutes`)
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <FileText className="h-4 w-4" />
                <span>المحاضر</span>
              </Link>
              
              <Link
                to={`/admin/meetings/${meetingId}/decisions`}
                className={cn(
                  "px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors",
                  location.pathname.includes(`/admin/meetings/${meetingId}/decisions`)
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <CheckSquare className="h-4 w-4" />
                <span>القرارات</span>
              </Link>
              
              <Link
                to={`/admin/meetings/${meetingId}/tasks`}
                className={cn(
                  "px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors",
                  location.pathname.includes(`/admin/meetings/${meetingId}/tasks`)
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <ListTodo className="h-4 w-4" />
                <span>المهام</span>
              </Link>
              
              <Link
                to={`/admin/meetings/${meetingId}/attachments`}
                className={cn(
                  "px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors",
                  location.pathname.includes(`/admin/meetings/${meetingId}/attachments`)
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <FileUp className="h-4 w-4" />
                <span>المرفقات</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
