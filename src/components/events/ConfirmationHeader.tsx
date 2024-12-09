import { Logo } from "@/components/Logo";

interface ConfirmationHeaderProps {
  eventTitle: string;
  registrationId: string;
}

export const ConfirmationHeader = ({
  eventTitle,
  registrationId,
}: ConfirmationHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-right space-y-2">
        <h3 className="font-bold text-xl">{eventTitle}</h3>
        <p className="text-sm text-muted-foreground">
          رقم التسجيل: {registrationId.split('-').pop()}
        </p>
      </div>
      <Logo className="w-16 h-16" />
    </div>
  );
};