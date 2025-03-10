
import { CodeBlock } from "../../components/CodeBlock";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const CodeExamplesContent = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="api">
        <AccordionTrigger>نماذج استخدام واجهات البرمجة</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">استعلام البيانات باستخدام React Query</h4>
              <CodeBlock
                code={`import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEventsQuery = (filters = {}) => {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      let query = supabase.from('events').select('*');
      
      // تطبيق المرشحات
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.startDate) {
        query = query.gte('event_date', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('event_date', filters.endDate);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
  });
};

// استخدام الاستعلام في المكون
const EventsList = () => {
  const [filters, setFilters] = useState({
    category: null,
    startDate: null,
    endDate: null,
    status: 'active'
  });
  
  const { data: events, isLoading, error } = useEventsQuery(filters);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error.message} />;
  
  return (
    <div>
      <FilterBar filters={filters} onFilterChange={setFilters} />
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};`}
                language="typescript"
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">إدارة حالة التطبيق باستخدام Zustand</h4>
              <CodeBlock
                code={`import { create } from 'zustand';

// تعريف متجر للإخطارات
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

// إنشاء المتجر
export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notification) => 
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    })),
  
  markAsRead: (id) => 
    set((state) => {
      const updatedNotifications = state.notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      );
      
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      
      return {
        notifications: updatedNotifications,
        unreadCount
      };
    }),
  
  markAllAsRead: () => 
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    })),
  
  removeNotification: (id) => 
    set((state) => {
      const notification = state.notifications.find(n => n.id === id);
      const unreadAdjustment = notification && !notification.read ? 1 : 0;
      
      return {
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: state.unreadCount - unreadAdjustment
      };
    })
}));

// استخدام المتجر في المكونات
const NotificationBell = () => {
  const { unreadCount } = useNotificationStore();
  
  return (
    <div className="relative">
      <BellIcon className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1">
          {unreadCount}
        </span>
      )}
    </div>
  );
};

const NotificationPanel = () => {
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();
  
  return (
    <div className="notification-panel">
      <div className="flex justify-between items-center p-2">
        <h3>الإشعارات</h3>
        <button onClick={markAllAsRead}>تعيين الكل كمقروء</button>
      </div>
      
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500 p-4">لا توجد إشعارات</p>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={\`notification-item \${!notification.read ? 'unread' : ''}\`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex justify-between">
                <span>{notification.title}</span>
                <button onClick={() => removeNotification(notification.id)}>×</button>
              </div>
              <p>{notification.message}</p>
              <span className="text-xs text-gray-500">
                {formatTimeAgo(notification.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};`}
                language="typescript"
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">معالجة النماذج باستخدام React Hook Form وZod</h4>
              <CodeBlock
                code={`import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createTask } from '@/services/tasks';

// تحديد مخطط التحقق من الصحة
const taskFormSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'العنوان قصير جداً' })
    .max(100, { message: 'العنوان طويل جداً' }),
  description: z
    .string()
    .min(10, { message: 'الوصف قصير جداً' })
    .max(500, { message: 'الوصف طويل جداً' }),
  dueDate: z
    .string()
    .min(1, { message: 'تاريخ الاستحقاق مطلوب' }),
  priority: z
    .enum(['low', 'medium', 'high'], { message: 'اختر أولوية صالحة' }),
});

// استخراج نوع البيانات من المخطط
type TaskFormValues = z.infer<typeof taskFormSchema>;

export const TaskForm = ({ onSuccess }) => {
  const { toast } = useToast();
  
  // تهيئة النموذج
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
    },
  });
  
  // معالجة النموذج عند التقديم
  const onSubmit = async (data: TaskFormValues) => {
    try {
      await createTask(data);
      
      toast({
        title: 'تم إنشاء المهمة بنجاح',
        variant: 'default',
      });
      
      form.reset();
      onSuccess();
    } catch (error) {
      toast({
        title: 'فشل في إنشاء المهمة',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>العنوان</FormLabel>
              <FormControl>
                <Input {...field} placeholder="أدخل عنوان المهمة" />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الوصف</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="أدخل وصف المهمة" />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ الاستحقاق</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الأولوية</FormLabel>
              <FormControl>
                <select 
                  className="w-full p-2 border rounded" 
                  {...field}
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                </select>
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit">إنشاء المهمة</Button>
        </div>
      </form>
    </Form>
  );
};`}
                language="typescript"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="ui">
        <AccordionTrigger>نماذج مكونات واجهة المستخدم</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">مكون بطاقة إحصائية</h4>
              <CodeBlock
                code={`import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  description?: string;
  icon?: React.ReactNode;
}

export const StatCard = ({
  title,
  value,
  change,
  description,
  icon = <BarChart className="h-4 w-4 text-muted-foreground" />,
}: StatCardProps) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {change && (
          <p className="flex items-center text-xs text-muted-foreground mt-1">
            {isPositive && (
              <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
            )}
            {isNegative && (
              <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
            )}
            <span
              className={
                isPositive
                  ? "text-green-500"
                  : isNegative
                  ? "text-red-500"
                  : ""
              }
            >
              {Math.abs(change)}%
            </span>
            {description && <span className="mr-1">{description}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
};`}
                language="typescript"
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">مكون جدول بيانات</h4>
              <CodeBlock
                code={`import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search
} from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: any[];
  data: TData[];
  searchField?: string;
  searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchField,
  searchPlaceholder = "بحث...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-4">
      {searchField && (
        <div className="flex items-center border rounded-md px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  لا توجد نتائج
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 space-x-reverse">
        <div className="text-sm text-muted-foreground">
          صفحة {table.getState().pagination.pageIndex + 1} من{" "}
          {table.getPageCount()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
`}
                language="typescript"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
