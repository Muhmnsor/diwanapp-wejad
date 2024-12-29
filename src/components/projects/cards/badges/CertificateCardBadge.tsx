import { Badge } from "@/components/ui/badge";

interface CertificateCardBadgeProps {
  type: string;
}

export const CertificateCardBadge = ({ type }: CertificateCardBadgeProps) => {
  return (
    <Badge variant="secondary" className="rounded-md">
      شهادة {type === "attendance" ? "حضور" : "اجتياز"}
    </Badge>
  );
};