
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface RegistrantStats {
  id: string;
  arabic_name: string;
  email: string;
  phone: string;
  attendedActivities: number;
  totalActivities: number;
  attendancePercentage: number;
}

interface RegistrantsTableProps {
  registrantsStats: RegistrantStats[];
  isLoading: boolean;
}

export const RegistrantsTable = ({ registrantsStats, isLoading }: RegistrantsTableProps) => {
  console.log('RegistrantsTable - stats:', registrantsStats);
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-hidden border rounded-lg">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center text-gray-500">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    جاري التحميل...
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!registrantsStats?.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-hidden border rounded-lg">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-gray-500">لا يوجد مسجلين في هذا المشروع</div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-hidden border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-center py-4 text-gray-700 font-semibold">م</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">الاسم</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">البريد الإلكتروني</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">رقم الجوال</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">عدد الأنشطة التي حضرها</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">نسبة الحضور</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrantsStats.map((registrant: RegistrantStats, index: number) => (
              <TableRow 
                key={registrant.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="text-center py-4 text-gray-700">{index + 1}</TableCell>
                <TableCell className="text-center py-4 text-gray-700">{registrant.arabic_name}</TableCell>
                <TableCell className="text-center py-4 text-gray-700">{registrant.email}</TableCell>
                <TableCell className="text-center py-4 text-gray-700">{registrant.phone}</TableCell>
                <TableCell className="text-center py-4 text-gray-700">
                  {registrant.attendedActivities} من {registrant.totalActivities}
                </TableCell>
                <TableCell className="text-center py-4 w-[200px]">
                  <div className="flex items-center justify-center gap-2">
                    <Progress value={registrant.attendancePercentage} className="h-2 w-[120px]" />
                    <span className="text-sm text-gray-500">
                      {Math.round(registrant.attendancePercentage)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
