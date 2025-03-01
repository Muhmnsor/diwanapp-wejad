
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User } from "./types";
import { UserPermissionsList } from "./UserPermissionsList";
import { UserActivityList } from "./UserActivityList";
import { Separator } from "@/components/ui/separator";
import { Shield, Activity } from "lucide-react";

interface UserDetailsDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailsDialog = ({ user, isOpen, onClose }: UserDetailsDialogProps) => {
  if (!user) return null;

  const getRoleDisplayName = (roleName: string) => {
    if (!roleName || roleName === 'لم يتم تعيين دور') return 'لم يتم تعيين دور';
    
    switch (roleName) {
      case 'admin': return 'مشرف';
      case 'event_creator': return 'منشئ فعاليات';
      case 'event_executor': return 'منفذ فعاليات';
      case 'event_media': return 'إعلامي';
      default: return roleName;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            تفاصيل المستخدم
          </DialogTitle>
          <DialogDescription>
            معلومات تفصيلية عن المستخدم وصلاحياته وسجل نشاطه
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <div className="space-y-2 mb-4">
            <h3 className="text-lg font-semibold">{user.username}</h3>
            <p className="text-muted-foreground">
              الدور: {getRoleDisplayName(user.role)}
            </p>
            <p className="text-muted-foreground text-sm">
              آخر تسجيل دخول: {user.lastLogin}
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <Tabs defaultValue="permissions" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="permissions" className="flex-1">
                <Shield className="h-4 w-4 mr-2" />
                الصلاحيات
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">
                <Activity className="h-4 w-4 mr-2" />
                سجل النشاط
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="permissions" className="pt-4">
              <UserPermissionsList userId={user.id} role={user.role} />
            </TabsContent>
            
            <TabsContent value="activity" className="pt-4">
              <UserActivityList userId={user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
