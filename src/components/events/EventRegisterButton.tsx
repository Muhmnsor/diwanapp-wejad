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
      className: "bg-primary hover:bg-primary/90 border-primary",
      disabled: false
    },
    full: {
      text: "اكتمل التسجيل",
      className: "bg-yellow-500 border-yellow-500 cursor-not-allowed opacity-60",
      disabled: true
    },
    ended: {
      text: "للأسف فاتتك هذه الفعالية. تابعنا لتنضم إلى الفعالية القادمة ✨",
      className: "bg-transparent text-gray-500 border-gray-300 cursor-not-allowed",
      disabled: true
    },
    notStarted: {
      text: "لم يبدأ التسجيل",
      className: "bg-transparent text-gray-500 border-gray-300 cursor-not-allowed",
      disabled: true
    }
  };

  const config = statusConfig[status];

  return (
    <div className="flex justify-center mt-8">
      <Button 
        size="lg" 
        variant="outline"
        className={`w-full ${config.className}`}
        onClick={onRegister}
        disabled={config.disabled}
      >
        {config.text}
      </Button>
    </div>
  );
};