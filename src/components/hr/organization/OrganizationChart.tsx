
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useOrganizationalHierarchy } from "@/hooks/hr/useOrganizationalHierarchy";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";

interface ChartNodeProps {
  name: string;
  type: string;
  depth: number;
  isLast: boolean;
  hasChildren: boolean;
}

const ChartNode: React.FC<ChartNodeProps> = ({ 
  name, 
  type, 
  depth, 
  isLast,
  hasChildren
}) => {
  // Get the background color based on the node type
  const getBgColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'department': return 'bg-blue-100 border-blue-300';
      case 'division': return 'bg-green-100 border-green-300';
      case 'section': return 'bg-amber-100 border-amber-300';
      case 'team': return 'bg-orange-100 border-orange-300';
      case 'unit': return 'bg-purple-100 border-purple-300';
      default: return 'bg-slate-100 border-slate-300';
    }
  };

  return (
    <div className="relative">
      {depth > 0 && (
        <>
          {/* Vertical line from parent */}
          <div className="absolute right-[50%] top-0 h-4 border-l border-slate-300"></div>
        </>
      )}
      
      <div className={`relative z-10 inline-block px-4 py-2 rounded-lg border ${getBgColor(type)} min-w-32 text-center font-medium`}>
        {name}
        {hasChildren && <ChevronDown className="mx-auto mt-1 h-4 w-4 text-muted-foreground" />}
      </div>
      
      {!isLast && depth > 0 && (
        // Horizontal line to siblings
        <div className="absolute right-full top-1/2 w-4 border-t border-slate-300"></div>
      )}
    </div>
  );
};

export function OrganizationChart() {
  const { data: hierarchy, isLoading, isError } = useOrganizationalHierarchy();
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-60 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (isError || !hierarchy) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">حدث خطأ أثناء تحميل الهيكل التنظيمي</p>
        </CardContent>
      </Card>
    );
  }
  
  // Organize data into a tree structure
  const buildTree = (items: any[]) => {
    const rootItems: any[] = [];
    const itemMap = new Map();
    
    // First pass: create map of all items
    items.forEach(item => {
      itemMap.set(item.id, {
        ...item,
        children: []
      });
    });
    
    // Second pass: build the tree
    items.forEach(item => {
      const treeItem = itemMap.get(item.id);
      
      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          parent.children.push(treeItem);
        }
      } else {
        rootItems.push(treeItem);
      }
    });
    
    return rootItems;
  };
  
  const renderNode = (node: any, depth = 0, isLast = true) => {
    return (
      <div key={node.id} className="flex flex-col items-center">
        <ChartNode 
          name={node.name} 
          type={node.unit_type} 
          depth={depth}
          isLast={isLast}
          hasChildren={node.children && node.children.length > 0}
        />
        
        {node.children && node.children.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-6 pt-4 relative">
            {/* Vertical line down to children */}
            <div className="absolute right-1/2 top-0 h-4 border-l border-slate-300"></div>
            
            {/* Horizontal line across all children */}
            {node.children.length > 1 && (
              <div className="absolute right-[calc(50%-((100%-2rem)/2))] top-4 w-[calc(100%-2rem)] border-t border-slate-300"></div>
            )}
            
            {node.children.map((child: any, index: number) => (
              renderNode(
                child, 
                depth + 1, 
                index === node.children.length - 1
              )
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const treeData = buildTree(hierarchy);
  
  return (
    <Card>
      <CardContent className="p-6 overflow-auto">
        <div className="min-w-[500px] flex justify-center p-4">
          {treeData.length > 0 ? (
            <div className="flex flex-col gap-8">
              {treeData.map((rootNode) => renderNode(rootNode))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">لا توجد بيانات للهيكل التنظيمي</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
