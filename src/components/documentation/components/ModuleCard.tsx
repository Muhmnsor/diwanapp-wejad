
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  className?: string;
}

export const ModuleCard = ({
  title,
  description,
  icon,
  href = "#",
  className
}: ModuleCardProps) => {
  const content = (
    <div className={cn(
      "group relative bg-white dark:bg-gray-900 transition-all duration-200 rounded-lg border p-4 shadow-sm hover:shadow flex items-center cursor-pointer",
      className
    )}>
      <div className="flex-shrink-0 mr-4 bg-primary/10 p-2.5 rounded-lg text-primary">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-base font-medium group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {description}
        </p>
      </div>
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ChevronRight className="h-5 w-5 text-primary" />
      </div>
    </div>
  );
  
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  
  return (
    <Link to={href}>
      {content}
    </Link>
  );
};
