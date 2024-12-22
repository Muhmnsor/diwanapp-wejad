interface EventContainerProps {
  children: React.ReactNode;
}

export const EventContainer = ({ children }: EventContainerProps) => {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.12)] overflow-hidden" dir="rtl">
      {children}
    </div>
  );
};