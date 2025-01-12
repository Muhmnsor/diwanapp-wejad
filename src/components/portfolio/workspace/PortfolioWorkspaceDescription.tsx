import { Card } from "@/components/ui/card";

interface PortfolioWorkspaceDescriptionProps {
  description: string | null;
}

export const PortfolioWorkspaceDescription = ({
  description
}: PortfolioWorkspaceDescriptionProps) => {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-2">الوصف</h2>
      <p className="text-gray-600">
        {description || 'لا يوجد وصف'}
      </p>
    </Card>
  );
};