import { toast } from "sonner";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = "جاري تحميل نموذج التسجيل..." }: LoadingStateProps) => {
  return (
    <div className="text-center py-4">
      {message}
    </div>
  );
};

interface ErrorStateProps {
  error: unknown;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  console.error('Error in registration form:', error);
  return (
    <div className="text-center py-4 text-red-500">
      حدث خطأ في تحميل نموذج التسجيل. يرجى المحاولة مرة أخرى.
    </div>
  );
};