import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "../components/CodeBlock";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TechnicalDocumentation = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>التوثيق التقني</CardTitle>
          <CardDescription>
            معلومات تقنية حول بنية النظام والتقنيات المستخدمة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="tech-stack" className="w-full">
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="tech-stack">التقنيات المستخدمة</TabsTrigger>
              <TabsTrigger value="architecture">هيكل المشروع</TabsTrigger>
              <TabsTrigger value="code-examples">أمثلة الأكواد</TabsTrigger>
              <TabsTrigger value="integrations">التكاملات الخارجية</TabsTrigger>
              <TabsTrigger value="troubleshooting">استكشاف الأخطاء</TabsTrigger>
              <TabsTrigger value="installation">متطلبات التثبيت</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tech-stack">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التقنية</TableHead>
                    <TableHead>الإصدار</TableHead>
                    <TableHead>الاستخدام</TableHead>
                    <TableHead>المسار</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>React</TableCell>
                    <TableCell>^18.3.1</TableCell>
                    <TableCell>مكتبة بناء واجهات المستخدم</TableCell>
                    <TableCell><code>src/App.tsx</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TypeScript</TableCell>
                    <TableCell>^4.9.5</TableCell>
                    <TableCell>لغة البرمجة المستخدمة</TableCell>
                    <TableCell><code>src/types/</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Supabase</TableCell>
                    <TableCell>^2.47.2</TableCell>
                    <TableCell>قاعدة البيانات والمصادقة</TableCell>
                    <TableCell><code>src/integrations/supabase/</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tailwind CSS</TableCell>
                    <TableCell>^3.3.3</TableCell>
                    <TableCell>إطار عمل التنسيق</TableCell>
                    <TableCell><code>tailwind.config.js</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>React Router</TableCell>
                    <TableCell>^6.26.2</TableCell>
                    <TableCell>إدارة التنقل</TableCell>
                    <TableCell><code>src/AppRoutes.tsx</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Lucide React</TableCell>
                    <TableCell>^0.462.0</TableCell>
                    <TableCell>مكتبة الأيقونات</TableCell>
                    <TableCell><code>import from 'lucide-react'</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>React Query</TableCell>
                    <TableCell>^5.56.2</TableCell>
                    <TableCell>إدارة حالات الطلبات</TableCell>
                    <TableCell><code>src/hooks/useQuery.tsx</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sonner</TableCell>
                    <TableCell>^1.4.0</TableCell>
                    <TableCell>مكتبة الإشعارات</TableCell>
                    <TableCell><code>import from 'sonner'</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Recharts</TableCell>
                    <TableCell>^2.12.7</TableCell>
                    <TableCell>عرض الرسوم البيانية</TableCell>
                    <TableCell><code>src/components/charts/</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Zustand</TableCell>
                    <TableCell>^5.0.2</TableCell>
                    <TableCell>إدارة حالة التطبيق</TableCell>
                    <TableCell><code>src/store/</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>PDF-Lib</TableCell>
                    <TableCell>^1.17.1</TableCell>
                    <TableCell>إنشاء وتعديل ملفات PDF</TableCell>
                    <TableCell><code>src/components/certificates/</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>XLSX</TableCell>
                    <TableCell>^0.18.5</TableCell>
                    <TableCell>تصدير البيانات إلى Excel</TableCell>
                    <TableCell><code>src/components/admin/ExportButton.tsx</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>html-to-image</TableCell>
                    <TableCell>^1.11.11</TableCell>
                    <TableCell>تحويل HTML إلى صور</TableCell>
                    <TableCell><code>src/utils/exportUtils.ts</code></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>JSZip</TableCell>
                    <TableCell>^3.10.1</TableCell>
                    <TableCell>ضغط الملفات</TableCell>
                    <TableCell><code>src/components/ideas/details/</code></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="architecture">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="structure">
                  <AccordionTrigger>هيكل الملفات</AccordionTrigger>
                  <AccordionContent>
                    <div className="border rounded-md p-3 mb-4">
                      <code className="text-sm">
                        <div><Badge variant="outline" className="mr-2">📁</Badge> src/</div>
                        
                        {/* Core Components */}
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> components/ - مكونات التطبيق المختلفة</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> activities/ - مكونات الأنشطة والفعاليات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> admin/ - مكونات لوحة التحكم</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> certificates/ - مكونات إدارة الشهادات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> dashboard/ - مكونات لوحة القيادة</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> developer/ - أدوات المطور</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> documentation/ - مكونات التوثيق</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> events/ - مكونات الفعاليات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> finance/ - المكونات المالية</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> ideas/ - مكونات إدارة الأفكار</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> layout/ - مكونات التخطيط العام</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> projects/ - مكونات المشاريع</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> requests/ - مكونات الطلبات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> settings/ - مكونات الإعدادات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> tasks/ - مكونات المهام</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> ui/ - مكونات واجهة المستخدم الأساسية</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> users/ - مكونات إدارة المستخدمين</div>
                        
                        {/* Core App Files */}
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> pages/ - صفحات التطبيق</div>
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> hooks/ - الدوال الخطافية</div>
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> integrations/ - تكامل مع الخدمات الخارجية</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> supabase/ - تكامل مع Supabase</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> whatsapp/ - تكامل مع WhatsApp</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> asana/ - تكامل مع Asana</div>
                        
                        {/* State Management */}
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> store/ - مخازن حالة التطبيق</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> authStore.ts - إدارة المصادقة</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> eventStore.ts - إدارة الفعاليات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> financeStore.ts - إدارة الموارد المالية</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> portfolioStore.ts - إدارة المحافظ</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> notificationsStore.ts - إدارة الإشعارات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> documentsStore.ts - إدارة المستندات</div>
                        
                        {/* Utils and Types */}
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> utils/ - دوال مساعدة</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> export/ - تصدير البيانات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> files/ - إدارة الملفات</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> print/ - الطباعة</div>
                        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> reports/ - التقارير</div>
                        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> types/ - التعريفات النمطية</div>
                      </code>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="subsystems">
                  <AccordionTrigger>الأنظمة الفرعية</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <div className="bg-muted p-4 rounded-md mb-6">
                        <h3 className="text-base font-semibold mb-2">مخطط تفاعل الأنظمة الفرعية</h3>
                        <p className="text-sm mb-2">يوضح المخطط التالي كيفية تفاعل الأنظمة الفرعية مع بعضها البعض:</p>
                        <div className="border-2 border-dashed border-primary/30 rounded-md p-4 text-center text-muted-foreground">
                          مخطط تفاعل الأنظمة الفرعية (يتم تحميله من مخزن الملفات)
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">نظام إدارة الأفكار</h4>
                        <div className="bg-card p-3 rounded-md mb-3">
                          <p className="text-sm">
                            نظام متكامل لإدارة مقترحات المشاريع والأفكار بدءاً من تقديم الفكرة وحتى تنفيذها.
                          </p>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/4">المكون</TableHead>
                              <TableHead className="w-3/4">التفاصيل</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">آلية التصويت والتقييم</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>تصويت إيجابي أو سلبي على الأفكار</li>
                                  <li>تقييم بالنجوم (1-5) لجوانب الفكرة المختلفة</li>
                                  <li>نظام منع التصويت المتكرر للمستخدم الواحد</li>
                                  <li>إحصائيات التصويت في الوقت الحقيقي</li>
                                  <li>تحليلات الأداء والاتجاهات</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">نظام المراجعة والموافقات</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>مسارات موافقة متعددة المستويات</li>
                                  <li>إشعارات تلقائية للمراجعين</li>
                                  <li>سجل تعديلات الفكرة</li>
                                  <li>تتبع حالة المراجعة والتعليقات</li>
                                  <li>قوالب رفض/قبول قابلة للتخصيص</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">إدارة المرفقات والملفات</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>دعم تحميل ملفات متعددة (PDF, DOC, XLS, JPG, PNG)</li>
                                  <li>معاينة الملفات مباشرة في المتصفح</li>
                                  <li>حد أقصى 10 ملفات و50 ميجابايت للفكرة الواحدة</li>
                                  <li>تنظيم الملفات حسب النوع والفئة</li>
                                  <li>مشاركة روابط للملفات مع الآخرين</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">نظام التعليقات والمناقشات</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>تعليقات متداخلة متعددة المستويات</li>
                                  <li>إمكانية الإشارة إلى المستخدمين (@mention)</li>
                                  <li>تنسيق نصي غني للتعليقات</li>
                                  <li>إمكانية إرفاق ملفات في التعليقات</li>
                                  <li>خيارات تصفية وفرز التعليقات</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <div className="mt-2 text-sm text-muted-foreground">
                          المسار: <code>src/components/ideas/</code>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">نظام إدارة المستندات</h4>
                        <div className="bg-card p-3 rounded-md mb-3">
                          <p className="text-sm">
                            منصة متكاملة لإدارة وتنظيم المستندات والملفات بكافة أنواعها مع دعم لإدارة الإصدارات والتصنيف.
                          </p>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/4">المكون</TableHead>
                              <TableHead className="w-3/4">التفاصيل</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">آلية تتبع الإصدارات</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>حفظ جميع إصدارات المستند تلقائياً</li>
                                  <li>مقارنة الإصدارات جنباً إلى جنب</li>
                                  <li>استعادة الإصدارات السابقة بسهولة</li>
                                  <li>تعليقات محددة لكل إصدار</li>
                                  <li>تتبع التغييرات بين الإصدارات</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">نظام التصنيف والفهرسة</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>هيكل مجلدات متعدد المستويات</li>
                                  <li>وسوم مخصصة للمستندات</li>
                                  <li>بحث نصي كامل داخل محتوى المستندات</li>
                                  <li>فلترة متقدمة حسب النوع والتاريخ والحالة</li>
                                  <li>تصنيف تلقائي باستخدام الذكاء الاصطناعي</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">سياسات الأمان والصلاحيات</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>صلاحيات مفصلة على مستوى المستند</li>
                                  <li>إدارة المجموعات ومستويات الوصول</li>
                                  <li>تشفير المستندات الحساسة</li>
                                  <li>سجل للوصول والعمليات على المستندات</li>
                                  <li>قفل المستندات أثناء التحرير لمنع التعارض</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">نظام الأرشفة</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>أرشفة تلقائية للمستندات القديمة</li>
                                  <li>ضغط المستندات المؤرشفة لتوفير المساحة</li>
                                  <li>استعادة من الأرشيف عند الحاجة</li>
                                  <li>سياسات احتفاظ مخصصة لكل نوع مستند</li>
                                  <li>تصدير الأرشيف إلى وسائط خارجية</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <div className="mt-2 text-sm text-muted-foreground">
                          المسار: <code>src/components/documents/</code>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">نظام الطلبات</h4>
                        <div className="bg-card p-3 rounded-md mb-3">
                          <p className="text-sm">
                            نظام شامل لإدارة الطلبات والنماذج الإلكترونية بمختلف أنواعها، مع دعم لتدفق العمل والموافقات.
                          </p>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/4">المكون</TableHead>
                              <TableHead className="w-3/4">التفاصيل</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">أنواع النماذج المدعومة</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>نماذج عامة قابلة للتخصيص بالكامل</li>
                                  <li>نماذج طلبات مالية (مشتريات، صرف، تعويض)</li>
                                  <li>نماذج الموارد البشرية (إجازة، انتداب، ترقية)</li>
                                  <li>نماذج المشاريع (بدء، تغيير نطاق، إغلاق)</li>
                                  <li>نماذج تقييم وتغذية راجعة</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">خطوات سير العمل</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>إنشاء مسارات موافقة مخصصة لكل نوع طلب</li>
                                  <li>موافقات متوازية ومتسلسلة</li>
                                  <li>تفويض الصلاحيات وقواعد الاستخلاف</li>
                                  <li>شروط وقواعد منطقية للمسارات</li>
                                  <li>إجراءات تلقائية بناءً على الموافقات</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">آلية المتابعة والتنبيهات</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>إشعارات داخل النظام للموافقين</li>
                                  <li>تنبيهات البريد الإلكتروني المجدولة</li>
                                  <li>تذكيرات للطلبات المتأخرة</li>
                                  <li>تتبع حالة الطلب في الوقت الحقيقي</li>
                                  <li>لوحة تحكم مخصصة للطلبات قيد الانتظار</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">نظام التقارير والإحصائيات</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>تقارير زمن المعالجة والاستجابة</li>
                                  <li>إحصائيات الطلبات حسب النوع والحالة</li>
                                  <li>تحليل الاتجاهات ومؤشرات الأداء</li>
                                  <li>تقارير مخصصة قابلة للتصدير</li>
                                  <li>لوحات معلومات تفاعلية للمديرين</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <div className="mt-2 text-sm text-muted-foreground">
                          المسار: <code>src/components/requests/</code>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">نظام الصلاحيات</h4>
                        <div className="bg-card p-3 rounded-md mb-3">
                          <p className="text-sm">
                            نظام متكامل لإدارة صلاحيات المستخدمين والأدوار والوصول إلى مختلف أجزاء النظام.
                          </p>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/4">المكون</TableHead>
                              <TableHead className="w-3/4">التفاصيل</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">إدارة الأدوار والصلاحيات</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>أدوار مدمجة (مدير، مشرف، مستخدم، ضيف)</li>
                                  <li>إنشاء أدوار مخصصة مع صلاحيات محددة</li>
                                  <li>وراثة الصلاحيات بين الأدوار</li>
                                  <li>تعيين أدوار متعددة للمستخدم الواحد</li>
                                  <li>صلاحيات خاصة على مستوى المستخدم</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">تحكم دقيق بالوصول</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>صلاحيات على مستوى الكائنات والصفحات</li>
                                  <li>صلاحيات متعددة (قراءة، كتابة، حذف، تعديل)</li>
                                  <li>قيود وصول مبنية على البيانات</li>
                                  <li>صلاحيات مبنية على سياق العمل</li>
                                  <li>تحكم بالوصول إلى الحقول المحددة</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">سجلات الأنشطة</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>تتبع جميع عمليات الدخول والخروج</li>
                                  <li>سجل تغييرات الصلاحيات والأدوار</li>
                                  <li>سجل التعديلات على البيانات الحساسة</li>
                                  <li>تنبيهات للأنشطة المشبوهة</li>
                                  <li>تقارير استخدام وأمان مفصلة</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">التكامل مع المصادقة</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>دعم المصادقة الثنائية (2FA)</li>
                                  <li>تكامل مع مزودي الهوية الخارجيين</li>
                                  <li>تسجيل دخول واحد (SSO)</li>
                                  <li>مزامنة الأدوار من مصادر خارجية</li>
                                  <li>تجاوز سياسات المرور للمديرين</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <div className="mt-2 text-sm text-muted-foreground">
                          المسار: <code>src/components/users/permissions/</code>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="modules">
                  <AccordionTrigger>الوحدات الرئيسية</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <div className="bg-muted p-4 rounded-md mb-6">
                        <h3 className="text-base font-semibold mb-2">تفاعل الوحدات الرئيسية</h3>
                        <p className="text-sm mb-2">توضح الصورة التالية كيفية تفاعل الوحدات الرئيسية في النظام:</p>
                        <div className="border-2 border-dashed border-primary/30 rounded-md p-4 text-center text-muted-foreground">
                          مخطط تفاعل الوحدات الرئيسية (يتم تحميله من مخزن الملفات)
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">إدارة الملفات</h4>
                        <div className="bg-card p-3 rounded-md mb-3">
                          <p className="text-sm">
                            نظام متكامل لإدارة الملفات ومعالجتها وتخزينها بطريقة آمنة وفعالة.
                          </p>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/4">المكون</TableHead>
                              <TableHead className="w-3/4">التفاصيل</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">أنواع الملفات المدعومة</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>مستندات: PDF, DOCX, TXT, RTF, ODT</li>
                                  <li>جداول بيانات: XLSX, CSV, ODS</li>
                                  <li>عروض تقديمية: PPTX, ODP</li>
                                  <li>صور: JPG, PNG, SVG, GIF, WEBP</li>
                                  <li>ملفات مضغوطة: ZIP, RAR (للتحميل فقط)</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">حدود وقيود الملفات</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>الحد الأقصى لحجم الملف: 50 ميجابايت</li>
                                  <li>الحد الأقصى للملفات في المرفق الواحد: 10 ملفات</li>
                                  <li>الحد الأقصى للتخزين لكل مستخدم: 5 جيجابايت</li>
                                  <li>قيود تنزيل الملفات: 100 ملف في اليوم لكل مستخدم</li>
                                  <li>أنواع ملفات محظورة: EXE, BAT, COM, CMD</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">آلية المعالجة والضغط</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>ضغط تلقائي للصور مع الحفاظ على الجودة</li>
                                  <li>تحويل المستندات إلى PDF للعرض المباشر</li>
                                  <li>استخراج البيانات الوصفية من الملفات</li>
                                  <li>فحص الملفات للتأكد من خلوها من البرامج الضارة</li>
                                  <li>توليد صور مصغرة للملفات للعرض السريع</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">نظام النسخ الاحتياطي</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>نسخ احتياطي تلقائي يومي لجميع الملفات</li>
                                  <li>احتفاظ بنسخة لمدة 30 يوم للملفات المحذوفة</li>
                                  <li>استعادة الملفات من سلة المحذوفات</li>
                                  <li>نسخ احتياطي عند الطلب للملفات المهمة</li>
                                  <li>تصدير نسخ متعددة من الملفات الهامة</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <div className="mt-2 mb-4">
                          <h5 className="text-sm font-medium mb-2">مثال على استخدام وحدة الملفات:</h5>
                          <CodeBlock
                            code={`import { fileUploader } from '@/utils/files/uploader';

// رفع ملف واحد
const uploadSingleFile = async (file, category = 'documents') => {
  try {
    const result = await fileUploader.uploadFile({
      file,
      category,
      maxSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
    });
    
    return result.fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('فشل في رفع الملف: ' + error.message);
  }
};

// رفع ملفات متعددة
const uploadMultipleFiles = async (files, category = 'attachments') => {
  try {
    const uploadPromises = Array.from(files).map(file => 
      fileUploader.uploadFile({
        file,
        category,
        generateThumbnail: true,
        compressImages: true
      })
    );
    
    const results = await Promise.all(uploadPromises);
    return results.map(r => ({ 
      url: r.fileUrl, 
      name: r.fileName,
      type: r.fileType,
      size: r.fileSize
    }));
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error('فشل في رفع الملفات: ' + error.message);
  }
};`}
                            language="typescript"
                          />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          المسار: <code>src/utils/files/</code>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">معالجة التقارير</h4>
                        <div className="bg-card p-3 rounded-md mb-3">
                          <p className="text-sm">
                            نظام شامل لإنشاء وتصدير وإدارة التقارير بمختلف الصيغ والأنواع.
                          </p>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-1/4">المكون</TableHead>
                              <TableHead className="w-3/4">التفاصيل</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">قوالب التقارير المتاحة</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>تقارير إحصائية (رسوم بيانية وجداول)</li>
                                  <li>تقارير تفصيلية للمشاريع والفعاليات</li>
                                  <li>تقارير مالية (مصروفات، إيرادات، ميزانيات)</li>
                                  <li>تقارير أداء (مؤشرات، مقارنات، اتجاهات)</li>
                                  <li>تقارير تشغيلية (نشاط المستخدمين، استخدام النظام)</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">خيارات التصدير</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>PDF: تقارير منسقة للطباعة والمشاركة</li>
                                  <li>Excel: بيانات مفصلة قابلة للتحليل</li>
                                  <li>CSV: تصدير البيانات الخام</li>
                                  <li>PNG/JPG: تصدير الرسوم البيانية كصور</li>
                                  <li>HTML: تقارير تفاعلية للعرض الإلكتروني</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">معالجة البيانات الإحصائية</TableCell>
                              <TableCell>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  <li>تجميع وتلخيص البيانات تلقائياً</li>
                                  <li>حساب المؤشرات والإحصاءات الرئيسية</li>
                                  <li>تحليل الاتجاهات والتنبؤات</li>
                                  <li>مقارنات مع فترات سابقة</li>
                                  <li>تصفية وفر
