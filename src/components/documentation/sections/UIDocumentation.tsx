
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UIFeatureCard } from "../components/UIFeatureCard";

export const UIDocumentation = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>واجهة المستخدم</CardTitle>
        <CardDescription>توثيق مكونات واجهة المستخدم وتصميمها</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="components">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="components">المكونات الأساسية</TabsTrigger>
            <TabsTrigger value="layouts">أنماط التخطيط</TabsTrigger>
            <TabsTrigger value="themes">السمات والألوان</TabsTrigger>
          </TabsList>
          
          <TabsContent value="components" className="space-y-4">
            <p className="text-muted-foreground mb-4">
              تستخدم واجهة المستخدم مكونات من مكتبة Shadcn UI المبنية على Radix UI، مع تخصيصات إضافية.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <UIFeatureCard 
                title="الأزرار"
                description="مكونات الأزرار بأنواعها المختلفة"
                code={`<Button variant="default">زر أساسي</Button>
<Button variant="secondary">زر ثانوي</Button>
<Button variant="outline">زر مخطط</Button>
<Button variant="destructive">زر خطر</Button>`}
              />
              
              <UIFeatureCard 
                title="البطاقات"
                description="مكونات البطاقات لعرض المحتوى"
                code={`<Card>
  <CardHeader>
    <CardTitle>عنوان البطاقة</CardTitle>
    <CardDescription>وصف البطاقة</CardDescription>
  </CardHeader>
  <CardContent>
    محتوى البطاقة
  </CardContent>
</Card>`}
              />
              
              <UIFeatureCard 
                title="الجداول"
                description="مكونات الجداول لعرض البيانات"
                code={`<Table>
  <TableHeader>
    <TableRow>
      <TableHead>الاسم</TableHead>
      <TableHead>العمر</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>أحمد</TableCell>
      <TableCell>30</TableCell>
    </TableRow>
  </TableBody>
</Table>`}
              />
              
              <UIFeatureCard 
                title="النماذج"
                description="مكونات النماذج لإدخال البيانات"
                code={`<form onSubmit={handleSubmit}>
  <div className="space-y-2">
    <Label htmlFor="name">الاسم</Label>
    <Input id="name" />
  </div>
  <Button type="submit">إرسال</Button>
</form>`}
              />
              
              <UIFeatureCard 
                title="المنسدلات"
                description="مكونات القوائم المنسدلة"
                code={`<Select>
  <SelectTrigger>
    <SelectValue placeholder="اختر..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">الخيار الأول</SelectItem>
    <SelectItem value="2">الخيار الثاني</SelectItem>
  </SelectContent>
</Select>`}
              />
              
              <UIFeatureCard 
                title="التبويبات"
                description="مكونات التبويب لعرض المحتوى بشكل منظم"
                code={`<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">التبويب الأول</TabsTrigger>
    <TabsTrigger value="tab2">التبويب الثاني</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">محتوى التبويب الأول</TabsContent>
  <TabsContent value="tab2">محتوى التبويب الثاني</TabsContent>
</Tabs>`}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="layouts" className="space-y-4">
            <p className="text-muted-foreground mb-4">
              يستخدم النظام عدة أنماط تخطيط مختلفة حسب نوع الصفحة والمحتوى.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="overflow-hidden">
                <CardHeader className="bg-secondary/20">
                  <CardTitle className="text-lg">التخطيط العام</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="border rounded-md h-64 overflow-hidden">
                    <div className="bg-primary/20 p-2 text-center text-xs">الشريط العلوي</div>
                    <div className="flex h-[calc(100%-28px)]">
                      <div className="w-16 bg-secondary/20 text-xs text-center pt-2">
                        <div className="rotate-90">القائمة الجانبية</div>
                      </div>
                      <div className="flex-1 p-2 bg-background">
                        <div className="border border-dashed border-secondary h-full rounded flex items-center justify-center text-xs text-muted-foreground">
                          المحتوى الرئيسي
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    التخطيط الأساسي المستخدم في معظم صفحات النظام، مع شريط علوي وقائمة جانبية ومنطقة محتوى رئيسية.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="bg-secondary/20">
                  <CardTitle className="text-lg">تخطيط لوحة المعلومات</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="border rounded-md h-64 overflow-hidden">
                    <div className="bg-primary/20 p-2 text-center text-xs">الشريط العلوي</div>
                    <div className="flex h-[calc(100%-28px)]">
                      <div className="w-16 bg-secondary/20 text-xs text-center pt-2">
                        <div className="rotate-90">القائمة الجانبية</div>
                      </div>
                      <div className="flex-1 p-2 bg-background">
                        <div className="mb-2 h-8 bg-secondary/20 rounded flex items-center justify-center text-xs">
                          شريط أدوات لوحة المعلومات
                        </div>
                        <div className="grid grid-cols-2 gap-2 h-[calc(100%-32px)]">
                          <div className="border border-dashed border-secondary rounded flex items-center justify-center text-xs text-muted-foreground">
                            البطاقة 1
                          </div>
                          <div className="border border-dashed border-secondary rounded flex items-center justify-center text-xs text-muted-foreground">
                            البطاقة 2
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    تخطيط لوحة المعلومات مع بطاقات وإحصاءات ورسوم بيانية.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="bg-secondary/20">
                  <CardTitle className="text-lg">تخطيط التبويبات</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="border rounded-md h-64 overflow-hidden">
                    <div className="bg-primary/20 p-2 text-center text-xs">الشريط العلوي</div>
                    <div className="p-2 bg-background h-[calc(100%-28px)]">
                      <div className="flex gap-2 mb-2">
                        <div className="px-4 py-1.5 rounded bg-primary/10 text-xs text-center">التبويب 1</div>
                        <div className="px-4 py-1.5 rounded bg-secondary/10 text-xs text-center">التبويب 2</div>
                        <div className="px-4 py-1.5 rounded bg-secondary/10 text-xs text-center">التبويب 3</div>
                      </div>
                      <div className="border border-dashed border-secondary h-[calc(100%-32px)] rounded flex items-center justify-center text-xs text-muted-foreground">
                        محتوى التبويب
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    تخطيط يستخدم التبويبات لتنظيم المحتوى في عدة أقسام.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader className="bg-secondary/20">
                  <CardTitle className="text-lg">تخطيط صفحة الواجهة</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="border rounded-md h-64 overflow-hidden">
                    <div className="bg-primary/20 p-2 text-center text-xs">الشريط العلوي</div>
                    <div className="h-24 bg-secondary/10 flex items-center justify-center text-xs">
                      البانر الرئيسي
                    </div>
                    <div className="p-2 bg-background h-[calc(100%-28px-96px)]">
                      <div className="grid grid-cols-2 gap-2 h-full">
                        <div className="border border-dashed border-secondary rounded flex items-center justify-center text-xs text-muted-foreground">
                          بطاقة فعالية
                        </div>
                        <div className="border border-dashed border-secondary rounded flex items-center justify-center text-xs text-muted-foreground">
                          بطاقة فعالية
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    تخطيط الصفحة الرئيسية مع بانر وعرض للفعاليات والمشاريع.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="themes" className="space-y-4">
            <p className="text-muted-foreground mb-4">
              يدعم النظام السمة الفاتحة والداكنة، مع أنماط ألوان مخصصة.
            </p>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">نظام الألوان</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="h-10 rounded-md bg-primary"></div>
                      <p className="text-xs text-center">primary - اللون الأساسي</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-10 rounded-md bg-secondary"></div>
                      <p className="text-xs text-center">secondary - اللون الثانوي</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-10 rounded-md bg-accent"></div>
                      <p className="text-xs text-center">accent - لون التمييز</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-10 rounded-md bg-destructive"></div>
                      <p className="text-xs text-center">destructive - لون الخطر</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-10 rounded-md bg-background border"></div>
                      <p className="text-xs text-center">background - الخلفية</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-10 rounded-md bg-foreground"></div>
                      <p className="text-xs text-center">foreground - النص</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-10 rounded-md bg-muted"></div>
                      <p className="text-xs text-center">muted - مخفف</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-10 rounded-md bg-card border"></div>
                      <p className="text-xs text-center">card - البطاقة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">المتغيرات الأساسية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">السمة الفاتحة</h3>
                      <div className="bg-secondary/20 p-3 rounded-md text-xs font-mono overflow-auto">
                        <div><span className="text-pink-600">:root</span> {`{`}</div>
                        <div className="pl-4"><span className="text-purple-600">--background</span>: 0 0% 100%;</div>
                        <div className="pl-4"><span className="text-purple-600">--foreground</span>: 222.2 84% 4.9%;</div>
                        <div className="pl-4"><span className="text-purple-600">--primary</span>: 221.2 83.2% 53.3%;</div>
                        <div className="pl-4"><span className="text-purple-600">--secondary</span>: 210 40% 96.1%;</div>
                        <div className="pl-4"><span className="text-purple-600">--accent</span>: 210 40% 90%;</div>
                        <div>{`}`}</div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">السمة الداكنة</h3>
                      <div className="bg-secondary/20 p-3 rounded-md text-xs font-mono overflow-auto">
                        <div><span className="text-pink-600">.dark</span> {`{`}</div>
                        <div className="pl-4"><span className="text-purple-600">--background</span>: 222.2 84% 4.9%;</div>
                        <div className="pl-4"><span className="text-purple-600">--foreground</span>: 210 40% 98%;</div>
                        <div className="pl-4"><span className="text-purple-600">--primary</span>: 217.2 91.2% 59.8%;</div>
                        <div className="pl-4"><span className="text-purple-600">--secondary</span>: 217.2 32.6% 17.5%;</div>
                        <div className="pl-4"><span className="text-purple-600">--accent</span>: 217.2 32.6% 20%;</div>
                        <div>{`}`}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
