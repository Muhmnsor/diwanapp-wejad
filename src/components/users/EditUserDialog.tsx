
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Role } from "./types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUserEdited: () => void;
}

const formSchema = z.object({
  displayName: z.string().optional(),
  roleId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const EditUserDialog = ({ open, onOpenChange, user, onUserEdited }: EditUserDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      roleId: user?.roleId || "",
      isActive: user?.isActive !== false,
    },
  });

  // Load roles for dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('roles')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setRoles(data || []);
      } catch (err: any) {
        console.error("Error fetching roles:", err);
        setError("Failed to load roles");
      }
    };

    if (open) {
      fetchRoles();
    }
  }, [open]);

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || "",
        roleId: user.roleId || "",
        isActive: user.isActive !== false,
      });
    }
  }, [user, form]);

  const handleClose = () => {
    setError(null);
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          display_name: values.displayName,
          is_active: values.isActive
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // If role is selected, update or create user role
      if (values.roleId) {
        // Check if user already has a role
        const { data: existingRoles } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', user.id);
        
        if (existingRoles && existingRoles.length > 0) {
          // Update existing role
          const { error: roleUpdateError } = await supabase
            .from('user_roles')
            .update({ role_id: values.roleId })
            .eq('user_id', user.id);
          
          if (roleUpdateError) throw roleUpdateError;
        } else {
          // Create new role assignment
          const { error: roleInsertError } = await supabase
            .from('user_roles')
            .insert({ user_id: user.id, role_id: values.roleId });
          
          if (roleInsertError) throw roleInsertError;
        }
      }

      toast.success("تم تحديث المستخدم بنجاح");
      handleClose();
      onUserEdited();
    } catch (error: any) {
      console.error("Error updating user:", error);
      setError(`حدث خطأ أثناء تحديث المستخدم: ${error.message || error}`);
      toast.error("حدث خطأ أثناء تحديث المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل المستخدم</DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-right">{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-right">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم العرض</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="اسم العرض" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الدور</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر دوراً" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">لا دور</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>حساب نشط</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex sm:justify-start gap-2 mt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جارِ الحفظ...
                  </>
                ) : "حفظ التغييرات"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
