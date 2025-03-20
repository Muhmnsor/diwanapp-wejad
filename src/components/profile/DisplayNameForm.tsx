
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export const DisplayNameForm = () => {
  const { user } = useAuthStore();
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("الرجاء إدخال اسم العرض");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user?.id);

      if (error) throw error;
      
      toast.success("تم تحديث الاسم بنجاح");
      // Force page reload to update the display name in UI
      window.location.reload();
    } catch (error) {
      console.error("Error updating display name:", error);
      toast.error("حدث خطأ أثناء تحديث الاسم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-right">تحديث الاسم</CardTitle>
        <CardDescription className="text-right">قم بتغيير اسم العرض الخاص بك</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateDisplayName} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="displayName" className="block text-sm font-medium text-right">
              الاسم
            </label>
            <Input
              id="displayName"
              dir="rtl"
              className="text-right"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="أدخل اسم العرض"
            />
          </div>
          <Button 
            type="submit"
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري التحديث..." : "تحديث الاسم"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
