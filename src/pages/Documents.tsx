import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { FileText, Archive, Filter, Download, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";

// بيانات تجريبية للمستندات
const documents = [
  {
    id: 1,
    name: "رخصة تشغيل",
    type: "رخصة",
    expiryDate: "2024-12-31",
    status: "ساري",
    issuer: "وزارة التجارة"
  },
  {
    id: 2,
    name: "شهادة السعودة",
    type: "شهادة",
    expiryDate: "2024-06-15",
    status: "قريب من الانتهاء",
    issuer: "وزارة الموارد البشرية"
  },
  {
    id: 3,
    name: "سجل تجاري",
    type: "سجل",
    expiryDate: "2024-03-01",
    status: "منتهي",
    issuer: "وزارة التجارة"
  },
  {
    id: 4,
    name: "شهادة الزكاة",
    type: "شهادة",
    expiryDate: "2024-08-30",
    status: "ساري",
    issuer: "هيئة الزكاة والضريبة والجمارك"
  },
  {
    id: 5,
    name: "شهادة التأمينات",
    type: "شهادة",
    expiryDate: "2024-05-15",
    status: "قريب من الانتهاء",
    issuer: "المؤسسة العامة للتأمينات الاجتماعية"
  },
  {
    id: 6,
    name: "ترخيص الدفاع المدني",
    type: "ترخيص",
    expiryDate: "2024-11-20",
    status: "ساري",
    issuer: "المديرية العامة للدفاع المدني"
  },
  {
    id: 7,
    name: "رخصة البلدية",
    type: "رخصة",
    expiryDate: "2024-02-28",
    status: "منتهي",
    issuer: "أمانة المنطقة"
  },
  {
    id: 8,
    name: "شهادة الغرفة التجارية",
    type: "شهادة",
    expiryDate: "2024-09-10",
    status: "ساري",
    issuer: "الغرفة التجارية"
  }
];

const Documents = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ساري":
        return "text-green-600";
      case "قريب من الانتهاء":
        return "text-yellow-600";
      case "منتهي":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getRemainingDays = (expiryDate: string) => {
    const remaining = differenceInDays(new Date(expiryDate), new Date());
    return remaining;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="documents" dir="rtl" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>المستندات</span>
            </TabsTrigger>
            <TabsTrigger value="archive" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              <span>الأرشيف</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-6">
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المستندات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documents.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">المستندات السارية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {documents.filter(d => d.status === "ساري").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">قريبة من الانتهاء</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {documents.filter(d => d.status === "قريب من الانتهاء").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">المستندات المنتهية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {documents.filter(d => d.status === "منتهي").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث في المستندات..."
                  className="pl-10 w-full"
                  dir="rtl"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                تصفية
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                تصدير
              </Button>
            </div>

            {/* Documents Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم المستند</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                    <TableHead className="text-right">الأيام المتبقية</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">جهة الإصدار</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell dir="ltr" className="text-right">
                        {format(new Date(doc.expiryDate), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {getRemainingDays(doc.expiryDate)} يوم
                      </TableCell>
                      <TableCell className={getStatusColor(doc.status)}>
                        {doc.status}
                      </TableCell>
                      <TableCell>{doc.issuer}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="archive" className="mt-6">
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Archive className="w-16 h-16 text-primary" />
              <h1 className="text-2xl font-bold text-primary text-center">قيد التطوير - الأرشيف</h1>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Documents;
