import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface AppCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: string;
}

export const AppCard = ({ title, description, icon: Icon, href, color = "primary" }: AppCardProps) => {
  return (
    <Link to={href} className="block transition-transform hover:scale-105">
      <Card className="h-full bg-card hover:bg-secondary/10">
        <CardHeader className="space-y-2">
          <div className={`w-12 h-12 rounded-lg bg-${color}/10 flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}`} />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
};