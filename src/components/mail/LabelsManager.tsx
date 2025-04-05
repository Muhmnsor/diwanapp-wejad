
import React, { useState } from "react";
import { useLabelsManager, Label } from "@/hooks/mail/useLabelsManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X, Trash2, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const LabelsManager: React.FC = () => {
  const { labels, isLoadingLabels, addLabel, deleteLabel } = useLabelsManager();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3B82F6");
  const [labelToDelete, setLabelToDelete] = useState<string | null>(null);

  const handleAddLabel = () => {
    if (newLabelName.trim()) {
      addLabel.mutate(
        {
          name: newLabelName.trim(),
          color: newLabelColor,
        },
        {
          onSuccess: () => {
            setNewLabelName("");
            setNewLabelColor("#3B82F6");
            setIsAddDialogOpen(false);
          },
        }
      );
    }
  };

  const handleDeleteLabel = () => {
    if (labelToDelete) {
      deleteLabel.mutate(labelToDelete, {
        onSuccess: () => {
          setLabelToDelete(null);
        },
      });
    }
  };

  if (isLoadingLabels) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل التصنيفات...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">إدارة التصنيفات</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة تصنيف جديد
        </Button>
      </div>

      {labels?.length === 0 ? (
        <Alert className="bg-muted/50">
          <AlertDescription className="flex flex-col items-center py-8">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد تصنيفات</h3>
            <p className="text-muted-foreground mb-4">لم تقم بإنشاء أي تصنيفات بعد</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              إنشاء تصنيف جديد
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {labels?.map((label: Label) => (
            <div
              key={label.id}
              className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center">
                <div
                  className="w-5 h-5 rounded-full mr-3"
                  style={{ backgroundColor: label.color }}
                ></div>
                <span className="text-lg">{label.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setLabelToDelete(label.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* إضافة تصنيف جديد */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة تصنيف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="label-name" className="text-sm font-medium">
                اسم التصنيف
              </label>
              <Input
                id="label-name"
                placeholder="ادخل اسم التصنيف"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="label-color" className="text-sm font-medium">
                اللون
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  id="label-color"
                  className="w-16 h-10 p-1"
                  value={newLabelColor}
                  onChange={(e) => setNewLabelColor(e.target.value)}
                />
                <div className="flex-1">
                  <div className="p-3 rounded" style={{ backgroundColor: newLabelColor }}>
                    <div className="text-center" style={{ color: isLightColor(newLabelColor) ? '#000' : '#fff' }}>
                      {newLabelName || 'معاينة التصنيف'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleAddLabel} 
              disabled={!newLabelName.trim() || addLabel.isPending}
            >
              {addLabel.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تأكيد حذف التصنيف */}
      <Dialog open={!!labelToDelete} onOpenChange={() => setLabelToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تأكيد حذف التصنيف</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              هل أنت متأكد من رغبتك في حذف هذا التصنيف؟ لا يمكن التراجع عن هذه العملية.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLabelToDelete(null)}>
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteLabel}
              disabled={deleteLabel.isPending}
            >
              {deleteLabel.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// دالة مساعدة لتحديد ما إذا كان اللون فاتحًا أم غامقًا
const isLightColor = (color: string): boolean => {
  // تحويل اللون إلى RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // حساب نسبة السطوع (Luminance)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // إذا كان السطوع أكبر من 0.5، فاللون فاتح
  return luminance > 0.5;
};
