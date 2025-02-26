
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

export const IdeasTable = ({ 
  ideas,
  isLoading,
  filterStatus,
  setFilterStatus,
  onDelete
}: IdeasTableProps) => {
  const calculateRemainingTime = (discussionPeriod: string | null) => {
    if (!discussionPeriod) return "لم يتم تحديد مدة";
    
    try {
      const days = parseInt(discussionPeriod.split(' ')[0]);
      if (isNaN(days)) return "تنسيق غير صحيح";

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      
      if (diffTime <= 0) {
        return "انتهت المناقشة";
      }

      const remainingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const remainingHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (remainingDays > 0) {
        return `${remainingDays} يوم و ${remainingHours} ساعة`;
      } else if (remainingHours > 0) {
        return `${remainingHours} ساعة`;
      } else {
        return "أقل من ساعة";
      }
    } catch (error) {
      console.error('Error calculating remaining time:', error);
      return "خطأ في الحساب";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'draft':
        return 'مسودة';
      case 'under_review':
        return 'قيد المراجعة';
      case 'approved':
        return 'تمت الموافقة';
      case 'rejected':
        return 'مرفوضة';
      default:
        return 'مؤرشفة';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow>
              <TableHead className="text-center font-bold text-lg py-4 text-primary">
                عنوان الفكرة
              </TableHead>
              <TableHead className="text-center font-bold text-lg py-4 text-primary">
                المنشئ
              </TableHead>
              <TableHead className="text-center font-bold text-lg py-4 text-primary">
                تاريخ الإنشاء
              </TableHead>
              <TableHead className="text-center font-bold text-lg py-4 text-primary">
                الوقت المتبقي للمناقشة
              </TableHead>
              <TableHead className="text-center font-bold text-lg py-4 text-primary">
                الحالة
              </TableHead>
              <TableHead className="text-center font-bold text-lg py-4 text-primary">
                الإجراءات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : !ideas?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
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
                  className="hover:bg-muted/50"
                >
                  <TableCell className="text-center">
                    <Link 
                      to={`/ideas/${idea.id}`}
                      className="font-medium text-primary hover:underline block w-full h-full"
                    >
                      {idea.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">{idea.creator_email}</TableCell>
                  <TableCell className="text-center">
                    {new Date(idea.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    {calculateRemainingTime(idea.discussion_period)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(idea.status)}`}>
                      {getStatusDisplay(idea.status)}
                    </span>
                  </TableCell>
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
