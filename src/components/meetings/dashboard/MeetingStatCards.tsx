
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, Clock, CheckCircle } from "lucide-react";

interface MeetingStatsProps {
  totalMeetings: number;
  upcomingMeetings: number;
  inProgressMeetings: number;
  completedMeetings: number;
  averageAttendance?: number;
  isLoading: boolean;
}

export const MeetingStatCards: React.FC<MeetingStatsProps> = ({
  totalMeetings,
  upcomingMeetings,
  inProgressMeetings,
  completedMeetings,
  averageAttendance,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-8 mb-4" />
              <Skeleton className="h-7 w-32 mb-2" />
              <Skeleton className="h-10 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "إجمالي الاجتماعات",
      value: totalMeetings,
      icon: <Calendar className="h-8 w-8 text-blue-500" />
    },
    {
      title: "الاجتماعات القادمة",
      value: upcomingMeetings,
      icon: <Clock className="h-8 w-8 text-amber-500" />
    },
    {
      title: "الاجتماعات الجارية",
      value: inProgressMeetings,
      icon: <Users className="h-8 w-8 text-purple-500" />
    },
    {
      title: "الاجتماعات المكتملة",
      value: completedMeetings,
      icon: <CheckCircle className="h-8 w-8 text-green-500" />
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="mb-4">{stat.icon}</div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
      
      {typeof averageAttendance === 'number' && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <Users className="h-8 w-8 text-teal-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">معدل حضور المشاركين</h3>
            <p className="text-2xl font-bold">{averageAttendance.toFixed(0)}%</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
