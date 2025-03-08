
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopPerformerCard } from "./TopPerformerCard";
import { PerformanceCategory } from "../hooks/useTopPerformers";

interface CategoryPerformersCardProps {
  category: PerformanceCategory;
  metric: 'completion' | 'onTime' | 'speed' | 'productivity' | 'achievements';
}

export const CategoryPerformersCard = ({ category, metric }: CategoryPerformersCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{category.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{category.description}</p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-3">
          {category.performers.map((performer, index) => (
            <TopPerformerCard 
              key={performer.id} 
              performer={performer} 
              metric={metric}
              showRank={true}
              size={index === 0 ? 'md' : 'sm'}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
