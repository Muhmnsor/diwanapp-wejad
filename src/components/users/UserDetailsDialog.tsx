
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Shield, Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { User as UserType } from "./types";
import { UserActivityList } from "./UserActivityList";
import { UserPermissionsList } from "./UserPermissionsList";

interface UserDetailsDialogProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailsDialog = ({
  user,
  isOpen,
  onClose
}: UserDetailsDialogProps) => {
  const getRoleDisplayName = (roleName: string | undefined) => {
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
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right text-xl">
            تفاصيل المستخدم
          </DialogTitle>
        </DialogHeader>
        
        {user && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  معلومات المستخدم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">البريد الإلكتروني</div>
                    <div className="font-medium">{user.username}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">الدور</div>
                    <div className="font-medium">
                      <Badge variant="outline">{getRoleDisplayName(user.role)}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">آخر تسجيل دخول</div>
                    <div className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {user.lastLogin || 'لم يسجل دخول بعد'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">معرف المستخدم</div>
                    <div className="font-medium text-xs opacity-75">{user.id}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="permissions">
              <TabsList className="w-full">
                <TabsTrigger value="permissions" className="flex-1">
                  <Shield className="h-4 w-4 me-2" />
                  الصلاحيات
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex-1">
                  <Activity className="h-4 w-4 me-2" />
                  سجل النشاط
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="permissions" className="mt-4">
                <UserPermissionsList userId={user.id} role={user.role} />
              </TabsContent>
              
              <TabsContent value="activity" className="mt-4">
                <UserActivityList userId={user.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
