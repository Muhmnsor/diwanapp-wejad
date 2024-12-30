import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EventRegistrationFormProps {
  eventId: string;
  maxAttendees: number;
  onSuccess: () => void;
}

export const EventRegistrationForm = ({ 
  eventId, 
  maxAttendees,
  onSuccess 
}: EventRegistrationFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      console.log('Submitting event registration:', { eventId, data });

      // التحقق من عدد المسجلين الحالي
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact' })
        .eq('event_id', eventId);

      if (count && count >= maxAttendees) {
        toast.error('عذراً، اكتمل العدد');
        return;
      }

      // إنشاء رقم تسجيل فريد
      const registrationNumber = `EV-${Date.now()}`;

      const { error } = await supabase
        .from('registrations')
        .insert([
          {
            event_id: eventId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            registration_number: registrationNumber
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
          {...register("name", { required: "الاسم مطلوب" })}
          placeholder="الاسم"
          className="text-right"
        />
        {errors.name && (
          <span className="text-red-500 text-sm">
            {errors.name.message as string}
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