
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserActivity } from './types';

interface UserActivityListProps {
  userId: string;
}

export const UserActivityList: React.FC<UserActivityListProps> = ({ userId }) => {
  // This is a placeholder component that can be implemented later
  // when we have actual user activity data
  const activities: UserActivity[] = [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right">نشاطات المستخدم</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center">لا توجد نشاطات مسجلة</p>
        ) : (
          <ul className="space-y-2">
            {activities.map((activity) => (
              <li key={activity.id} className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{activity.timestamp}</span>
                  <span>{activity.activityType}</span>
                </div>
                {activity.details && <p className="text-sm mt-1">{activity.details}</p>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
