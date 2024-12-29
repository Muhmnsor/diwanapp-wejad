import { Badge } from "@/components/ui/badge";

interface ProjectStatusProps {
  status: string;
  className?: string;
}

export const ProjectCardStatus = ({ status, className }: ProjectStatusProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ended":
        return {
          text: "منتهي",
          variant: "default",
          color: "bg-gray-500",
          textColor: "text-white"
        };
      case "full":
        return {
          text: "مكتمل",
          variant: "default",
          color: "bg-yellow-500",
          textColor: "text-white"
        };
      case "notStarted":
        return {
          text: "لم يبدأ",
          variant: "default",
          color: "bg-blue-500",
          textColor: "text-white"
        };
      default:
        return {
          text: "متاح",
          variant: "default",
          color: "bg-primary",
          textColor: "text-white"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant="default"
      className={`${config.color} ${config.textColor} ${className}`}
    >
      {config.text}
    </Badge>
  );
};