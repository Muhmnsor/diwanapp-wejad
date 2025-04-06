
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { DigitalAccount } from "./DigitalAccounts";

interface AccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account: DigitalAccount | null;
}

export const AccountDialog = ({ isOpen, onClose, onSuccess, account }: AccountDialogProps) => {
  const [platform, setPlatform] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      setPlatform(account.platform || "");
      setUsername(account.username || "");
      setPassword(account.password || "");
      setNotes(account.notes || "");
      setHasPassword(account.has_password);
    } else {
      setPlatform("");
      setUsername("");
      setPassword("");
      setNotes("");
      setHasPassword(false);
    }
  }, [account, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!platform || !username) {
      toast.error("الرجاء ملء الحقول المطلوبة");
      return;
    }
    
    if (hasPassword && !password) {
      toast.error("الرجاء إدخال كلمة المرور");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const accountData = {
        platform,
        username,
        password: hasPassword ? password : null,
        has_password: hasPassword,
        notes: notes || null
      };
      
      let response;
      
      if (account) {
        // Update existing account
        response = await supabase
          .from('digital_accounts')
          .update(accountData)
          .eq('id', account.id);
      } else {
        // Insert new account
        response = await supabase
          .from('digital_accounts')
          .insert([accountData]);
      }
      
      if (response.error) {
        throw response.error;
      }
      
      toast.success(account ? "تم تحديث الحساب بنجاح" : "تمت إضافة الحساب بنجاح");
      onSuccess();
    } catch (error) {
      console.error("Error submitting account:", error);
      toast.error("حدث خطأ أثناء حفظ الحساب");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{account ? "تعديل حساب" : "إضافة حساب جديد"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">المنصة</Label>
            <Input
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="اسم المنصة أو الموقع"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">اسم المستخدم</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="اسم المستخدم أو البريد الإلكتروني"
              required
            />
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="has-password"
              checked={hasPassword}
              onCheckedChange={(checked) => setHasPassword(checked as boolean)}
            />
            <Label htmlFor="has-password">إضافة كلمة مرور</Label>
          </div>
          
          {hasPassword && (
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات إضافية (اختياري)"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : (account ? "تحديث" : "إضافة")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
