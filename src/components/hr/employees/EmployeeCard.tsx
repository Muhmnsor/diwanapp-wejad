
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, Phone, Clock, Edit, Trash } from "lucide-react";
import { formatDate } from "@/utils/dateTimeUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";

interface EmployeeCardProps {
  id: string;
  name: string;
  position?: string;
  department?: string;
  email?: string;
  phone?: string;
  hireDate?: string | null;
  status?: string;
  scheduleName?: string | null;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onScheduleAssign?: (id: string) => void;
}

export function EmployeeCard({
  id,
  name,
  position,
  department,
  email,
  phone,
  hireDate,
  status = "active",
  scheduleName,
  onEdit,
  onDelete,
  onScheduleAssign
}: EmployeeCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">نشط</Badge>;
      case "inactive":
        return <Badge variant="secondary">غير نشط</Badge>;
      case "suspended":
        return <Badge variant="destructive">معلق</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex flex-col h-full" dir="rtl">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold">{name}</h3>
              {position && <p className="text-sm text-muted-foreground">{position}</p>}
            </div>
            <div>{getStatusBadge()}</div>
          </div>

          <div className="space-y-2 mb-4 flex-grow">
            {department && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{department}</span>
              </div>
            )}
            
            {email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="truncate">{email}</span>
              </div>
            )}
            
            {phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span dir="ltr">{phone}</span>
              </div>
            )}
            
            {hireDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(hireDate)}</span>
              </div>
            )}

            {scheduleName ? (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{scheduleName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <Clock className="h-4 w-4" />
                <span>لم يتم تعيين جدول عمل</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => onEdit(id)}
              >
                <Edit className="h-4 w-4 ml-1" />
                تعديل
              </Button>
            )}
            
            {onScheduleAssign && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => onScheduleAssign(id)}
              >
                <Clock className="h-4 w-4 ml-1" />
                جدول العمل
              </Button>
            )}
            
            {onDelete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-none text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>حذف الموظف</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
