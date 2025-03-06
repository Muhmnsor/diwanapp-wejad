
import { UserAchievement } from "../hooks/useUserPerformanceReport";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Award, Star, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserAchievementsListProps {
  achievements: UserAchievement[];
}

export const UserAchievementsList = ({ achievements }: UserAchievementsListProps) => {
  // Get achievement icon based on type
  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'completion':
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 'performance':
        return <Star className="h-8 w-8 text-purple-500" />;
      case 'quality':
        return <Award className="h-8 w-8 text-blue-500" />;
      default:
        return <Star className="h-8 w-8 text-green-500" />;
    }
  };
  
  if (achievements.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-muted-foreground">لا توجد إنجازات حتى الآن</h3>
        <p className="text-sm text-muted-foreground mt-1">أكمل المزيد من المهام لإكتساب الإنجازات</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {achievements.map((achievement) => (
        <Card key={achievement.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getAchievementIcon(achievement.achievement_type)}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{achievement.achievement_title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {achievement.achievement_type === 'completion' ? 'إكمال' : 
                     achievement.achievement_type === 'performance' ? 'أداء' : 
                     achievement.achievement_type === 'quality' ? 'جودة' : 'إنجاز'}
                  </Badge>
                </div>
                
                {achievement.achievement_description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {achievement.achievement_description}
                  </p>
                )}
                
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(achievement.achieved_at).toLocaleDateString('ar-SA')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
