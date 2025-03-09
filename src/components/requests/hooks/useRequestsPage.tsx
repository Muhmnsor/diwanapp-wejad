
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useRequests } from "@/components/requests/hooks/useRequests";
import { supabase } from "@/integrations/supabase/client";
import { RequestType } from "@/components/requests/types";
import { toast } from "sonner";

export const useRequestsPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "incoming";
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | null>(null);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState<boolean>(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const navigate = useNavigate();
  
  const { 
    incomingRequests, 
    outgoingRequests, 
    incomingLoading, 
    outgoingLoading,
    createRequest,
    isUploading,
    uploadProgress,
    submissionSuccess,
    detailedError,
    submissionStep,
    refetchRequests
  } = useRequests();

  // Fetch data function for manual refresh
  const fetchData = useCallback(() => {
    setError(null);
    refetchRequests();
  }, [refetchRequests]);

  // Check session on mount with retry mechanism
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    const checkSession = async () => {
      try {
        setAuthChecking(true);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check error:", sessionError);
          setError("حدث خطأ أثناء التحقق من حالة تسجيل الدخول");
          
          // Retry logic
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(checkSession, retryDelay * Math.pow(2, retryCount));
            return;
          }
        }
        
        if (!session) {
          console.log("No active session");
          setError("يرجى تسجيل الدخول لاستخدام نظام الطلبات");
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setError("حدث خطأ غير متوقع");
        
        // Retry logic
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkSession, retryDelay * Math.pow(2, retryCount));
          return;
        }
      } finally {
        setAuthChecking(false);
      }
    };
    
    checkSession();
  }, []);

  useEffect(() => {
    // If we have a detailed error from the request creation process, show it
    if (detailedError) {
      // Check for recursion error and provide a more user-friendly message
      if (detailedError.includes("recursion") || detailedError.includes("deadlock")) {
        setError("حدث خطأ في نظام الصلاحيات. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.");
      } else {
        setError(detailedError);
      }
    }
  }, [detailedError]);

  const handleNewRequest = () => {
    setShowNewRequestDialog(false);
    setSelectedRequestType(null);
    setError(null);
  };

  const handleSelectRequestType = (requestType: RequestType) => {
    setSelectedRequestType(requestType);
    setShowNewRequestDialog(true);
    setError(null);
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
    setError(null);
  };

  const handleCreateRequest = (formData: any) => {
    if (!user) {
      setError("يجب تسجيل الدخول لإنشاء طلب جديد");
      return;
    }
    
    // Ensure the requester_id is set to the current user's ID
    formData.requester_id = user.id;
    
    setError(null);
    createRequest.mutate(formData, {
      onSuccess: () => {
        toast.success("تم إنشاء الطلب بنجاح");
        // Don't close dialog immediately to allow user to see success message
        setTimeout(() => {
          handleNewRequest();
        }, 2000);
      },
      onError: (err: any) => {
        console.error("Error creating request:", err);
        
        // Handle specific errors
        if (err.message?.includes('recursion') || err.message?.includes('deadlock')) {
          setError("حدث خطأ في النظام. يرجى المحاولة مرة أخرى لاحقاً.");
          // Attempt to refresh the cache
          fetchData();
        } else if (err.message?.includes('violates row-level security policy')) {
          setError("خطأ في الصلاحيات: تأكد من تسجيل الدخول وأن لديك صلاحية إنشاء الطلبات");
        } else if (err.message?.includes('infinite recursion')) {
          setError("حدث خطأ في النظام: تواصل مع مدير النظام (خطأ في سياسات قاعدة البيانات)");
        } else {
          setError(err.message || "حدث خطأ أثناء إنشاء الطلب");
        }
      }
    });
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequestId(request.id);
  };

  const handleCloseDetailView = () => {
    setSelectedRequestId(null);
  };

  const handleLogin = () => {
    navigate('/login', { state: { returnUrl: '/requests' } });
  };

  return {
    isAuthenticated,
    user,
    activeTab,
    selectedRequestType,
    showNewRequestDialog,
    selectedRequestId,
    error,
    authChecking,
    incomingRequests,
    outgoingRequests,
    incomingLoading,
    outgoingLoading,
    fetchData,
    createRequest,
    isUploading,
    uploadProgress,
    submissionSuccess,
    submissionStep,
    handleNewRequest,
    handleSelectRequestType,
    handleTabChange,
    handleCreateRequest,
    handleViewRequest,
    handleCloseDetailView,
    handleLogin
  };
};
