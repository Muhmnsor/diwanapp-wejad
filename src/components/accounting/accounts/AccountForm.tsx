
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { supabase } from "@/integrations/supabase/client";
import { useAccounts } from "@/hooks/accounting/useAccounts";
import { useQueryClient } from "@tanstack/react-query";

interface AccountFormProps {
  account?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

export const AccountForm = ({ account, onCancel, onSuccess }: AccountFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { accounts } = useAccounts();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!account;

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      code: account?.code || "",
      name: account?.name || "",
      account_type: account?.account_type || "asset",
      parent_id: account?.parent_id || "",
      notes: account?.notes || "",
      is_active: account?.is_active !== undefined ? account.is_active : true,
    },
  });

  // تصفية الحسابات لاختيار الحساب الرئيسي
  const filteredAccounts = accounts?.filter(a => a.id !== account?.id) || [];

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // حساب مستوى الحساب (Level)
      let level = 0;
      if (data.parent_id) {
        const parentAccount = accounts?.find(a => a.id === data.parent_id);
        if (parentAccount) {
          level = parentAccount.level + 1;
        }
      }

      if (isEditing) {
        // تحديث حساب موجود
        const { error } = await supabase
          .from("accounting_accounts")
          .update({
            code: data.code,
            name: data.name,
            account_type: data.account_type,
            parent_id: data.parent_id || null,
            level,
            notes: data.notes,
            is_active: data.is_active,
          })
          .eq("id", account.id);

        if (error) {
          throw error;
        }

        toast({
          title: "تم تحديث الحساب بنجاح",
        });
      } else {
        // إنشاء حساب جديد
        const { error } = await supabase
          .from("accounting_accounts")
          .insert({
            code: data.code,
            name: data.name,
            account_type: data.account_type,
            parent_id: data.parent_id || null,
            level,
            notes: data.notes,
            is_active: data.is_active,
          });

        if (error) {
          throw error;
        }

        toast({
          title: "تم إنشاء الحساب بنجاح",
        });
      }

      // تحديث بيانات الحسابات
      queryClient.invalidateQueries({ queryKey: ["accounting_accounts"] });
      reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="code">رمز الحساب</Label>
          <Input
            id="code"
            {...register("code", {
              required: "رمز الحساب مطلوب",
              pattern: {
                value: /^[0-9]+$/,
                message: "يرجى إدخال رمز رقمي",
              },
            })}
          />
          {errors.code && (
            <p className="text-sm text-red-500">{errors.code.message as string}</p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="name">اسم الحساب</Label>
          <Input
            id="name"
            {...register("name", {
              required: "اسم الحساب مطلوب",
            })}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message as string}</p>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="account_type">نوع الحساب</Label>
          <Select
            defaultValue={account?.account_type || "asset"}
            onValueChange={(value) => {
              register("account_type").onChange({
                target: { value, name: "account_type" },
              });
            }}
          >
            <SelectTrigger id="account_type">
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

        <div className="flex flex-col space-y-2">
          <Label htmlFor="parent_id">الحساب الرئيسي</Label>
          <Select
            defaultValue={account?.parent_id || ""}
            onValueChange={(value) => {
              register("parent_id").onChange({
                target: { value, name: "parent_id" },
              });
            }}
          >
            <SelectTrigger id="parent_id">
              <SelectValue placeholder="اختر الحساب الرئيسي" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">- بدون حساب رئيسي -</SelectItem>
              {filteredAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.code} - {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-2 md:col-span-2">
          <Label htmlFor="notes">ملاحظات</Label>
          <Textarea id="notes" {...register("notes")} />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_active"
            className="h-4 w-4 rounded border-gray-300"
            {...register("is_active")}
          />
          <Label htmlFor="is_active" className="mr-2">حساب نشط</Label>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "جاري الحفظ..." : isEditing ? "تحديث الحساب" : "إضافة الحساب"}
        </Button>
      </div>
    </form>
  );
};
