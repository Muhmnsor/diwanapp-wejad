
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ContractExpiry {
  id: string;
  employeeName: string;
  expiryDate: string;
  daysRemaining: number;
  contractType: string;
}

interface ContractExpiryAlertProps {
  expiringContracts: ContractExpiry[];
}

export function ContractExpiryAlert({ expiringContracts = [] }: ContractExpiryAlertProps) {
  const getSeverity = (daysRemaining: number) => {
    if (daysRemaining <= 7) return "high";
    if (daysRemaining <= 14) return "medium";
    return "low";
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>العقود المنتهية قريباً</CardTitle>
      </CardHeader>
      <CardContent>
        {expiringContracts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">لا توجد عقود منتهية خلال الشهر القادم</p>
        ) : (
          <ul className="space-y-2">
            {expiringContracts.map((contract) => (
              <li key={contract.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{contract.employeeName}</p>
                  <p className="text-sm text-muted-foreground">
                    تاريخ الانتهاء: {formatDate(contract.expiryDate)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`
                    ${getSeverity(contract.daysRemaining) === 'high' ? 'bg-red-100 text-red-800' : ''}
                    ${getSeverity(contract.daysRemaining) === 'medium' ? 'bg-amber-100 text-amber-800' : ''}
                    ${getSeverity(contract.daysRemaining) === 'low' ? 'bg-blue-100 text-blue-800' : ''}
                  `}
                >
                  {contract.daysRemaining} أيام
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
