
import { RequestsHeader } from "./RequestsHeader";
import { RequestsTable } from "../RequestsTable";

interface OutgoingRequestsTabProps {
  requests: any[];
  isLoading: boolean;
  error: string | null;
  onViewRequest: (request: any) => void;
}

export const OutgoingRequestsTab = ({
  requests,
  isLoading,
  error,
  onViewRequest
}: OutgoingRequestsTabProps) => {
  return (
    <div>
      <RequestsHeader title="الطلبات الصادرة" error={error} />
      <RequestsTable
        requests={requests || []}
        isLoading={isLoading}
        type="outgoing"
        onViewRequest={onViewRequest}
      />
    </div>
  );
};
