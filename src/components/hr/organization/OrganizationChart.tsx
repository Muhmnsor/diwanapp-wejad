
import React from "react";
import { Building, Users, Briefcase, Network, UserCircle } from "lucide-react";

interface OrganizationalHierarchyItem {
  id: string;
  name: string;
  description?: string;
  unit_type: string;
  parent_id?: string;
  level: number;
  path: string[];
  children?: OrganizationalHierarchyItem[];
}

interface OrganizationChartProps {
  data: OrganizationalHierarchyItem[];
}

export function OrganizationChart({ data }: OrganizationChartProps) {
  // تنظيم البيانات في هيكل شجري
  const organizeTree = (items: OrganizationalHierarchyItem[]): OrganizationalHierarchyItem[] => {
    const rootItems: OrganizationalHierarchyItem[] = [];
    const itemMap = new Map<string, OrganizationalHierarchyItem>();
    
    // إنشاء خريطة للعناصر
    items.forEach(item => {
      const newItem = { ...item, children: [] };
      itemMap.set(item.id, newItem);
    });
    
    // بناء الشجرة
    items.forEach(item => {
      const mappedItem = itemMap.get(item.id);
      if (mappedItem) {
        if (!item.parent_id) {
          rootItems.push(mappedItem);
        } else {
          const parent = itemMap.get(item.parent_id);
          if (parent && parent.children) {
            parent.children.push(mappedItem);
          }
        }
      }
    });
    
    return rootItems;
  };

  const getUnitTypeIcon = (unitType: string) => {
    switch (unitType) {
      case 'department':
        return <Building className="h-5 w-5 text-blue-500" />;
      case 'division':
        return <Network className="h-5 w-5 text-green-500" />;
      case 'section':
        return <Briefcase className="h-5 w-5 text-amber-500" />;
      case 'team':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'position':
        return <UserCircle className="h-5 w-5 text-rose-500" />;
      default:
        return <Building className="h-5 w-5" />;
    }
  };

  const getUnitTypeColor = (unitType: string) => {
    switch (unitType) {
      case 'department':
        return 'bg-blue-50 border-blue-200';
      case 'division':
        return 'bg-green-50 border-green-200';
      case 'section':
        return 'bg-amber-50 border-amber-200';
      case 'team':
        return 'bg-purple-50 border-purple-200';
      case 'position':
        return 'bg-rose-50 border-rose-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const treeData = organizeTree(data);

  const renderNode = (node: OrganizationalHierarchyItem) => {
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} className="flex flex-col items-center">
        <div className={`p-3 border rounded-md ${getUnitTypeColor(node.unit_type)} min-w-[150px] flex flex-col items-center`}>
          <div className="mb-1">
            {getUnitTypeIcon(node.unit_type)}
          </div>
          <div className="text-center font-medium truncate max-w-[140px]">{node.name}</div>
        </div>
        
        {hasChildren && (
          <>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex flex-row">
              {node.children?.map((child, i, arr) => (
                <div 
                  key={child.id} 
                  className="flex flex-col items-center mx-2"
                >
                  {i === 0 && arr.length > 1 ? (
                    <div className="border-t border-gray-300 w-1/2 mr-auto mb-4"></div>
                  ) : i === arr.length - 1 && arr.length > 1 ? (
                    <div className="border-t border-gray-300 w-1/2 ml-auto mb-4"></div>
                  ) : (
                    <div className="border-t border-gray-300 w-full mb-4"></div>
                  )}
                  {renderNode(child)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        لا توجد وحدات تنظيمية
      </div>
    );
  }

  return (
    <div className="flex justify-center overflow-auto">
      <div className="inline-flex flex-col items-center">
        {treeData.map(node => renderNode(node))}
      </div>
    </div>
  );
}
