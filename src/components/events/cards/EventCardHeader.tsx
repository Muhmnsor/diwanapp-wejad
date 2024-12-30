import { CardHeader, CardTitle } from "@/components/ui/card";

interface EventCardHeaderProps {
  title: string;
}

export const EventCardHeader = ({ title }: EventCardHeaderProps) => {
  return (
    <CardHeader className="p-4">
      <CardTitle className="text-lg line-clamp-2 text-right">{title}</CardTitle>
    </CardHeader>
  );
};