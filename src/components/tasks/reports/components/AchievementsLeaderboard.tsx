
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopPerformer } from "../hooks/useTopPerformers";
import { TopPerformerCard } from "./TopPerformerCard";
import { Trophy } from "lucide-react";

interface AchievementsLeaderboardProps {
  performers: TopPerformer[];
}

export const AchievementsLeaderboard = ({ performers }: AchievementsLeaderboardProps) => {
  // Sort by achievements
  const sortedPerformers = [...performers]
    .sort((a, b) => b.stats.achievements - a.stats.achievements)
    .slice(0, 5);

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg font-semibold">لوحة الإنجازات</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">المستخدمون الأكثر تحقيقاً للإنجازات</p>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-3">
          {sortedPerformers.map((performer, index) => (
            <TopPerformerCard 
              key={performer.id} 
              performer={performer} 
              metric="achievements"
              showRank
              rank={index + 1}
              size={index === 0 ? 'md' : 'sm'}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
