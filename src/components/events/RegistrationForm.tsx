import { FormEvent, useState, useEffect } from "react";
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
    englishName: "",
    email: "",
    phone: "",
    educationLevel: "",
    birthDate: "",
    nationalId: "",
    gender: "",
    workStatus: ""
  });
  
  const [registrationFields, setRegistrationFields] = useState({
    arabic_name: true,
    email: true,
    phone: true,
    english_name: false,
    education_level: false,
    birth_date: false,
    national_id: false,
    gender: false,
    work_status: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendNotification } = useNotifications();

  // Get event ID from URL
  const eventId = window.location.pathname.split('/').pop();

  useEffect(() => {
    const fetchRegistrationFields = async () => {
      if (!eventId) return;

      try {
        const { data, error } = await supabase
          .from('event_registration_fields')
          .select('*')
          .eq('event_id', eventId)
          .single();

        if (error) throw error;

        if (data) {
          console.log('📋 Fetched registration fields:', data);
          setRegistrationFields(data);
        }
      } catch (error) {
        console.error('Error fetching registration fields:', error);
      }
    };

    fetchRegistrationFields();
  }, [eventId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Submitting registration form:', formData);
    
    // Validate required fields based on registration settings
    const requiredFields = Object.entries(registrationFields)
      .filter(([_, isRequired]) => isRequired)
      .map(([field]) => field.toLowerCase());

    const missingFields = requiredFields.filter(field => {
      const formField = field.replace(/_/g, '');
      return !formData[formField as keyof typeof formData];
    });

    if (missingFields.length > 0) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
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

      // Create registration with all fields
      const { data: registration, error: registrationError } = await supabase
        .from('registrations')
        .insert([{
          event_id: eventId,
          arabic_name: formData.arabicName,
          english_name: formData.englishName,
          email: formData.email,
          phone: formData.phone,
          education_level: formData.educationLevel,
          birth_date: formData.birthDate,
          national_id: formData.nationalId,
          gender: formData.gender,
          work_status: formData.workStatus,
          registration_number: `REG-${Date.now()}`
        }])
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
      {registrationFields.arabic_name && (
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
      )}

      {registrationFields.english_name && (
        <div>
          <label className="block text-sm font-medium mb-1">الاسم باللغة الإنجليزية</label>
          <input
            type="text"
            value={formData.englishName}
            onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
        </div>
      )}

      {registrationFields.email && (
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
      )}

      {registrationFields.phone && (
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
      )}

      {registrationFields.education_level && (
        <div>
          <label className="block text-sm font-medium mb-1">المستوى التعليمي</label>
          <select
            value={formData.educationLevel}
            onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="">اختر المستوى التعليمي</option>
            <option value="primary">ابتدائي</option>
            <option value="intermediate">متوسط</option>
            <option value="high_school">ثانوي</option>
            <option value="bachelor">بكالوريوس</option>
            <option value="master">ماجستير</option>
            <option value="phd">دكتوراه</option>
          </select>
        </div>
      )}

      {registrationFields.birth_date && (
        <div>
          <label className="block text-sm font-medium mb-1">تاريخ الميلاد</label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
        </div>
      )}

      {registrationFields.national_id && (
        <div>
          <label className="block text-sm font-medium mb-1">رقم الهوية</label>
          <input
            type="text"
            value={formData.nationalId}
            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
            className="w-full p-2 border rounded-md"
          />
        </div>
      )}

      {registrationFields.gender && (
        <div>
          <label className="block text-sm font-medium mb-1">الجنس</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="">اختر الجنس</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
        </div>
      )}

      {registrationFields.work_status && (
        <div>
          <label className="block text-sm font-medium mb-1">الحالة الوظيفية</label>
          <select
            value={formData.workStatus}
            onChange={(e) => setFormData({ ...formData, workStatus: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="">اختر الحالة الوظيفية</option>
            <option value="employed">موظف</option>
            <option value="unemployed">غير موظف</option>
            <option value="student">طالب</option>
            <option value="retired">متقاعد</option>
          </select>
        </div>
      )}

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