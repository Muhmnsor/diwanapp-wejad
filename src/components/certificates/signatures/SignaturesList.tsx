import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { SignatureDialog } from "./SignatureDialog";
import { toast } from "sonner";

export const SignaturesList = () => {
  const [editSignature, setEditSignature] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: signatures, isLoading } = useQuery({
    queryKey: ['certificate-signatures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificate_signatures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleEdit = (signature: any) => {
    setEditSignature(signature);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('certificate_signatures')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم حذف التوقيع بنجاح');
    } catch (error) {
      console.error('Error deleting signature:', error);
      toast.error('حدث خطأ أثناء حذف التوقيع');
    }
  };

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      {signatures?.map((signature: any) => (
        <Card key={signature.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{signature.name}</h3>
              <p className="text-sm text-muted-foreground">{signature.position}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleEdit(signature)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(signature.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <SignatureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        signature={editSignature}
      />
    </div>
  );
};