
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentationContainer } from "@/components/documentation/DocumentationContainer";

export const DocumentationSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>توثيق النظام</CardTitle>
        <CardDescription>توثيق شامل للنظام، وظائفه، ومكوناته</CardDescription>
      </CardHeader>
      <CardContent>
        <DocumentationContainer />
      </CardContent>
    </Card>
  );
};
