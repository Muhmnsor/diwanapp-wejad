
import { useState } from "react";
import { useDeliverableState } from "./useDeliverableState";
import { useTemplateState } from "./useTemplateState";
import { useDiscussionState } from "./useDiscussionState";

export const useTaskButtonStates = (taskId: string) => {
  const { hasDeliverables, isLoading: deliverablesLoading } = useDeliverableState(taskId);
  const { hasTemplates, isLoading: templatesLoading } = useTemplateState(taskId);
  const { 
    hasNewDiscussion, 
    isLoading: discussionLoading, 
    resetDiscussionFlag 
  } = useDiscussionState(taskId);

  // Combined loading state
  const isLoading = deliverablesLoading || templatesLoading || discussionLoading;

  return {
    hasNewDiscussion,
    hasDeliverables,
    hasTemplates,
    isLoading,
    resetDiscussionFlag
  };
};
