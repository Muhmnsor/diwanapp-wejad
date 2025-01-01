interface ErrorStateProps {
  error: Error;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  console.error('Registration form error:', error);
  
  return (
    <div className="text-center py-4 text-red-500">
      حدث خطأ في تحميل نموذج التسجيل. يرجى المحاولة مرة أخرى.
    </div>
  );
};