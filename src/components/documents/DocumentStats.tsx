
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Document {
  status: string;
}

interface DocumentStatsProps {
  documents: Document[];
}

export const DocumentStats = ({ documents }: DocumentStatsProps) => {
  return (
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
  );
};
