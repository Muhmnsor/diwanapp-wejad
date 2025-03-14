
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Filter, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LogEntry {
  id: string;
  operation_type: string;
  created_at: string;
  user_name: string;
  user_email: string;
  request_type_id: string;
  request_type_name: string;
  workflow_id: string;
  workflow_name: string;
  step_id: string;
  step_name: string;
  request_data: any;
  response_data: any;
  error_message: string | null;
  details: string | null;
}

export const WorkflowDebugPanel = () => {
  const [operationType, setOperationType] = useState<string>("");
  const [limit, setLimit] = useState<number>(50);
  const [expandedLogs, setExpandedLogs] = useState<string[]>([]);

  const { data: logs, isLoading, refetch, isError, error: queryError } = useQuery({
    queryKey: ["workflowLogs", operationType, limit],
    queryFn: async () => {
      let query = supabase
        .from("request_workflow_operations_view") // استخدام اسم العرض الصحيح
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (operationType) {
        query = query.ilike("operation_type", `%${operationType}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as LogEntry[];
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  const handleRefresh = () => {
    refetch();
  };

  const toggleLogExpansion = (logId: string) => {
    if (expandedLogs.includes(logId)) {
      setExpandedLogs(expandedLogs.filter(id => id !== logId));
    } else {
      setExpandedLogs([...expandedLogs, logId]);
    }
  };

  const downloadLogs = () => {
    if (!logs) return;
    
    const jsonString = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getOperationTypeBadgeColor = (type: string) => {
    if (type.includes("error")) return "bg-red-100 text-red-800 border-red-200";
    if (type.includes("success")) return "bg-green-100 text-green-800 border-green-200";
    if (type.includes("attempt")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (type.includes("validation")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>سجلات تتبع سير العمل</CardTitle>
        <CardDescription>عرض سجلات تتبع عمليات إنشاء وتعديل مسارات العمل للمساعدة في تشخيص المشاكل</CardDescription>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <div className="flex-1">
            <Input
              placeholder="تصفية حسب نوع العملية"
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
            />
          </div>
          <Select
            value={limit.toString()}
            onValueChange={(value) => setLimit(parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="عدد النتائج" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20 سجل</SelectItem>
              <SelectItem value="50">50 سجل</SelectItem>
              <SelectItem value="100">100 سجل</SelectItem>
              <SelectItem value="200">200 سجل</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
          
          <Button variant="outline" onClick={downloadLogs}>
            <Download className="h-4 w-4 ml-2" />
            تنزيل
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-60 w-full" />
        ) : isError ? (
          <div className="p-6 text-center bg-red-50 border border-red-200 rounded-md">
            <h3 className="font-medium text-red-800 mb-2">حدث خطأ أثناء تحميل السجلات</h3>
            <p className="text-sm text-red-600">{(queryError as Error)?.message || "قد يكون الجدول أو الوظيفة غير موجودة بعد. قم بتنفيذ الكود SQL لإنشاء سجلات التتبع."}</p>
            <Button 
              variant="destructive"
              className="mt-4"
              onClick={handleRefresh}
            >
              إعادة المحاولة
            </Button>
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              تم العثور على {logs.length} سجل
            </div>
            
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-md overflow-hidden"
                >
                  <div 
                    className="flex flex-wrap justify-between items-center p-3 cursor-pointer hover:bg-muted"
                    onClick={() => toggleLogExpansion(log.id)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedLogs.includes(log.id) ? (
                        <ChevronUp className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                      )}
                      <span className={`px-2 py-1 text-xs border rounded ${getOperationTypeBadgeColor(log.operation_type)}`}>
                        {log.operation_type}
                      </span>
                      <span className="text-sm">
                        {log.details || log.error_message || "بدون تفاصيل"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mr-2">
                      {formatDateTime(log.created_at)}
                    </div>
                  </div>
                  
                  {expandedLogs.includes(log.id) && (
                    <div className="p-3 border-t bg-muted/50">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="space-y-1">
                          <dt className="font-medium">المستخدم:</dt>
                          <dd>{log.user_name || log.user_email || "غير معروف"}</dd>
                        </div>
                        
                        {log.request_type_name && (
                          <div className="space-y-1">
                            <dt className="font-medium">نوع الطلب:</dt>
                            <dd>{log.request_type_name}</dd>
                          </div>
                        )}
                        
                        {log.workflow_name && (
                          <div className="space-y-1">
                            <dt className="font-medium">مسار العمل:</dt>
                            <dd>{log.workflow_name}</dd>
                          </div>
                        )}
                        
                        {log.step_name && (
                          <div className="space-y-1">
                            <dt className="font-medium">خطوة سير العمل:</dt>
                            <dd>{log.step_name}</dd>
                          </div>
                        )}
                        
                        {log.error_message && (
                          <div className="space-y-1 col-span-2">
                            <dt className="font-medium">رسالة الخطأ:</dt>
                            <dd className="text-red-600">{log.error_message}</dd>
                          </div>
                        )}
                        
                        {(log.request_data || log.response_data) && (
                          <div className="col-span-2 mt-2">
                            <Accordion type="single" collapsible className="w-full">
                              {log.request_data && (
                                <AccordionItem value="request-data">
                                  <AccordionTrigger>بيانات الطلب</AccordionTrigger>
                                  <AccordionContent>
                                    <pre className="text-xs bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto max-h-80 whitespace-pre-wrap">
                                      {JSON.stringify(log.request_data, null, 2)}
                                    </pre>
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                              
                              {log.response_data && (
                                <AccordionItem value="response-data">
                                  <AccordionTrigger>بيانات الاستجابة</AccordionTrigger>
                                  <AccordionContent>
                                    <pre className="text-xs bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto max-h-80 whitespace-pre-wrap">
                                      {JSON.stringify(log.response_data, null, 2)}
                                    </pre>
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                            </Accordion>
                          </div>
                        )}
                        
                        <div className="col-span-2 mt-2 text-xs text-muted-foreground">
                          <div>رقم السجل: {log.id}</div>
                          {log.workflow_id && <div>معرف مسار العمل: {log.workflow_id}</div>}
                          {log.request_type_id && <div>معرف نوع الطلب: {log.request_type_id}</div>}
                          {log.step_id && <div>معرف الخطوة: {log.step_id}</div>}
                        </div>
                      </dl>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              لا توجد سجلات تتبع مطابقة لمعايير البحث
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
