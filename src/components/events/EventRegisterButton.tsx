import { Button } from "@/components/ui/button";

interface EventRegisterButtonProps {
  status: 'available' | 'full' | 'ended' | 'notStarted';
  onRegister: () => void;
}

export const EventRegisterButton = ({ status, onRegister }: EventRegisterButtonProps) => {
  console.log('EventRegisterButton status:', status);
  
  const statusConfig = {
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
      text: "للأسف فاتتك هذه الفعالية. تابعنا لتنضم إلى الفعالية القادمة ✨",
      className: "bg-gray-50 text-gray-400 cursor-not-allowed",
      disabled: true
    },
    notStarted: {
      text: "لم يبدأ التسجيل بعد",
      className: "bg-gray-50 text-gray-400 cursor-not-allowed",
      disabled: true
    }
  };

  const config = statusConfig[status];

  return (
    <Button 
      size="lg" 
      className={`w-full rounded-2xl h-14 text-lg ${config.className}`}
      onClick={onRegister}
      disabled={config.disabled}
    >
      {config.text}
    </Button>
  );
};