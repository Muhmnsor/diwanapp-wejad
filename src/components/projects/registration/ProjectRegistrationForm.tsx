import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProjectRegistrationFormProps {
  projectId: string;
  maxAttendees: number;
  onSuccess: () => void;
}

export const ProjectRegistrationForm = ({ 
  projectId, 
  maxAttendees,
  onSuccess 
}: ProjectRegistrationFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      console.log('Submitting project registration:', { projectId, data });

      // التحقق من عدد المسجلين الحالي
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId);

      if (count && count >= maxAttendees) {
        toast.error('عذراً، اكتمل العدد');
        return;
      }

      // إنشاء رقم تسجيل فريد
      const registrationNumber = `PR-${Date.now()}`;

      const { error } = await supabase
        .from('registrations')
        .insert([
          {
            project_id: projectId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            registration_number: registrationNumber,
            arabic_name: data.arabic_name,
            english_name: data.english_name,
            education_level: data.education_level,
            birth_date: data.birth_date,
            national_id: data.national_id
          }
        ]);

      if (error) throw error;

      toast.success('تم التسجيل بنجاح');
      onSuccess();
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast.error('حدث خطأ أثناء التسجيل');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
      <div>
        <Input
          {...register("arabic_name", { required: "الاسم بالعربي مطلوب" })}
          placeholder="الاسم بالعربي"
          className="text-right"
        />
        {errors.arabic_name && (
          <span className="text-red-500 text-sm">
            {errors.arabic_name.message as string}
          </span>
        )}
      </div>

      <div>
        <Input
          {...register("english_name", { required: "الاسم بالإنجليزي مطلوب" })}
          placeholder="الاسم بالإنجليزي"
          className="text-right"
        />
        {errors.english_name && (
          <span className="text-red-500 text-sm">
            {errors.english_name.message as string}
          </span>
        )}
      </div>

      <div>
        <Input
          {...register("email", { 
            required: "البريد الإلكتروني مطلوب",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "بريد إلكتروني غير صالح"
            }
          })}
          type="email"
          placeholder="البريد الإلكتروني"
          className="text-right"
          dir="ltr"
        />
        {errors.email && (
          <span className="text-red-500 text-sm">
            {errors.email.message as string}
          </span>
        )}
      </div>

      <div>
        <Input
          {...register("phone", { 
            required: "رقم الجوال مطلوب",
            pattern: {
              value: /^[0-9]{10}$/,
              message: "رقم جوال غير صالح"
            }
          })}
          type="tel"
          placeholder="رقم الجوال"
          className="text-right"
          dir="ltr"
        />
        {errors.phone && (
          <span className="text-red-500 text-sm">
            {errors.phone.message as string}
          </span>
        )}
      </div>

      <div>
        <Input
          {...register("education_level", { required: "المستوى التعليمي مطلوب" })}
          placeholder="المستوى التعليمي"
          className="text-right"
        />
        {errors.education_level && (
          <span className="text-red-500 text-sm">
            {errors.education_level.message as string}
          </span>
        )}
      </div>

      <div>
        <Input
          {...register("birth_date", { required: "تاريخ الميلاد مطلوب" })}
          type="date"
          placeholder="تاريخ الميلاد"
          className="text-right"
        />
        {errors.birth_date && (
          <span className="text-red-500 text-sm">
            {errors.birth_date.message as string}
          </span>
        )}
      </div>

      <div>
        <Input
          {...register("national_id", { 
            required: "رقم الهوية مطلوب",
            pattern: {
              value: /^[0-9]{10}$/,
              message: "رقم هوية غير صالح"
            }
          })}
          placeholder="رقم الهوية"
          className="text-right"
          dir="ltr"
        />
        {errors.national_id && (
          <span className="text-red-500 text-sm">
            {errors.national_id.message as string}
          </span>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "جاري التسجيل..." : "تسجيل"}
      </Button>
    </form>
  );
};