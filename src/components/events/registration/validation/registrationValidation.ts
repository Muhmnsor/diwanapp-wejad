export const validateRegistrationData = (formData: any) => {
  const errors: Record<string, string> = {};

  if (!formData.arabicName?.trim()) {
    errors.arabicName = "الاسم مطلوب";
  }

  if (!formData.email?.trim()) {
    errors.email = "البريد الإلكتروني مطلوب";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "البريد الإلكتروني غير صالح";
  }

  if (!formData.phone?.trim()) {
    errors.phone = "رقم الجوال مطلوب";
  }

  return errors;
};