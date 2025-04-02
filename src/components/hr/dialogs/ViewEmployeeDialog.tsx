
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ViewEmployeeDialogProps {
  id?: string;
  employee: any;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ViewEmployeeDialog({ id, employee, isOpen, onClose }: ViewEmployeeDialogProps) {
  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>تفاصيل الموظف: {employee.full_name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="mb-2 font-medium">المعلومات الأساسية</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">الاسم الكامل:</dt>
                  <dd className="text-sm text-gray-900">{employee.full_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">المسمى الوظيفي:</dt>
                  <dd className="text-sm text-gray-900">{employee.position}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">القسم:</dt>
                  <dd className="text-sm text-gray-900">{employee.department}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">رقم الموظف:</dt>
                  <dd className="text-sm text-gray-900">{employee.employee_number || '-'}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="mb-2 font-medium">معلومات التواصل</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">البريد الإلكتروني:</dt>
                  <dd className="text-sm text-gray-900">{employee.email || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">رقم الهاتف:</dt>
                  <dd className="text-sm text-gray-900">{employee.phone || '-'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="mb-2 font-medium">معلومات التوظيف</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">تاريخ التعيين:</dt>
                <dd className="text-sm text-gray-900">
                  {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString("ar-SA") : '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">نوع العقد:</dt>
                <dd className="text-sm text-gray-900">{employee.contract_type || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">تاريخ انتهاء العقد:</dt>
                <dd className="text-sm text-gray-900">
                  {employee.contract_end_date ? new Date(employee.contract_end_date).toLocaleDateString("ar-SA") : '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">الحالة:</dt>
                <dd className="text-sm text-gray-900">
                  {employee.status === 'active' ? 'يعمل' : 'منتهي'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
