
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useOrganizationalHierarchy } from "@/hooks/hr/useOrganizationalHierarchy";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChartNodeProps {
  name: string;
  type: string;
  depth: number;
  isLast: boolean;
  hasChildren: boolean;
  isDepartment: boolean;
  parentType?: string;
}

const ChartNode: React.FC<ChartNodeProps> = ({ 
  name, 
  type, 
  depth, 
  isLast,
  hasChildren,
  isDepartment,
  parentType
}) => {
  // Get the background color based on the node type
  const getBgColor = (type: string, isDepartment: boolean, parentType?: string) => {
    // If it's a department, use a different style that relates to its parent
    if (isDepartment && parentType) {
      switch (parentType.toLowerCase()) {
        case 'division': return 'bg-green-50 border-green-200';
        case 'section': return 'bg-amber-50 border-amber-200';
        case 'team': return 'bg-orange-50 border-orange-200';
        case 'unit': return 'bg-purple-50 border-purple-200';
        default: return 'bg-blue-50 border-blue-200';
      }
    }
    
    // Regular styling for non-department units
    switch (type.toLowerCase()) {
      case 'department': return 'bg-blue-100 border-blue-300';
      case 'division': return 'bg-green-100 border-green-300';
      case 'section': return 'bg-amber-100 border-amber-300';
      case 'team': return 'bg-orange-100 border-orange-300';
      case 'unit': return 'bg-purple-100 border-purple-300';
      default: return 'bg-slate-100 border-slate-300';
    }
  };

  // Adjust padding based on whether it's a department
  const nodePadding = isDepartment ? 'px-3 py-1' : 'px-4 py-2';
  const nodeFont = isDepartment ? 'text-sm' : 'text-base';
  const nodeBorder = isDepartment ? 'border-dashed' : 'border-solid';

  return (
    <div className="relative">
      {depth > 0 && (
        <>
          {/* Vertical line from parent */}
          <div className="absolute right-[50%] top-0 h-4 border-l border-slate-300"></div>
        </>
      )}
      
      <div className={`relative z-10 inline-block ${nodePadding} rounded-lg border ${nodeBorder} ${getBgColor(type, isDepartment, parentType)} min-w-32 text-center font-medium ${nodeFont}`}>
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
  const [viewMode, setViewMode] = useState<'chart' | 'tree'>('chart');
  
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
  
  const renderNode = (node: any, depth = 0, isLast = true, parentType?: string) => {
    const isDepartment = node.unit_type.toLowerCase() === 'department';
    
    // Departments will be rendered slightly differently
    // by passing the isDepartment and parentType props
    return (
      <div key={node.id} className="flex flex-col items-center">
        <ChartNode 
          name={node.name} 
          type={node.unit_type} 
          depth={depth}
          isLast={isLast}
          hasChildren={node.children && node.children.length > 0}
          isDepartment={isDepartment}
          parentType={parentType}
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
                index === node.children.length - 1,
                node.unit_type // Pass the parent's unit type to the child
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
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            className="mr-2"
            onClick={() => setViewMode(viewMode === 'chart' ? 'tree' : 'chart')}
          >
            {viewMode === 'chart' ? 'عرض شجري' : 'عرض هيكلي'} 
            {viewMode === 'chart' ? <ChevronDown className="ms-2 h-4 w-4" /> : <ChevronUp className="ms-2 h-4 w-4" />}
          </Button>
        </div>
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
