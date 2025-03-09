
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RequestType } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

interface RequestTypesListProps {
  onSelectType: (requestType: RequestType) => void;
}

export const RequestTypesList = ({ onSelectType }: RequestTypesListProps) => {
  const { data: requestTypes, isLoading } = useQuery({
    queryKey: ["requestTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("request_types")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as RequestType[];
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requestTypes?.map((requestType) => (
        <Card key={requestType.id} className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">{requestType.name}</CardTitle>
            <CardDescription>{requestType.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {requestType.form_schema.fields?.length || 0} حقل مطلوب تعبئته
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => onSelectType(requestType)}
            >
              <FileText className="mr-2 h-4 w-4" />
              تقديم طلب جديد
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
