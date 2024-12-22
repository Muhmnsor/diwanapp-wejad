interface EventContainerProps {
  children: React.ReactNode;
}

export const EventContainer = ({ children }: EventContainerProps) => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg" dir="rtl">
      {children}
    </div>
  );
};