
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface DistributionItem {
  id: string;
  distributed_by_user?: { display_name: string };
  distributed_to_user?: { display_name: string };
  distributed_to_department?: string;
  distribution_date: string;
  status: string;
  instructions?: string;
  response_text?: string | null;
  response_deadline?: string | null;
  response_date?: string | null;
  is_read: boolean;
  read_at?: string | null;
}

interface DistributionListProps {
  distributions: DistributionItem[];
}

export const DistributionList: React.FC<DistributionListProps> = ({ distributions }) => {
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy - HH:mm', { locale: ar });
    } catch {
      return dateStr;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: ar });
    } catch {
      return dateStr;
    }
  };

  const getDistributionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">مكتمل</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">قيد الانتظار</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">قيد المعالجة</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">مرفوض</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (distributions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لم يتم توزيع هذه المعاملة بعد
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {distributions.map((distribution) => (
        <div key={distribution.id} className="border rounded-md p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-medium flex items-center">
                <User className="h-4 w-4 ml-1" />
                {distribution.distributed_to_user?.display_name || "مستخدم"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {distribution.distributed_to_department && (
                  <span className="ml-2">{distribution.distributed_to_department}</span>
                )}
              </p>
            </div>
            <div>
              {getDistributionStatusBadge(distribution.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm mb-3">
            <div className="flex justify-between">
              <span className="text-gray-600">تاريخ التوزيع:</span>
              <span>{formatDateTime(distribution.distribution_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">وزعت بواسطة:</span>
              <span>{distribution.distributed_by_user?.display_name || "-"}</span>
            </div>
            {distribution.response_deadline && (
              <div className="flex justify-between">
                <span className="text-gray-600">الموعد النهائي للرد:</span>
                <span>{formatDate(distribution.response_deadline)}</span>
              </div>
            )}
            {distribution.response_date && (
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ الرد:</span>
                <span>{formatDateTime(distribution.response_date)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">حالة القراءة:</span>
              <span>
                {distribution.is_read ? (
                  <span className="text-green-600">تمت القراءة {distribution.read_at ? `(${formatDateTime(distribution.read_at)})` : ""}</span>
                ) : (
                  <span className="text-amber-600">لم تتم القراءة</span>
                )}
              </span>
            </div>
          </div>

          {distribution.instructions && (
            <div className="mb-3">
              <h5 className="text-sm font-medium mb-1">التعليمات:</h5>
              <div className="p-2 bg-gray-50 rounded border text-sm">
                {distribution.instructions}
              </div>
            </div>
          )}

          {distribution.response_text && (
            <div>
              <h5 className="text-sm font-medium mb-1">الرد:</h5>
              <div className="p-2 bg-blue-50 rounded border text-sm">
                {distribution.response_text}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
