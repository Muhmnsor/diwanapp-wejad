
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAccountsOperations } from "@/hooks/accounting/useAccountsOperations";
import { useAccounts } from "@/hooks/accounting/useAccounts";

interface AccountFormProps {
  account?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export const AccountForm = ({ account, onCancel, onSuccess }: AccountFormProps) => {
  const { toast } = useToast();
  const { accounts } = useAccounts();
  const { createAccount, updateAccount } = useAccountsOperations();

  const [formData, setFormData] = useState({
    code: account?.code || "",
    name: account?.name || "",
    account_type: account?.account_type || "asset",
    parent_id: account?.parent_id || "",
    is_active: account?.is_active !== undefined ? account.is_active : true,
    notes: account?.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name || !formData.account_type) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (account?.id) {
        await updateAccount(account.id, formData);
        toast({
          title: "تم تحديث الحساب",
          description: "تم تحديث بيانات الحساب بنجاح",
        });
      } else {
        await createAccount(formData);
        toast({
          title: "تم إنشاء الحساب",
          description: "تم إضافة الحساب الجديد بنجاح",
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving account:", error);
      toast({
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter accounts to get potential parents (exclude child accounts to prevent circular references)
  const parentAccounts = accounts.filter(a => 
    a.level <= 2 && (!account || a.id !== account.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">رمز الحساب</Label>
          <Input
            id="code"
            name="code"
            placeholder="1100"
            value={formData.code}
            onChange={handleChange}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">اسم الحساب</Label>
          <Input
            id="name"
            name="name"
            placeholder="اسم الحساب"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>نوع الحساب</Label>
          <Select
            value={formData.account_type}
            onValueChange={(value) => handleSelectChange("account_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الحساب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asset">أصول</SelectItem>
              <SelectItem value="liability">التزامات</SelectItem>
              <SelectItem value="equity">حقوق ملكية</SelectItem>
              <SelectItem value="revenue">إيرادات</SelectItem>
              <SelectItem value="expense">مصروفات</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>الحساب الرئيسي</Label>
          <Select
            value={formData.parent_id || ""}
            onValueChange={(value) => handleSelectChange("parent_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحساب الرئيسي" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">بدون حساب رئيسي</SelectItem>
              {parentAccounts.map((parent) => (
                <SelectItem key={parent.id} value={parent.id}>
                  {parent.code} - {parent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="ملاحظات إضافية (اختياري)"
          value={formData.notes || ""}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "جاري الحفظ..." : account ? "تحديث الحساب" : "إضافة الحساب"}
        </Button>
      </div>
    </form>
  );
};
