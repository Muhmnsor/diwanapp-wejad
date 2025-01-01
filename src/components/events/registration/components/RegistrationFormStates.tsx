interface ErrorStateProps {
  error: Error;
}

export const LoadingState = () => {
  return (
    <div className="text-center py-4">
      جاري تحميل نموذج التسجيل...
    </div>
  );
};

export const ErrorState = ({ error }: ErrorStateProps) => {
  console.error('Error in registration form:', error);
  return (
    <div className="text-center py-4 text-red-500">
      حدث خطأ في تحميل نموذج التسجيل. يرجى المحاولة مرة أخرى.
    </div>
  );
};