import { Button } from "@/components/ui/button";

interface CertificateActionsProps {
  onPreview: () => void;
  isLoading: boolean;
}

export const CertificateActions = ({ onPreview, isLoading }: CertificateActionsProps) => {
  return (
    <Button
      onClick={onPreview}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? 'جاري التحميل...' : 'معاينة الشهادة'}
    </Button>
  );
};