
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { debugRoleMapping, debugAppRoles } from "@/utils/debugRoleMappings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, SearchIcon, CheckCircle, XCircle } from "lucide-react";

interface RoleMappingResult {
  exists: boolean;
  mappedRole: string | null;
  message: string;
}

interface AppRolesDebugResult {
  appKey: string;
  allowedRolesCount: number;
  allowedRoles: {
    englishName: string;
    arabicNames: string[];
  }[];
  error?: string;
}

export const RoleMappingDebugTab = () => {
  const [roleName, setRoleName] = useState("");
  const [result, setResult] = useState<RoleMappingResult | null>(null);
  const [appKey, setAppKey] = useState("events");
  const [appRolesResult, setAppRolesResult] = useState<AppRolesDebugResult | null>(null);

  const handleDebugRole = () => {
    const mappingResult = debugRoleMapping(roleName);
    setResult(mappingResult);
  };

  const handleDebugAppRoles = () => {
    const rolesResult = debugAppRoles(appKey);
    setAppRolesResult(rolesResult);
  };

  const appOptions = [
    "events", "documents", "tasks", "ideas", "finance", 
    "users", "website", "store", "notifications", "requests", "developer"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تشخيص تخطيط الأدوار</CardTitle>
          <CardDescription>تحقق من تخطيط الأدوار بين الأسماء العربية والإنجليزية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="أدخل اسم الدور (بالعربية أو الإنجليزية)"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleDebugRole}>
              <SearchIcon className="ml-2 h-4 w-4" />
              تحقق
            </Button>
          </div>

          {result && (
            <Alert variant={result.exists ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {result.exists ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <AlertDescription className="font-bold">
                  {result.message}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تشخيص أدوار التطبيق</CardTitle>
          <CardDescription>عرض الأدوار المسموح لها بالوصول إلى تطبيق معين</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={appKey} onValueChange={setAppKey}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="اختر التطبيق" />
              </SelectTrigger>
              <SelectContent>
                {appOptions.map((app) => (
                  <SelectItem key={app} value={app}>
                    {app}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleDebugAppRoles}>عرض الأدوار</Button>
          </div>

          {appRolesResult && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <InfoIcon className="h-5 w-5 text-blue-500" />
                <span>
                  يوجد {appRolesResult.allowedRolesCount} دور مسموح له بالوصول إلى تطبيق "
                  {appRolesResult.appKey}"
                </span>
              </div>

              {appRolesResult.error ? (
                <Alert variant="destructive">
                  <AlertDescription>{appRolesResult.error}</AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الدور (بالإنجليزية)</TableHead>
                      <TableHead>المقابل بالعربية</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appRolesResult.allowedRoles.map((role) => (
                      <TableRow key={role.englishName}>
                        <TableCell className="font-medium">{role.englishName}</TableCell>
                        <TableCell>
                          {role.arabicNames.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {role.arabicNames.map((arabic, index) => (
                                <li key={index}>{arabic}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-red-500">لا يوجد مقابل عربي</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
