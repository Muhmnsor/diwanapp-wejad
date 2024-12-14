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
      className: "bg-primary hover:bg-primary/90",
      disabled: false
    },
    full: {
      text: "اكتمل التسجيل",
      className: "bg-yellow-500 cursor-not-allowed opacity-60",
      disabled: true
    },
    ended: {
      text: "انتهى التسجيل",
      className: "bg-red-500 cursor-not-allowed opacity-60",
      disabled: true
    },
    notStarted: {
      text: "لم يبدأ التسجيل",
      className: "bg-gray-500 cursor-not-allowed opacity-60",
      disabled: true
    }
  };

  const config = statusConfig[status];

  return (
    <div className="flex justify-center mt-8">
      <Button 
        size="lg" 
        className={`w-full text-white ${config.className}`}
        onClick={onRegister}
        disabled={config.disabled}
      >
        {config.text}
      </Button>
    </div>
  );
};