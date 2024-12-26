import { EventStatus, EventStatusConfig } from "@/types/eventStatus";

export const getStatusConfig = (status: EventStatus): EventStatusConfig => {
  const configs: Record<EventStatus, EventStatusConfig> = {
    available: {
      text: "تسجيل الحضور",
      className: "bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all",
      disabled: false
    },
    full: {
      text: "عذراً، اكتمل العدد المسموح للتسجيل",
      className: "bg-purple-100 text-purple-700 cursor-not-allowed",
      disabled: true
    },
    ended: {
      text: "عذراً، انتهت فترة التسجيل المتاحة",
      className: "bg-red-100 text-red-700 cursor-not-allowed",
      disabled: true
    },
    notStarted: {
      text: "التسجيل سيبدأ قريباً",
      className: "bg-yellow-100 text-yellow-700 cursor-not-allowed",
      disabled: true
    },
    eventStarted: {
      text: "عذراً، انتهت الفعالية",
      className: "bg-gray-100 text-gray-700 cursor-not-allowed",
      disabled: true
    }
  };

  return configs[status];
};