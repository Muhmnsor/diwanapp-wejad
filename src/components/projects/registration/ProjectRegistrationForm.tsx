import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { PersonalInfoFields } from "../../events/form/PersonalInfoFields";
import { PaymentFields } from "../../events/form/PaymentFields";

interface ProjectRegistrationFormProps {
  projectTitle: string;
  projectPrice: number | "free" | null;
  startDate: string;
  endDate: string;
  eventType: string;
  onSubmit: () => void;
}

export const ProjectRegistrationForm = ({ 
  projectTitle, 
  projectPrice,
  startDate,
  endDate,
  eventType,
  onSubmit,
}: ProjectRegistrationFormProps) => {
  const { toast } = useToast();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    // إضافة حقول خاصة بالمشروع
    arabicName: "",
    englishName: "",
    educationLevel: "",
    birthDate: "",
    nationalId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkExistingRegistration = async (email: string) => {
    console.log("Checking for existing project registration...");
    const { data, error } = await supabase
      .from('registrations')
      .select('id')
      .eq('project_id', id)
      .eq('email', email);

    if (error) {
      console.error('Error checking registration:', error);
      throw error;
    }

    return data && data.length > 0;
  };

  const processPayment = async (registrationData: any) => {
    console.log("Processing payment for project...");
    const { error: paymentError } = await supabase
      .from('payment_transactions')
      .insert({
        registration_id: registrationData.id,
        amount: projectPrice,
        status: 'completed',
        payment_method: 'card',
        payment_gateway: 'local_gateway'
      });

    if (paymentError) {
      console.error('Error processing payment:', paymentError);
      throw paymentError;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting project registration process...");
    setIsSubmitting(true);

    try {
      const hasExistingRegistration = await checkExistingRegistration(formData.email);
      
      if (hasExistingRegistration) {
        toast({
          variant: "destructive",
          title: "لا يمكن إكمال التسجيل",
          description: "لقد قمت بالتسجيل في هذا المشروع مسبقاً",
        });
        return;
      }

      const uniqueId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data: newRegistration, error: registrationError } = await supabase
        .from('registrations')
        .insert({
          project_id: id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          registration_number: uniqueId,
          // إضافة البيانات الإضافية
          arabic_name: formData.arabicName,
          english_name: formData.englishName,
          education_level: formData.educationLevel,
          birth_date: formData.birthDate,
          national_id: formData.nationalId
        })
        .select()
        .single();

      if (registrationError) {
        console.error('Error submitting registration:', registrationError);
        throw registrationError;
      }

      if (projectPrice !== "free" && projectPrice !== null && projectPrice > 0) {
        const paymentSuccess = await processPayment(newRegistration);
        if (!paymentSuccess) {
          throw new Error('Payment processing failed');
        }
      }

      await queryClient.invalidateQueries({ 
        queryKey: ['registrations', id] 
      });
      
      toast.success("تم التسجيل بنجاح");
      onSubmit();
      
      console.log('Project registration successful:', uniqueId);
    } catch (error) {
      console.error('Error in registration process:', error);
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لم نتمكن من إكمال عملية التسجيل، يرجى المحاولة مرة أخرى",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPaidProject = projectPrice !== "free" && projectPrice !== null && projectPrice > 0;

  const getButtonText = () => {
    if (isSubmitting) {
      return "جاري المعالجة...";
    }
    if (isPaidProject) {
      return `الدفع وتأكيد التسجيل (${projectPrice} ريال)`;
    }
    return "تأكيد التسجيل";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <PersonalInfoFields
        formData={formData}
        setFormData={setFormData}
      />
      
      {/* حقول إضافية خاصة بالمشروع */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">الاسم بالعربية</label>
            <input
              type="text"
              value={formData.arabicName}
              onChange={(e) => setFormData(prev => ({ ...prev, arabicName: e.target.value }))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الاسم بالإنجليزية</label>
            <input
              type="text"
              value={formData.englishName}
              onChange={(e) => setFormData(prev => ({ ...prev, englishName: e.target.value }))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">المستوى التعليمي</label>
          <select
            value={formData.educationLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, educationLevel: e.target.value }))}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">اختر المستوى التعليمي</option>
            <option value="high_school">ثانوي</option>
            <option value="bachelor">بكالوريوس</option>
            <option value="master">ماجستير</option>
            <option value="phd">دكتوراه</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">تاريخ الميلاد</label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">رقم الهوية</label>
          <input
            type="text"
            value={formData.nationalId}
            onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
            className="w-full p-2 border rounded-md"
            required
            pattern="\d{10}"
            title="يجب أن يتكون رقم الهوية من 10 أرقام"
          />
        </div>
      </div>
      
      {isPaidProject && (
        <PaymentFields
          formData={formData}
          setFormData={setFormData}
          eventPrice={projectPrice}
        />
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {getButtonText()}
      </Button>
    </form>
  );
};