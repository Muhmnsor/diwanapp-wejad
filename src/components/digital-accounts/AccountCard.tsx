
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff, ExternalLink, Calendar } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { AccountForm } from "./AccountForm";
import { PasswordRevealDialog } from "./PasswordRevealDialog";
import { Badge } from "@/components/ui/badge";

interface Account {
  id: string;
  platform_name: string;
  account_name: string;
  username: string;
  password?: string;
  website_url?: string;
  responsible_person?: string;
  renewal_date?: string;
  notes?: string;
  category: string;
  access_level: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
  creator?: { display_name?: string; email?: string; };
}

interface AccountCardProps {
  account: Account;
  onDelete: () => void;
  onUpdate: (updatedAccount: Account) => void;
}

export const AccountCard = ({ account, onDelete, onUpdate }: AccountCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "social": return "منصات التواصل الاجتماعي";
      case "apps": return "التطبيقات والخدمات";
      case "email": return "البريد الإلكتروني";
      case "financial": return "حسابات مالية";
      default: return "أخرى";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "social": return "bg-blue-100 text-blue-800";
      case "apps": return "bg-purple-100 text-purple-800";
      case "email": return "bg-green-100 text-green-800";
      case "financial": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "admin": return "bg-red-100 text-red-800";
      case "editor": return "bg-amber-100 text-amber-800";
      case "viewer": return "bg-green-100 text-green-800";
      case "restricted": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case "admin": return "مدير";
      case "editor": return "محرر";
      case "viewer": return "مشاهد";
      case "restricted": return "مقيد";
      default: return level;
    }
  };
  
  const hasPassword = account.password && account.password.length > 0;
  
  return (
    <>
      {showEditForm ? (
        <Card className="border shadow-md overflow-hidden">
          <CardHeader className="bg-gray-50 p-4">
            <h3 className="text-lg font-medium">تعديل الحساب</h3>
          </CardHeader>
          <CardContent className="p-4">
            <AccountForm
              accountId={account.id}
              initialData={account}
              onSuccess={() => {
                setShowEditForm(false);
                // Refresh the accounts list
                // This will be handled by the parent component
              }}
              onCancel={() => setShowEditForm(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gray-50 p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium truncate">{account.platform_name}</h3>
              <div className="flex gap-1">
                <Badge className={getCategoryColor(account.category)}>
                  {getCategoryLabel(account.category)}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-500 truncate">{account.account_name}</p>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-500">اسم المستخدم</p>
              <p className="font-medium">{account.username}</p>
            </div>
            
            {account.responsible_person && (
              <div>
                <p className="text-sm text-gray-500">المسؤول</p>
                <p>{account.responsible_person}</p>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <Badge className={getAccessLevelColor(account.access_level)}>
                {getAccessLevelLabel(account.access_level)}
              </Badge>
              
              {account.renewal_date && (
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {new Date(account.renewal_date).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              )}
            </div>
            
            {account.notes && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">ملاحظات</p>
                <p className="text-sm">{account.notes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 p-3 flex justify-between">
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEditForm(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            
            <div className="flex gap-1">
              {hasPassword && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  عرض كلمة المرور
                </Button>
              )}
              
              {account.website_url && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                >
                  <a href={account.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      )}
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف حساب {account.platform_name} - {account.account_name}؟
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {hasPassword && (
        <PasswordRevealDialog
          open={showPasswordDialog}
          onOpenChange={setShowPasswordDialog}
          accountName={`${account.platform_name} - ${account.account_name}`}
          password={account.password || ""}
        />
      )}
    </>
  );
};
