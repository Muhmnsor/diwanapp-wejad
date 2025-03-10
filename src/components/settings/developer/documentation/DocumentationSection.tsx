
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentationContainer } from "@/components/documentation/DocumentationContainer";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const DocumentationSection = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the documentation tab
    navigate("/admin/developer-settings?tab=overview", { replace: true });
  }, [navigate]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>توثيق النظام</CardTitle>
        <CardDescription>توثيق شامل للنظام، وظائفه، ومكوناته</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">
          جاري التحويل إلى صفحة التوثيق...
        </p>
      </CardContent>
    </Card>
  );
};
