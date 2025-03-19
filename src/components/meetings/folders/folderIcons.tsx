
import { Users, UsersRound, Briefcase, Globe, ClipboardList, Binary, FolderArchive } from "lucide-react";

// Map folder types to icons
export const getFolderIcon = (type: string, customIcon?: string) => {
  switch (type) {
    case 'board':
      return Users;
    case 'general_assembly':
      return UsersRound;
    case 'team':
      return Briefcase;
    case 'external':
      return Globe;
    case 'executive':
      return ClipboardList;
    case 'projects':
      return Binary;
    default:
      return FolderArchive;
  }
};
