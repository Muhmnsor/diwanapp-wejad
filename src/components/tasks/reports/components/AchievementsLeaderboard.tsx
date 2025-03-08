
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TopPerformer } from "../hooks/useTopPerformers";
import { Award, Star, Trophy } from "lucide-react";

interface AchievementsLeaderboardProps {
  performers: TopPerformer[];
}

export const AchievementsLeaderboard = ({ performers }: AchievementsLeaderboardProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            <span>متصدرو الإنجازات</span>
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">المستخدمون الذين حققوا أكبر عدد من الإنجازات والجوائز</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performers.map((performer, index) => (
            <div key={performer.id} className="flex items-center gap-3">
              {/* Rank icon */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {index === 0 && <Trophy className="h-6 w-6 text-amber-500" />}
                {index === 1 && <Star className="h-6 w-6 text-slate-400" />}
                {index === 2 && <Award className="h-6 w-6 text-amber-700" />}
                {index > 2 && <span className="text-lg font-bold text-gray-400">{index + 1}</span>}
              </div>
              
              {/* User avatar */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={performer.avatarUrl} alt={performer.name} />
                <AvatarFallback>{performer.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              
              {/* User info */}
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{performer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {performer.achievements} {performer.achievements === 1 ? 'إنجاز' : 'إنجازات'}
                    </p>
                  </div>
                  
                  {/* Achievement badges */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(3, performer.achievements) }).map((_, i) => (
                      <div key={i} className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                        <Star className="h-4 w-4 text-purple-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {performers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>لا توجد بيانات إنجازات حتى الآن</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
