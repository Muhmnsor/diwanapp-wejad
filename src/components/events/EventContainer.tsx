interface EventContainerProps {
  children: React.ReactNode;
}

export const EventContainer = ({ children }: EventContainerProps) => {
  return (
    <div className="max-w-4xl mx-auto border border-gray-200 rounded-lg" dir="rtl">
      {children}
    </div>
  );
};