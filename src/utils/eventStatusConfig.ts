import { EventStatus } from "@/types/eventStatus";

export const getStatusConfig = (status: EventStatus) => {
  const configs = {
    available: {
      text: "سجل الآن",
      className: "bg-primary text-white hover:bg-primary/90",
      disabled: false
    },
    full: {
      text: "عذراً، اكتمل العدد",
      className: "bg-purple-100 text-purple-700 cursor-not-allowed",
      disabled: true
    },
    ended: {
      text: "عذراً، انتهى وقت التسجيل",
      className: "bg-red-100 text-red-700 cursor-not-allowed",
      disabled: true
    },
    notStarted: {
      text: "سيفتح التسجيل قريباً",
      className: "bg-yellow-100 text-yellow-700 cursor-not-allowed",
      disabled: true
    },
    eventStarted: {
      text: "عذراً، بدأت الفعالية",
      className: "bg-gray-100 text-gray-700 cursor-not-allowed",
      disabled: true
    }
  };

  return configs[status];
};