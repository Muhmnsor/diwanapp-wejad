import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox, Send, FilePlus, Search, FileText, BarChart } from "lucide-react";
import { useState } from "react";

// سنقوم بإنشاء هذا المكون لاحقاً
const CorrespondenceAppCard = ({
  title,
  description,
  icon: Icon,
  onClick
}: {
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
}) => {
  return (
    <Card 
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center"
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-4 w-full">
        <div className="w-full flex justify-center">
          <Icon className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </Card>
  );
};

const IncomingOutgoingMail = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");

  const handleCardClick = (feature: string) => {
    setActiveTab(feature);
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">نظام الصادر والوارد</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
          <TabsList className="grid grid-cols-6 w-full mb-8">
            <TabsTrigger value="overview">الرئيسية</TabsTrigger>
            <TabsTrigger value="incoming">الوارد</TabsTrigger>
            <TabsTrigger value="outgoing">الصادر</TabsTrigger>
            <TabsTrigger value="letters">الخطابات الرسمية</TabsTrigger>
            <TabsTrigger value="search">البحث والأرشفة</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CorrespondenceAppCard
                title="الوارد"
                description="تسجيل وإدارة الخطابات الواردة"
                icon={Inbox}
                onClick={() => handleCardClick("incoming")}
              />
              <CorrespondenceAppCard
                title="الصادر"
                description="إنشاء وإدارة الخطابات الصادرة"
                icon={Send}
                onClick={() => handleCardClick("outgoing")}
              />
              <CorrespondenceAppCard
                title="الخطابات الرسمية"
                description="إنشاء وإدارة قوالب الخطابات الرسمية"
                icon={FileText}
                onClick={() => handleCardClick("letters")}
              />
              <CorrespondenceAppCard
                title="إنشاء خطاب جديد"
                description="إنشاء خطاب رسمي جديد باستخدام القوالب"
                icon={FilePlus}
                onClick={() => handleCardClick("letters")}
              />
              <CorrespondenceAppCard
                title="البحث والأرشفة"
                description="البحث في الخطابات وإدارة الأرشيف"
                icon={Search}
                onClick={() => handleCardClick("search")}
              />
              <CorrespondenceAppCard
                title="التقارير والإحصائيات"
                description="عرض تقارير وإحصائيات المراسلات"
                icon={BarChart}
                onClick={() => handleCardClick("reports")}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="incoming">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">إدارة الوارد</h2>
              <p className="text-gray-500">هنا سيتم عرض الخطابات الواردة وإمكانية تسجيل معاملات واردة جديدة</p>
              <div className="mt-6 text-center">
                <p className="text-gray-400">سيتم تطوير هذه الوظيفة قريباً</p>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="outgoing">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">إدارة الصادر</h2>
              <p className="text-gray-500">هنا سيتم عرض الخطابات الصادرة وإمكانية إنشاء معاملات صادرة جديدة</p>
              <div className="mt-6 text-center">
                <p className="text-gray-400">سيتم تطوير هذه الوظيفة قريباً</p>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="letters">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">إدارة الخطابات الرسمية</h2>
              <p className="text-gray-500">هنا سيتم عرض قوالب الخطابات وإمكانية إنشاء خطابات رسمية جديدة</p>
              <div className="mt-6 text-center">
                <p className="text-gray-400">سيتم تطوير هذه الوظيفة قريباً</p>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="search">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">البحث والأرشفة</h2>
              <p className="text-gray-500">هنا يمكن البحث عن المراسلات وإدارة الأرشيف</p>
              <div className="mt-6 text-center">
                <p className="text-gray-400">سيتم تطوير هذه الوظيفة قريباً</p>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">التقارير والإحصائيات</h2>
              <p className="text-gray-500">هنا سيتم عرض تقارير وإحصائيات حول المراسلات</p>
              <div className="mt-6 text-center">
                <p className="text-gray-400">سيتم تطوير هذه الوظيفة قريباً</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default IncomingOutgoingMail;

