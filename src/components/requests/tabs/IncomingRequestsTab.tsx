
import { RequestsHeader } from "./RequestsHeader";
import { RequestsTable } from "../RequestsTable";

interface IncomingRequestsTabProps {
  requests: any[];
  isLoading: boolean;
  error: string | null;
  onViewRequest: (request: any) => void;
}

export const IncomingRequestsTab = ({
  requests,
  isLoading,
  error,
  onViewRequest
}: IncomingRequestsTabProps) => {
  return (
    <div>
      <RequestsHeader title="الطلبات الواردة" error={error} />
      <RequestsTable
        requests={requests || []}
        isLoading={isLoading}
        type="incoming"
        onViewRequest={onViewRequest}
        onApproveRequest={(request) => onViewRequest(request)}
        onRejectRequest={(request) => onViewRequest(request)}
      />
    </div>
  );
};
