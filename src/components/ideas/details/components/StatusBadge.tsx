
import React from "react";
import { useIdeaStatusUpdater } from "../hooks/useIdeaStatusUpdater";
import { StatusDisplay } from "./StatusDisplay";

interface StatusBadgeProps {
  status: string;
  ideaId?: string;
  discussionPeriod?: string;
  createdAt?: string;
}

export const StatusBadge = ({ 
  status: initialStatus,
  ideaId,
  discussionPeriod,
  createdAt
}: StatusBadgeProps) => {
  const { status } = useIdeaStatusUpdater({
    ideaId,
    initialStatus,
    discussionPeriod,
    createdAt
  });
  
  return <StatusDisplay status={status} />;
};
