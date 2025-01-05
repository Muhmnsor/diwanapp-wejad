import { CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectCardHeaderProps {
  title: string;
}

export const ProjectCardHeader = ({ title }: ProjectCardHeaderProps) => {
  return (
    <CardHeader className="p-4">
      <CardTitle className="text-lg line-clamp-2 text-right">{title}</CardTitle>
    </CardHeader>
  );
};