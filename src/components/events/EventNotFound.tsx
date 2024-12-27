interface EventNotFoundProps {
  message?: string;
}

export const EventNotFound = ({ message = "لم يتم العثور على الفعالية" }: EventNotFoundProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{message}</h2>
        <p className="text-gray-600">يرجى التحقق من الرابط والمحاولة مرة أخرى</p>
      </div>
    </div>
  );
};