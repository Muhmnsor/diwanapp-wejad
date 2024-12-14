import { Button } from "@/components/ui/button";

interface EventRegisterButtonProps {
  status: 'available' | 'full' | 'ended' | 'notStarted';
  onRegister: () => void;
}

export const EventRegisterButton = ({ status, onRegister }: EventRegisterButtonProps) => {
  const statusColors = {
    available: "bg-primary hover:bg-primary/90",
    full: "bg-yellow-500 hover:bg-yellow-500",
    ended: "bg-red-500 hover:bg-red-500",
    notStarted: "bg-blue-500 hover:bg-blue-500"
  };

  const statusText = {
    available: "تسجيل الحضور",
    full: "اكتمل التسجيل",
    ended: "انتهى التسجيل",
    notStarted: "لم يبدأ التسجيل"
  };

  return (
    <div className="flex justify-center mt-8">
      <Button 
        size="lg" 
        className={`w-full text-white ${statusColors[status]}`}
        onClick={onRegister}
        disabled={status !== 'available'}
      >
        {statusText[status]}
      </Button>
    </div>
  );
};