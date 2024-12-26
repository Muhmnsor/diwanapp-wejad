import { EventStatus, EventStatusConfig } from "@/types/eventStatus";

export const getStatusConfig = (status: EventStatus): EventStatusConfig => {
  const configs: Record<EventStatus, EventStatusConfig> = {
    available: {
      text: "تسجيل الحضور",
      className: "bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all",
      disabled: false
    },
    full: {
      text: "اكتمل التسجيل",
      className: "bg-gray-100 text-gray-500 cursor-not-allowed",
      disabled: true
    },
    ended: {
      text: "انتهى التسجيل",
      className: "bg-gray-50 text-gray-400 cursor-not-allowed",
      disabled: true
    },
    notStarted: {
      text: "لم يبدأ التسجيل بعد",
      className: "bg-gray-50 text-gray-400 cursor-not-allowed",
      disabled: true
    },
    eventStarted: {
      text: "انتهت الفعالية",
      className: "bg-gray-50 text-gray-400 cursor-not-allowed",
      disabled: true
    }
  };

  return configs[status];
};