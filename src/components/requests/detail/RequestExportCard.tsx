
import React from "react";
import { Card } from "@/components/ui/card";
import { formatArabicDate } from "@/utils/dateUtils";
import { QRCodeSVG } from "qrcode.react";

interface RequestExportCardProps {
  request: any;
  requestType: any;
  approvals: any[];
}

// Helper to translate status to Arabic
const getStatusTranslation = (status: string): string => {
  switch (status) {
    case 'pending': return 'قيد الانتظار';
    case 'completed': return 'مكتمل';
    case 'approved': return 'تمت الموافقة';
    case 'rejected': return 'مرفوض';
    case 'in_progress': return 'قيد التنفيذ';
    case 'executed': return 'تم التنفيذ';
    case 'implementation_complete': return 'اكتمل التنفيذ';
    default: return status;
  }
};

// Header section with request basic info
const RequestHeader = ({ request, requestType }: { request: any; requestType: any }) => (
  <div className="relative bg-gradient-to-r from-primary/90 to-primary pt-6 pb-4">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
    </div>
    <div className="relative px-6 text-center text-white">
      <div className="text-xl font-bold mb-1">{request.title}</div>
      <div className="text-sm opacity-90">{requestType?.name || "نوع الطلب غير محدد"}</div>
      <div className="text-xs mt-2 opacity-80">رقم الطلب: {request.id.substring(0, 8)}</div>
    </div>
    <div className="absolute -bottom-6 left-0 right-0">
      <svg className="w-full h-6" viewBox="0 0 400 24" fill="none">
        <path d="M0 24C200 -8 400 24 400 24H0Z" fill="white"/>
      </svg>
    </div>
  </div>
);

// Request basic information
const RequestInfo = ({ request }: { request: any }) => (
  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 mb-3">
    <h3 className="font-medium text-sm text-gray-500 mb-2">معلومات الطلب</h3>
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">الحالة:</span>
        <span className="font-medium">{getStatusTranslation(request.status)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">تاريخ الإنشاء:</span>
        <span className="font-medium">{formatArabicDate(request.created_at)}</span>
      </div>
      {request.updated_at && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">آخر تحديث:</span>
          <span className="font-medium">{formatArabicDate(request.updated_at)}</span>
        </div>
      )}
    </div>
  </div>
);

// Request form data
const RequestFormData = ({ formData }: { formData: Record<string, any> }) => {
  if (!formData || Object.keys(formData).length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 mb-3">
        <h3 className="font-medium text-sm text-gray-500 mb-2">بيانات النموذج</h3>
        <p className="text-sm text-gray-500">لا توجد بيانات إضافية للطلب</p>
      </div>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 mb-3">
      <h3 className="font-medium text-sm text-gray-500 mb-2">بيانات النموذج</h3>
      <div className="space-y-1.5">
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-gray-500">{key}:</span>
            <span className="font-medium text-right max-w-[60%] break-words">
              {value !== null && value !== undefined ? String(value) : "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Approvals section
const RequestApprovals = ({ approvals }: { approvals: any[] }) => {
  if (!approvals || approvals.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 mb-3">
        <h3 className="font-medium text-sm text-gray-500 mb-2">الموافقات</h3>
        <p className="text-sm text-gray-500">لا توجد موافقات مسجلة لهذا الطلب</p>
      </div>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 mb-3">
      <h3 className="font-medium text-sm text-gray-500 mb-2">الموافقات</h3>
      <div className="space-y-3">
        {approvals.map((approval, index) => {
          const approvalStatus = 
            approval.status === 'approved' ? 'تمت الموافقة' :
            approval.status === 'rejected' ? 'مرفوض' : 'معلق';
          
          return (
            <div key={index} className="border border-gray-100 rounded-lg p-2 bg-white">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">الخطوة:</span>
                <span className="font-medium">{approval.step?.step_name || "خطوة غير معروفة"}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">المسؤول:</span>
                <span className="font-medium">{approval.approver?.display_name || approval.approver?.email || "-"}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">الحالة:</span>
                <span className="font-medium">{approvalStatus}</span>
              </div>
              {approval.approved_at && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">التاريخ:</span>
                  <span className="font-medium">{formatArabicDate(approval.approved_at)}</span>
                </div>
              )}
              {approval.comments && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-500 text-sm">ملاحظات:</span>
                  <p className="text-sm mt-1">{approval.comments}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Verification QR Code
const VerificationQRCode = ({ requestId }: { requestId: string }) => {
  const baseUrl = window.location.origin;
  const verificationUrl = `${baseUrl}/requests/verify/${requestId}`;

  return (
    <div className="bg-white/50 backdrop-blur-sm p-3 rounded-xl text-center mb-3">
      <div className="mx-auto mb-2 bg-white p-2 rounded-lg inline-block">
        <QRCodeSVG 
          value={verificationUrl}
          size={100}
          level="H"
          includeMargin={true}
        />
      </div>
      <div className="text-sm text-gray-500">للتحقق من صحة الطلب</div>
      <div className="text-xs mt-0.5 text-gray-400">يمكن التحقق من صحة هذا الطلب عن طريق مسح رمز QR أعلاه</div>
    </div>
  );
};

// Footer with export date
const ExportFooter = () => (
  <div className="text-center text-xs text-gray-500 mt-2 bg-white/50 p-2 rounded-lg">
    تم استخراج هذا المستند بتاريخ {formatArabicDate(new Date().toISOString())}
  </div>
);

export const RequestExportCard: React.FC<RequestExportCardProps> = ({ 
  request, 
  requestType, 
  approvals 
}) => {
  return (
    <Card id="request-export-card" className="max-w-md mx-auto overflow-hidden" dir="rtl">
      {/* Header */}
      <RequestHeader request={request} requestType={requestType} />
      
      {/* Content */}
      <div className="p-4 pt-6 space-y-1 bg-gradient-to-b from-gray-50/50 to-white">
        {/* Request Information */}
        <RequestInfo request={request} />
        
        {/* Form Data */}
        <RequestFormData formData={request.form_data || {}} />
        
        {/* Approvals */}
        <RequestApprovals approvals={approvals} />
        
        {/* Verification QR Code */}
        <VerificationQRCode requestId={request.id} />
        
        {/* Footer */}
        <ExportFooter />
      </div>
    </Card>
  );
};
