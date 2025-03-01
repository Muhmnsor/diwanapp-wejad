
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDate } from "@/utils/dateUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditResourceForm } from "./resource-form/EditResourceForm";

interface Resource {
  id: string;
  date: string;
  source: string;
  type: string;
  entity: string;
  total_amount: number;
  obligations_amount: number;
  net_amount: number;
}

export const ResourcesTable = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('financial_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setResources(data || []);
    } catch (error: any) {
      console.error("Error fetching resources:", error);
      toast.error("حدث خطأ أثناء جلب بيانات الموارد");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setEditDialogOpen(true);
  };

  const handleEditComplete = () => {
    setEditDialogOpen(false);
    setEditingResource(null);
    fetchResources(); // إعادة تحميل البيانات
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المورد؟")) return;
    
    try {
      const { error } = await supabase
        .from('financial_resources')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success("تم حذف المورد بنجاح");
      fetchResources(); // إعادة تحميل البيانات
    } catch (error: any) {
      console.error("Error deleting resource:", error);
      toast.error("حدث خطأ أثناء حذف المورد");
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="border rounded-md">
      {resources.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          لا توجد موارد مالية مضافة حتى الآن
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-center py-4 text-gray-700 font-semibold">التاريخ</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">المصدر</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">النوع</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">الجهة</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">المبلغ الإجمالي</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">الالتزامات</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">المبلغ الصافي</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource) => (
              <TableRow 
                key={resource.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="text-center py-4 text-gray-700">
                  {formatDate(resource.date)}
                </TableCell>
                <TableCell className="text-center py-4 text-gray-700">{resource.source}</TableCell>
                <TableCell className="text-center py-4">
                  <Badge variant={resource.type === "bound" ? "outline" : "default"}>
                    {resource.type === "bound" ? "مقيد" : "غير مقيد"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center py-4 text-gray-700">{resource.entity}</TableCell>
                <TableCell className="text-center py-4 text-gray-700">{resource.total_amount.toLocaleString()} ريال</TableCell>
                <TableCell className="text-center py-4 text-gray-700">{resource.obligations_amount.toLocaleString()} ريال</TableCell>
                <TableCell className="text-center py-4 text-gray-700">{resource.net_amount.toLocaleString()} ريال</TableCell>
                <TableCell className="text-center py-4">
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(resource)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(resource.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-[95%] w-full md:max-w-[800px] max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل مورد مالي</DialogTitle>
          </DialogHeader>
          {editingResource && (
            <EditResourceForm 
              resource={editingResource} 
              onCancel={() => setEditDialogOpen(false)}
              onSubmit={handleEditComplete} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
