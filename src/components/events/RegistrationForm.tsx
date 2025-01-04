import { FormEvent, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";

export const RegistrationForm = ({ 
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit 
}: {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  onSubmit: () => void;
}) => {
  const [formData, setFormData] = useState({
    arabicName: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendNotification } = useNotifications();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Submitting registration form:', formData);
    
    if (!formData.arabicName || !formData.email || !formData.phone) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get event ID from URL
      const eventId = window.location.pathname.split('/').pop();
      
      // Get registration template
      const { data: template } = await supabase
        .from('whatsapp_templates')
        .select('id')
        .eq('notification_type', 'event_registration')
        .eq('is_default', true)
        .single();

      if (!template) {
        throw new Error('Registration template not found');
      }

      // Create registration
      const { data: registration, error: registrationError } = await supabase
        .from('registrations')
        .insert([
          {
            event_id: eventId,
            arabic_name: formData.arabicName,
            email: formData.email,
            phone: formData.phone,
            registration_number: `REG-${Date.now()}`
          }
        ])
        .select()
        .single();

      if (registrationError) throw registrationError;

      // Send registration notification
      await sendNotification({
        type: 'registration',
        eventId,
        registrationId: registration.id,
        recipientPhone: formData.phone,
        templateId: template.id,
        variables: {
          name: formData.arabicName,
          event_title: eventTitle,
          event_date: eventDate || '',
          event_time: eventTime || '',
          event_location: eventLocation || '',
        }
      });

      toast.success('تم التسجيل بنجاح');
      onSubmit();
    } catch (error) {
      console.error('Error in registration:', error);
      toast.error('حدث خطأ أثناء التسجيل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">الاسم الثلاثي</label>
        <input
          type="text"
          value={formData.arabicName}
          onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">رقم الجوال</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white p-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'جاري التسجيل...' : 'تسجيل'}
      </button>
    </form>
  );
};