
import * as React from "react";
import { CaretSortIcon, CircleIcon } from "@radix-ui/react-icons";
import { Users, Building, Briefcase, Network, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

interface OrganizationTreeViewProps {
  data: OrganizationalHierarchyItem[];
  onUnitSelect?: (unitId: string) => void;
  expandAll?: boolean;
}

export function OrganizationTreeView({ 
  data, 
  onUnitSelect, 
  expandAll = false 
}: OrganizationTreeViewProps) {
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
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'division':
        return <Network className="h-4 w-4 text-green-500" />;
      case 'section':
        return <Briefcase className="h-4 w-4 text-amber-500" />;
      case 'team':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'position':
        return <UserCircle className="h-4 w-4 text-rose-500" />;
      default:
        return <CircleIcon className="h-4 w-4" />;
    }
  };

  const treeData = organizeTree(data);

  const renderTreeItems = (items: OrganizationalHierarchyItem[]) => {
    return items.map((item) => (
      <TreeItem 
        key={item.id} 
        item={item} 
        onUnitSelect={onUnitSelect}
        expandAll={expandAll}
        getUnitTypeIcon={getUnitTypeIcon}
      />
    ));
  };

  return (
    <div className="space-y-2 rtl">
      {data.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          لا توجد وحدات تنظيمية
        </div>
      ) : (
        renderTreeItems(treeData)
      )}
    </div>
  );
}

interface TreeItemProps {
  item: OrganizationalHierarchyItem;
  onUnitSelect?: (unitId: string) => void;
  expandAll?: boolean;
  getUnitTypeIcon: (unitType: string) => React.ReactNode;
}

function TreeItem({ 
  item, 
  onUnitSelect, 
  expandAll = false,
  getUnitTypeIcon
}: TreeItemProps) {
  const [isOpen, setIsOpen] = React.useState(expandAll);
  const hasChildren = item.children && item.children.length > 0;

  React.useEffect(() => {
    setIsOpen(expandAll);
  }, [expandAll]);

  return (
    <div>
      {hasChildren ? (
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start px-2 hover:bg-muted/50 gap-2",
                isOpen && "font-bold"
              )}
              onClick={() => onUnitSelect && onUnitSelect(item.id)}
            >
              {getUnitTypeIcon(item.unit_type)}
              <span>{item.name}</span>
            </Button>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
                <CaretSortIcon className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2 mr-4 border-r pr-2">
            {item.children?.map((child) => (
              <TreeItem 
                key={child.id} 
                item={child} 
                onUnitSelect={onUnitSelect}
                expandAll={expandAll}
                getUnitTypeIcon={getUnitTypeIcon}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <Button
          variant="ghost"
          className="w-full justify-start px-2 hover:bg-muted/50 gap-2"
          onClick={() => onUnitSelect && onUnitSelect(item.id)}
        >
          {getUnitTypeIcon(item.unit_type)}
          <span>{item.name}</span>
        </Button>
      )}
    </div>
  );
}
