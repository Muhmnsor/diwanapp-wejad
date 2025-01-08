import { AuthError } from "@supabase/supabase-js";

export const useAuthError = () => {
  const getErrorMessage = (error: AuthError): string => {
    // Check for specific error codes
    switch (error.message) {
      case "Invalid login credentials":
        return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      case "Email not confirmed":
        return "يرجى تأكيد البريد الإلكتروني أولاً";
      case "User not found":
        return "لم يتم العثور على المستخدم";
      case "Invalid email":
        return "البريد الإلكتروني غير صالح";
      default:
        return error.message;
    }
  };

  return { getErrorMessage };
};