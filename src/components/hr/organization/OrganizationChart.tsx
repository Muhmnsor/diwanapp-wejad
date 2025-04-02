import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useOrganizationalHierarchy, OrganizationalHierarchyItem } from "@/hooks/hr/useOrganizationalHierarchy";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";
interface ChartNodeProps {
  name: string;
  type: string;
  depth: number;
  isLast: boolean;
  hasChildren: boolean;
  positionType: 'standard' | 'side' | 'assistant';
}
const ChartNode: React.FC<ChartNodeProps> = ({
  name,
  type,
  depth,
  isLast,
  hasChildren,
  positionType
}) => {
  // Get the background color based on the node type
  const getBgColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'department':
        return 'bg-blue-100 border-blue-300';
      case 'division':
        return 'bg-green-100 border-green-300';
      case 'section':
        return 'bg-amber-100 border-amber-300';
      case 'team':
        return 'bg-orange-100 border-orange-300';
      case 'unit':
        return 'bg-purple-100 border-purple-300';
      default:
        return 'bg-slate-100 border-slate-300';
    }
  };

  // Apply additional styles based on position type
  const getPositionStyle = (positionType: string) => {
    switch (positionType) {
      case 'side':
        return 'italic border-dashed';
      case 'assistant':
        return 'font-light border-dotted';
      default:
        return '';
    }
  };
  return <div className={`relative ${positionType === 'side' ? '-mr-8 mt-10' : ''}`}>
      {depth > 0 && positionType === 'standard' && <>
          {/* Vertical line from parent */}
          <div className="absolute right-[50%] top-0 h-4 border-l border-slate-300"></div>
        </>}
      
      {depth > 0 && positionType === 'side' && <>
          {/* Horizontal line to side position */}
          <div className="absolute right-[100%] top-1/2 w-8 border-t border-slate-300"></div>
        </>}
      
      <div className={`relative z-10 inline-block px-4 py-2 rounded-lg border ${getBgColor(type)} ${getPositionStyle(positionType)} min-w-32 text-center font-medium`}>
        {name}
        {hasChildren && <ChevronDown className="mx-auto mt-1 h-4 w-4 text-muted-foreground" />}
      </div>
      
      {!isLast && depth > 0 && positionType === 'standard' &&
    // Horizontal line to siblings
    <div className="absolute right-full top-1/2 w-4 border-t border-slate-300 px-[29px]"></div>}
    </div>;
};
export function OrganizationChart() {
  const {
    data: hierarchy,
    isLoading,
    isError
  } = useOrganizationalHierarchy();
  if (isLoading) {
    return <Card>
        <CardContent className="p-6">
          <Skeleton className="h-60 w-full" />
        </CardContent>
      </Card>;
  }
  if (isError || !hierarchy) {
    return <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">حدث خطأ أثناء تحميل الهيكل التنظيمي</p>
        </CardContent>
      </Card>;
  }

  // Organize data into a tree structure
  const buildTree = (items: OrganizationalHierarchyItem[]) => {
    const rootItems: any[] = [];
    const itemMap = new Map();

    // First pass: create map of all items
    items.forEach(item => {
      itemMap.set(item.id, {
        ...item,
        children: [],
        standardChildren: [],
        sideChildren: []
      });
    });

    // Second pass: build the tree
    items.forEach(item => {
      const treeItem = itemMap.get(item.id);
      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          parent.children.push(treeItem);

          // Also add to specific child arrays based on position type
          if (item.position_type === 'side' || item.position_type === 'assistant') {
            parent.sideChildren.push(treeItem);
          } else {
            parent.standardChildren.push(treeItem);
          }
        }
      } else {
        rootItems.push(treeItem);
      }
    });
    return rootItems;
  };
  const renderNode = (node: any, depth = 0, isLast = true) => {
    return <div key={node.id} className="flex flex-col items-center">
        <div className="flex flex-row items-start">
          {/* Render side positions to the right */}
          <div className="flex flex-col items-end mr-4">
            {node.sideChildren && node.sideChildren.map((child: any, index: number) => <div key={`side-${child.id}`} className="mb-2">
                {renderNode(child, depth + 1, index === node.sideChildren.length - 1)}
              </div>)}
          </div>
          
          {/* Main node */}
          <ChartNode name={node.name} type={node.unit_type} depth={depth} isLast={isLast} hasChildren={node.standardChildren && node.standardChildren.length > 0} positionType={node.position_type || 'standard'} />
        </div>
        
        {/* Standard children */}
        {node.standardChildren && node.standardChildren.length > 0 && <div className="mt-4 flex flex-wrap justify-center gap-6 pt-4 relative">
            {/* Vertical line down to children */}
            <div className="absolute right-1/2 top-0 h-4 border-l border-slate-300"></div>
            
            {/* Horizontal line across all children */}
            {node.standardChildren.length > 1 && <div className="absolute right-[calc(50%-((100%-2rem)/2))] top-4 w-[calc(100%-2rem)] border-t border-slate-300"></div>}
            
            {node.standardChildren.map((child: any, index: number) => renderNode(child, depth + 1, index === node.standardChildren.length - 1))}
          </div>}
      </div>;
  };
  const treeData = buildTree(hierarchy);
  return <Card>
      <CardContent className="p-6 overflow-auto">
        <div className="min-w-[500px] flex justify-center p-4">
          {treeData.length > 0 ? <div className="flex flex-col gap-8">
              {treeData.map(rootNode => renderNode(rootNode))}
            </div> : <p className="text-center text-muted-foreground">لا توجد بيانات للهيكل التنظيمي</p>}
        </div>
      </CardContent>
    </Card>;
}