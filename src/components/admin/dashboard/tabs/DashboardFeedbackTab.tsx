import { FeedbackHeader } from "@/components/projects/dashboard/feedback/FeedbackHeader";
import { FeedbackList } from "@/components/projects/dashboard/feedback/FeedbackList";
import { EmptyFeedbackState } from "@/components/projects/dashboard/feedback/EmptyFeedbackState";
import { LoadingState } from "@/components/projects/dashboard/feedback/LoadingState";
import { useFeedbackQuery } from "@/components/projects/dashboard/feedback/useFeedbackQuery";

interface DashboardFeedbackTabProps {
  projectId: string;
}

export const DashboardFeedbackTab = ({ projectId }: DashboardFeedbackTabProps) => {
  console.log('DashboardFeedbackTab - Initializing with projectId:', projectId);
  
  const { data: activitiesFeedback, isLoading } = useFeedbackQuery(projectId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!activitiesFeedback || activitiesFeedback.length === 0) {
    return <EmptyFeedbackState />;
  }

  return (
    <div className="space-y-6">
      <FeedbackHeader />
      <FeedbackList activities={activitiesFeedback} />
    </div>
  );
};