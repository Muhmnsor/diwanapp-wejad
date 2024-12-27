interface EventNotFoundProps {
  message?: string;
}

export const EventNotFound = ({ message = "لم يتم العثور على الفعالية" }: EventNotFoundProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="mb-4">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{message}</h2>
        <p className="text-gray-600">يرجى التحقق من الرابط والمحاولة مرة أخرى</p>
      </div>
    </div>
  );
};