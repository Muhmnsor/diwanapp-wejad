
import { useIncomingRequests } from "./useIncomingRequests";
import { useOutgoingRequests } from "./useOutgoingRequests";
import { useCreateRequest } from "./useCreateRequest";
import { useRequestActions } from "./useRequestActions";

export const useRequests = () => {
  const { incomingRequests, incomingLoading } = useIncomingRequests();
  const { outgoingRequests, outgoingLoading, refetchOutgoingRequests } = useOutgoingRequests();
  const { createRequest } = useCreateRequest();
  const { approveRequest, rejectRequest } = useRequestActions();

  return {
    incomingRequests,
    outgoingRequests,
    incomingLoading,
    outgoingLoading,
    refetchOutgoingRequests,
    createRequest,
    approveRequest,
    rejectRequest
  };
};
