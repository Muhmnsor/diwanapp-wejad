
import { useState } from "react";
import { useIncomingRequests } from "../../hooks/useIncomingRequests";
import { IncomingRequestsList } from "./IncomingRequestsList";
import { RequestDetails } from "./RequestDetails";
import { Request } from "../../types/request.types";

export const IncomingRequestsPage = () => {
  const { incomingRequests, isLoading, refetch } = useIncomingRequests();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const handleViewRequest = (request: Request) => {
    setSelectedRequestId(request.id);
  };

  const handleApproveRequest = (request: Request) => {
    setSelectedRequestId(request.id);
  };

  const handleRejectRequest = (request: Request) => {
    setSelectedRequestId(request.id);
  };

  const handleCloseDetails = () => {
    setSelectedRequestId(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">الطلبات الواردة</h2>
        <p className="text-muted-foreground">إدارة الطلبات التي تحتاج إلى موافقتك</p>
      </div>

      {selectedRequestId ? (
        <RequestDetails 
          requestId={selectedRequestId}
          onClose={handleCloseDetails}
        />
      ) : (
        <IncomingRequestsList
          requests={incomingRequests}
          isLoading={isLoading}
          onViewRequest={handleViewRequest}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
        />
      )}
    </div>
  );
};
