
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import type { DigitalAccount } from "./DigitalAccounts";
import { PinProtectedPassword } from "./PinProtectedPassword";

interface AccountsListProps {
  accounts: DigitalAccount[];
  isLoading: boolean;
  onEdit: (account: DigitalAccount) => void;
  onDelete: (id: string) => void;
}

export const AccountsList = ({ accounts, isLoading, onEdit, onDelete }: AccountsListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        لا توجد حسابات رقمية. قم بإضافة حساب جديد.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المنصة</TableHead>
            <TableHead>اسم المستخدم</TableHead>
            <TableHead>كلمة المرور</TableHead>
            <TableHead>الملاحظات</TableHead>
            <TableHead className="text-left">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">{account.platform}</TableCell>
              <TableCell>{account.username}</TableCell>
              <TableCell>
                {account.has_password ? (
                  <PinProtectedPassword password={account.password || ""} />
                ) : (
                  <span className="text-gray-400">لا يوجد</span>
                )}
              </TableCell>
              <TableCell>{account.notes || "-"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(account.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
