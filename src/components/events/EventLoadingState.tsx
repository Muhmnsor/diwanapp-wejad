import { Navigation } from "@/components/Navigation";

export const EventLoadingState = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-xl animate-pulse">جاري تحميل تفاصيل الفعالية...</div>
      </div>
    </div>
  );
};