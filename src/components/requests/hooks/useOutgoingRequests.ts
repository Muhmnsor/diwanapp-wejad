
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";

export const useOutgoingRequests = () => {
  const { user } = useAuthStore();
  
  const fetchOutgoingRequests = async () => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      console.log("Fetching outgoing requests for user:", user.id);
      
      try {
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_user_outgoing_requests', {
            p_user_id: user.id
          });
        
        if (!rpcError && rpcData) {
          console.log(`Fetched ${rpcData.length} outgoing requests via RPC`);
          
          const requestTypeIds = rpcData.map(req => req.request_type_id);
          const { data: requestTypes } = await supabase
            .from("request_types")
            .select("id, name")
            .in("id", requestTypeIds);
            
          const typeMap = Object.fromEntries(
            (requestTypes || []).map(type => [type.id, type])
          );
          
          const enrichedData = rpcData.map(req => ({
            ...req,
            request_type: typeMap[req.request_type_id] || { name: "Unknown" }
          }));
          
          return enrichedData;
        }
        
        console.error("RPC method failed:", rpcError);
      } catch (rpcErr) {
        console.error("Error using RPC method:", rpcErr);
      }
      
      console.log("Falling back to direct query for outgoing requests");
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          request_type:request_types(name)
        `)
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching outgoing requests:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        return [];
      }
      
      console.log(`Fetched ${data?.length || 0} outgoing requests via direct query`);
      return data || [];
    } catch (error) {
      console.error("Error in fetchOutgoingRequests:", error);
      return [];
    }
  };

  const { 
    data: outgoingRequests, 
    isLoading: outgoingLoading, 
    refetch: refetchOutgoingRequests 
  } = useQuery({
    queryKey: ["requests", "outgoing"],
    queryFn: fetchOutgoingRequests,
    enabled: !!user
  });

  return { outgoingRequests, outgoingLoading, refetchOutgoingRequests };
};
