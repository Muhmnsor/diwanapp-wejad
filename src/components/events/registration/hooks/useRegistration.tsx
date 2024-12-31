import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRegistration = (
  onSubmit: (e: React.FormEvent) => void,
  isProject: boolean = false
) => {
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
    arabicName: "",
    englishName: "",
    educationLevel: "",
    birthDate: "",
    nationalId: "",
    gender: "",
    workStatus: "",
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting registration process...");
    setIsSubmitting(true);

    try {
      const hasExistingRegistration = await checkExistingRegistration(formData.email);
      
      if (hasExistingRegistration) {
        toast({
          variant: "destructive",
          title: "لا يمكن إكمال التسجيل",
          description: "لقد قمت بالتسجيل في هذه الفعالية مسبقاً",
        });
        return;
      }

      const uniqueId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const registrationData = {
        [isProject ? 'project_id' : 'event_id']: id,
        arabic_name: formData.arabicName,
        email: formData.email,
        phone: formData.phone,
        registration_number: uniqueId,
        english_name: formData.englishName || null,
        education_level: formData.educationLevel || null,
        birth_date: formData.birthDate || null,
        national_id: formData.nationalId || null,
        gender: formData.gender || null,
        work_status: formData.workStatus || null,
      };

      console.log('Submitting registration data:', registrationData);
      
      const { data: newRegistration, error: registrationError } = await supabase
        .from('registrations')
        .insert(registrationData)
        .select()
        .single();

      if (registrationError) {
        console.error('Error submitting registration:', registrationError);
        throw registrationError;
      }

      await queryClient.invalidateQueries({ 
        queryKey: ['registrations', id] 
      });
      
      setRegistrationId(uniqueId);
      setIsRegistered(true);
      setShowConfirmation(true);
      
      console.log('Registration successful:', {
        uniqueId,
        isRegistered: true,
        showConfirmation: true
      });

      if (onSubmit) {
        onSubmit(e);
      }
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

  const checkExistingRegistration = async (email: string) => {
    console.log("Checking for existing registration...");
    const { data, error } = await supabase
      .from('registrations')
      .select('id')
      .eq(isProject ? 'project_id' : 'event_id', id)
      .eq('email', email);

    if (error) {
      console.error('Error checking registration:', error);
      throw error;
    }

    return data && data.length > 0;
  };

  return {
    formData,
    setFormData,
    showConfirmation,
    setShowConfirmation,
    registrationId,
    isSubmitting,
    isRegistered,
    handleSubmit
  };
};