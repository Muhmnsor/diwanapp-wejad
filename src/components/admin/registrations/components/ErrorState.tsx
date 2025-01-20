interface ErrorStateProps {
  error?: Error;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="text-center py-8 text-red-500">
      {error?.message || "حدث خطأ في تحميل التسجيلات"}
    </div>
  );
};