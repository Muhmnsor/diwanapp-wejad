
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Inbox, 
  Send, 
  FileEdit, 
  Trash2, 
  Star,
  Tag,
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MailSidebarProps {
  activeFolder: string;
  onFolderChange: (folder: string) => void;
  counts: {
    inbox: number;
    unread: number;
    sent: number;
    drafts: number;
    trash: number;
  };
}

export const MailSidebar: React.FC<MailSidebarProps> = ({ 
  activeFolder, 
  onFolderChange,
  counts
}) => {
  const folders = [
    { id: "inbox", label: "البريد الوارد", icon: <Inbox className="h-4 w-4 ml-2" />, count: counts.inbox, unread: counts.unread },
    { id: "sent", label: "البريد الصادر", icon: <Send className="h-4 w-4 ml-2" />, count: counts.sent },
    { id: "drafts", label: "المسودات", icon: <FileEdit className="h-4 w-4 ml-2" />, count: counts.drafts },
    { id: "trash", label: "المهملات", icon: <Trash2 className="h-4 w-4 ml-2" />, count: counts.trash },
  ];
  
  const labels = [
    { id: "important", label: "مهم", color: "bg-red-500" },
    { id: "work", label: "عمل", color: "bg-blue-500" },
    { id: "personal", label: "شخصي", color: "bg-green-500" },
    { id: "report", label: "تقارير", color: "bg-yellow-500" },
  ];

  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-6">
        <div className="space-y-2">
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant={activeFolder === folder.id ? "secondary" : "ghost"}
              className="w-full justify-start py-2 px-3 h-auto"
              onClick={() => onFolderChange(folder.id)}
            >
              <div className="flex justify-between w-full items-center">
                <div className="flex items-center">
                  {folder.icon}
                  {folder.label}
                </div>
                <div className="flex items-center gap-1">
                  {folder.id === "inbox" && folder.unread > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {folder.unread}
                    </Badge>
                  )}
                  {folder.count > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {folder.count}
                    </Badge>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>

        <div>
          <div className="flex items-center mb-2">
            <Tag className="h-4 w-4 me-2" />
            <span className="text-sm font-medium">التصنيفات</span>
          </div>
          <div className="space-y-1 pr-2">
            {labels.map((label) => (
              <div key={label.id} className="flex items-center py-1 px-2 rounded-lg hover:bg-muted cursor-pointer">
                <div className={`w-3 h-3 rounded-full ${label.color} me-2`}></div>
                <span className="text-sm">{label.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <Filter className="h-4 w-4 me-2" />
            <span className="text-sm font-medium">المرشحات</span>
          </div>
          <div className="space-y-1 pr-2">
            <div className="flex items-center py-1 px-2 rounded-lg hover:bg-muted cursor-pointer">
              <Star className="h-3 w-3 me-2 text-yellow-500" />
              <span className="text-sm">المميزة بنجمة</span>
            </div>
            <div className="flex items-center py-1 px-2 rounded-lg hover:bg-muted cursor-pointer">
              <svg className="h-3 w-3 me-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="text-sm">التنبيهات</span>
            </div>
            <div className="flex items-center py-1 px-2 rounded-lg hover:bg-muted cursor-pointer">
              <svg className="h-3 w-3 me-2 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <span className="text-sm">المرفقات</span>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
