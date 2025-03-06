
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilterX, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { IdeasTableProps } from "./types";
import { calculateTimeRemaining, formatCountdown } from "./details/utils/countdownUtils";
import { getStatusClass, getStatusDisplay } from "./details/utils/statusUtils";
import { useAuthStore } from "@/store/authStore";

export const IdeasTable = ({ 
  ideas,
  isLoading,
  filterStatus,
  setFilterStatus,
  onDelete
}: IdeasTableProps) => {
  const { user } = useAuthStore();
  const isAdmin = user?.isAdmin || false;
  
  const calculateRemainingTime = (discussionPeriod: string | null, createdAt: string) => {
    if (!discussionPeriod) return "لم يتم تحديد مدة";
    
    try {
      // استخدم نفس وظيفة حساب الوقت المتبقي المستخدمة في تفاصيل الفكرة
      const timeRemaining = calculateTimeRemaining(discussionPeriod, createdAt);
      
      // إذا كانت كل القيم صفر، فقد انتهت المناقشة
      if (timeRemaining.days === 0 && 
          timeRemaining.hours === 0 && 
          timeRemaining.minutes === 0 && 
          timeRemaining.seconds === 0) {
        return "انتهت المناقشة";
      }
      
      // تنسيق الوقت المتبقي بدون عرض الثواني
      const displayParts = [];
      if (timeRemaining.days > 0) {
        displayParts.push(`${timeRemaining.days} يوم`);
      }
      if (timeRemaining.hours > 0) {
        displayParts.push(`${timeRemaining.hours} ساعة`);
      }
      if (timeRemaining.minutes > 0) {
        displayParts.push(`${timeRemaining.minutes} دقيقة`);
      }
      
      return displayParts.length > 0 ? displayParts.join(' و ') : "أقل من دقيقة";
    } catch (error) {
      console.error('Error calculating remaining time:', error);
      return "خطأ في حساب الوقت المتبقي";
    }
  };

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">عنوان الفكرة</TableHead>
              <TableHead className="text-center">المنشئ</TableHead>
              <TableHead className="text-center">تاريخ الإنشاء</TableHead>
              <TableHead className="text-center">الوقت المتبقي للمناقشة</TableHead>
              <TableHead className="text-center">الحالة</TableHead>
              {isAdmin && <TableHead className="text-center">الإجراءات</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : !ideas?.length ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8">
                  <div className="space-y-4">
                    <p className="text-gray-500">لا توجد أفكار حالياً</p>
                    {filterStatus && (
                      <Button 
                        variant="outline" 
                        onClick={() => setFilterStatus(null)}
                        className="mx-auto"
                      >
                        <FilterX className="ml-2 h-4 w-4" />
                        إزالة الفلتر
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              ideas.map((idea) => (
                <TableRow 
                  key={idea.id}
                >
                  <TableCell className="text-center font-medium">
                    <Link 
                      to={`/ideas/${idea.id}`}
                      className="text-primary hover:underline"
                    >
                      {idea.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">
                    {idea.creator_display_name || idea.creator_email || 'غير معروف'}
                  </TableCell>
                  <TableCell className="text-center">
                    {new Date(idea.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    {calculateRemainingTime(idea.discussion_period, idea.created_at)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(idea.status)}`}>
                      {getStatusDisplay(idea.status)}
                    </span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                        onClick={() => onDelete(idea)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
