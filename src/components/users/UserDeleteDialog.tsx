
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
import { User } from "./types";

interface UserDeleteDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const UserDeleteDialog = ({
  user,
  isOpen,
  onClose,
  onConfirm
}: UserDeleteDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-right">هل أنت متأكد من تعطيل هذا المستخدم؟</AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            <p>سيتم تعطيل المستخدم {user?.username} وإخفاء هويته. هذا الإجراء سيؤدي إلى:</p>
            <ul className="list-disc mr-6 mt-2 space-y-1 text-sm">
              <li>منع المستخدم من تسجيل الدخول للنظام</li>
              <li>إعادة تعيين المهام المسندة إليه إلى حالة "بحاجة لإعادة إسناد"</li>
              <li>إخفاء بيانات المستخدم الشخصية وتعليقاته</li>
              <li>حذف أدوار المستخدم وصلاحياته</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2">
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">تعطيل المستخدم</AlertDialogAction>
          <AlertDialogCancel onClick={onClose}>إلغاء</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
