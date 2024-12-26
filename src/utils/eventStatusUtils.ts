import { EventStatus } from "@/types/eventStatus";

export const getRegistrationStatusConfig = (status: EventStatus) => {
  switch (status) {
    case 'eventStarted':
      return { 
        text: "انتهت الفعالية", 
        variant: "destructive" as const, 
        color: "bg-gray-500",
        textColor: "text-white" 
      };
    case 'full':
      return { 
        text: "اكتمل التسجيل", 
        variant: "destructive" as const, 
        color: "bg-purple-500",
        textColor: "text-white" 
      };
    case 'notStarted':
      return { 
        text: "لم يبدأ التسجيل", 
        variant: "destructive" as const, 
        color: "bg-yellow-500",
        textColor: "text-black" 
      };
    case 'ended':
      return { 
        text: "انتهى التسجيل", 
        variant: "destructive" as const, 
        color: "bg-red-500",
        textColor: "text-white" 
      };
    default:
      return { 
        text: "التسجيل متاح", 
        variant: "secondary" as const, 
        color: "bg-green-500",
        textColor: "text-white" 
      };
  }
};