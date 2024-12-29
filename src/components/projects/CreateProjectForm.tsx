import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ProjectFormFields } from "./ProjectFormFields";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

export const CreateProjectForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .insert([data]);

      if (error) throw error;

      toast({
        title: "تم إنشاء المشروع بنجاح",
        description: "سيتم تحويلك إلى صفحة المشروع",
      });

      navigate('/');
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لم نتمكن من إنشاء المشروع. الرجاء المحاولة مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-right">إنشاء مشروع جديد</h1>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2 md:order-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <ProjectFormFields form={form} />
                    
                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/')}
                      >
                        إلغاء
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "جاري الإنشاء..." : "إنشاء المشروع"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
              
              <div className="md:w-1/2 md:order-1">
                <div className="bg-gray-100 rounded-lg h-full min-h-[400px] flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-gray-500">
                      سيتم عرض صورة المشروع هنا بعد اختيارها
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectForm;