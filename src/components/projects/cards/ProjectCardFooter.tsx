import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface ProjectCardFooterProps {
  projectId: string;
}

export const ProjectCardFooter = ({ projectId }: ProjectCardFooterProps) => {
  return (
    <CardFooter className="p-4 pt-0">
      <Button asChild className="w-full" size="sm">
        <Link to={`/projects/${projectId}`}>عرض التفاصيل</Link>
      </Button>
    </CardFooter>
  );
};