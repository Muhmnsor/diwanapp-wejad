
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchPermissions } from "../api/permissionsApi";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * مكون لعرض وظائف إدارة الأفكار (للتوضيح فقط)
 */
export const IdeasManagementDemo = () => {
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['permissions-ideas'],
    queryFn: async () => {
      const allPermissions = await fetchPermissions();
      return allPermissions.filter(p => p.module === "إدارة الأفكار");
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">إدارة الأفكار</CardTitle>
        <CardDescription>
          عرض وظائف إدارة الأفكار وصلاحياتها
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">صلاحيات إدارة الأفكار</h3>
            <Button variant="outline">عرض الأفكار</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissions.map(permission => (
              <div key={permission.id} className="border rounded-md p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{permission.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {permission.description}
                    </p>
                  </div>
                  <Badge variant="outline">{permission.id}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
