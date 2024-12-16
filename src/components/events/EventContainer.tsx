interface EventContainerProps {
  children: React.ReactNode;
}

export const EventContainer = ({ children }: EventContainerProps) => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg border border-gray-100 shadow-sm" dir="rtl">
      {children}
    </div>
  );
};