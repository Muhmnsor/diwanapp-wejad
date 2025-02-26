
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FilterX, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Idea } from "@/types/ideas";
import { useIdeasTableUtils } from "./hooks/useIdeasTableUtils";

interface IdeasTableProps {
  ideas: Idea[] | undefined;
  isLoading: boolean;
  filterStatus: string | null;
  onFilterClear: () => void;
  onDeleteIdea: (idea: Idea) => void;
  isDeleting: boolean;
}

export const IdeasTable = ({
  ideas,
  isLoading,
  filterStatus,
  onFilterClear,
  onDeleteIdea,
  isDeleting
}: IdeasTableProps) => {
  const { getStatusDisplay, getStatusClass, calculateRemainingTime } = useIdeasTableUtils();

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
                        onClick={onFilterClear}
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
                    {new Date(idea.created_at).toLocaleDateString('ar-SA')}
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
                      onClick={() => onDeleteIdea(idea)}
                      disabled={isDeleting}
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
