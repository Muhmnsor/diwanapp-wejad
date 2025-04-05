
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Trash, Edit, Eye, EyeOff } from "lucide-react";
import { AccountForm } from "./accounts/AccountForm";
import { useAccounts } from "@/hooks/accounting/useAccounts";

export const ChartOfAccounts = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<null | any>(null);
  
  const { accounts, isLoading, error } = useAccounts();
  
  const filteredAccounts = accounts?.filter(account => 
    account.name.includes(searchTerm) || 
    account.code.includes(searchTerm)
  ) || [];

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setShowForm(true);
  };

  const handleEditAccount = (account: any) => {
    setSelectedAccount(account);
    setShowForm(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">شجرة الحسابات</h2>
        </div>
        <Button onClick={handleAddAccount} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة حساب
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-right">
              {selectedAccount ? "تعديل حساب" : "إضافة حساب جديد"}
            </CardTitle>
            <CardDescription className="text-right">
              {selectedAccount ? "قم بتعديل بيانات الحساب" : "أدخل بيانات الحساب الجديد"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountForm 
              account={selectedAccount}
              onCancel={() => setShowForm(false)}
              onSuccess={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-right">دليل الحسابات</CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="بحث عن حساب..."
                className="pl-8 w-[200px] md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <p>جاري تحميل البيانات...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-red-500">حدث خطأ أثناء تحميل البيانات</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground mb-4">لا توجد حسابات مسجلة بعد</p>
              <Button onClick={handleAddAccount} variant="outline">
                إضافة حساب جديد
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رمز الحساب</TableHead>
                    <TableHead className="text-right">اسم الحساب</TableHead>
                    <TableHead className="text-right">نوع الحساب</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.code}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>{account.account_type}</TableCell>
                      <TableCell>
                        {account.is_active ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                            نشط
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                            غير نشط
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditAccount(account)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            <Trash className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            {account.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
