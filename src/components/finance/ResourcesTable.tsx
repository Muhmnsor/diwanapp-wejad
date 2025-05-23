
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
import { Edit, Trash, Info } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Resource {
  id: string;
  date: string;
  source: string;
  type: string;
  entity: string;
  total_amount: number;
  obligations_amount: number;
  net_amount: number;
  obligations_count?: number;
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
      
      // Fetch all resources
      const { data, error } = await supabase
        .from('financial_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // For each resource, fetch the number of obligations
      const resourcesWithObligations = await Promise.all((data || []).map(async (resource) => {
        const { count, error: countError } = await supabase
          .from('resource_obligations')
          .select('*', { count: 'exact', head: true })
          .eq('resource_id', resource.id);
        
        if (countError) {
          console.error("Error fetching obligations count:", countError);
          return { ...resource, obligations_count: 0 };
        }
        
        return { ...resource, obligations_count: count || 0 };
      }));
      
      setResources(resourcesWithObligations);
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
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>المصدر</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الجهة</TableHead>
              <TableHead>المبلغ الإجمالي</TableHead>
              <TableHead>الالتزامات</TableHead>
              <TableHead>المبلغ الصافي</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>
                  {formatDate(resource.date)}
                </TableCell>
                <TableCell>{resource.source}</TableCell>
                <TableCell>
                  <Badge variant={resource.type === "bound" ? "outline" : "default"}>
                    {resource.type === "bound" ? "مقيد" : "غير مقيد"}
                  </Badge>
                </TableCell>
                <TableCell>{resource.entity}</TableCell>
                <TableCell>{resource.total_amount.toLocaleString()} ريال</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {resource.obligations_amount.toLocaleString()} ريال
                    {resource.obligations_count && resource.obligations_count > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="ml-1">
                              <Info className="h-3 w-3 mr-1" />
                              {resource.obligations_count}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>عدد الالتزامات: {resource.obligations_count}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>{resource.net_amount.toLocaleString()} ريال</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(resource)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(resource.id)}>
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
