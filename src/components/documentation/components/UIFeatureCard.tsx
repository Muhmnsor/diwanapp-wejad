
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";

interface UIFeatureCardProps {
  title: string;
  description: string;
  code: string;
}

export const UIFeatureCard: React.FC<UIFeatureCardProps> = ({
  title,
  description,
  code
}) => {
  const [showCode, setShowCode] = useState(false);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-secondary/10">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowCode(!showCode)}
            className="mt-2 text-xs"
          >
            <Code className="h-3 w-3 mr-1" />
            {showCode ? "إخفاء الكود" : "عرض الكود"}
          </Button>
        </div>
        
        {showCode && (
          <div className="border-t bg-secondary/10 p-3 overflow-x-auto">
            <pre className="text-xs font-mono" dir="ltr">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
