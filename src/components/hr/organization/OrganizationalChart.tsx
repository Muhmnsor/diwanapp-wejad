
import React, { useState } from "react";
import { useOrganizationalHierarchy, OrganizationalHierarchyItem } from "@/hooks/hr/useOrganizationalHierarchy";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Building2, Users, ChevronDown, ChevronUp, Layers } from "lucide-react";

interface ChartNodeProps {
  node: OrganizationalHierarchyItem;
  children?: React.ReactNode;
  isExpanded: boolean;
  toggleExpand: () => void;
  onNodeClick: (unit: OrganizationalHierarchyItem) => void;
  selectedNodeId?: string;
  viewMode: 'flat' | 'attached';
  parentColor?: string; // For attached mode, to inherit parent color
}

const UNIT_TYPE_COLORS = {
  'division': 'bg-blue-100 border-blue-300 hover:bg-blue-200',
  'department': 'bg-green-100 border-green-300 hover:bg-green-200',
  'team': 'bg-orange-100 border-orange-300 hover:bg-orange-200',
  'unit': 'bg-purple-100 border-purple-300 hover:bg-purple-200',
};

const UNIT_TYPE_ICONS = {
  'division': <Building2 className="h-5 w-5 text-blue-500" />,
  'department': <Building2 className="h-4 w-4 text-green-500" />,
  'team': <Users className="h-4 w-4 text-orange-500" />,
  'unit': <Layers className="h-4 w-4 text-purple-500" />,
};

const ChartNode: React.FC<ChartNodeProps> = ({ 
  node, 
  children, 
  isExpanded, 
  toggleExpand,
  onNodeClick,
  selectedNodeId,
  viewMode,
  parentColor
}) => {
  const hasChildren = !!children;
  const isSelected = node.id === selectedNodeId;
  
  // Determine styling based on node type and view mode
  let nodeStyle = '';
  let iconComponent = null;
  
  // For division/higher level units
  if (node.unit_type === 'division' || node.unit_type === 'unit') {
    nodeStyle = UNIT_TYPE_COLORS[node.unit_type as keyof typeof UNIT_TYPE_COLORS] || 'bg-gray-100 border-gray-300 hover:bg-gray-200';
    iconComponent = UNIT_TYPE_ICONS[node.unit_type as keyof typeof UNIT_TYPE_ICONS];
  } 
  // For departments in attached mode
  else if (node.unit_type === 'department' && viewMode === 'attached') {
    // Create a lighter version of parent's color or use default
    const baseColor = parentColor || 'bg-green-100 border-green-300';
    nodeStyle = `${baseColor.replace('100', '50').replace('300', '200')} border-dashed`;
    iconComponent = UNIT_TYPE_ICONS['department'];
  }
  // For departments in flat mode or teams
  else {
    nodeStyle = UNIT_TYPE_COLORS[node.unit_type as keyof typeof UNIT_TYPE_COLORS] || 'bg-gray-100 border-gray-300 hover:bg-gray-200';
    iconComponent = UNIT_TYPE_ICONS[node.unit_type as keyof typeof UNIT_TYPE_ICONS];
  }

  // Add selected state styling
  if (isSelected) {
    nodeStyle += ' ring-2 ring-primary ring-offset-2';
  }

  // Apply different styles based on view mode for departments
  const containerStyle = 
    viewMode === 'attached' && node.unit_type === 'department'
      ? 'mr-2 ml-6 my-1' // Indented and attached to parent
      : 'my-2';          // Regular spacing
      
  // Node size based on type and view mode
  const nodeSize = 
    viewMode === 'attached' && node.unit_type === 'department'
      ? 'px-3 py-1.5 text-sm' // Smaller for attached departments
      : 'px-4 py-2';          // Regular size

  return (
    <div className={containerStyle}>
      <div 
        className={cn(
          "border rounded-md transition-colors cursor-pointer",
          nodeStyle,
          nodeSize
        )}
        onClick={() => onNodeClick(node)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {iconComponent}
            <span>{node.name}</span>
          </div>
          
          {hasChildren && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand();
              }}
            >
              {isExpanded ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
          )}
        </div>
      </div>
      
      {isExpanded && hasChildren && (
        <div className={cn(
          "mr-0",
          viewMode === 'attached' ? "ml-6 border-l-2 border-dashed border-gray-300 pl-2" : "ml-8"
        )}>
          {children}
        </div>
      )}
    </div>
  );
};

interface OrganizationalChartProps {
  onUnitClick: (unit: OrganizationalHierarchyItem) => void;
  selectedUnitId?: string;
}

export function OrganizationalChart({ onUnitClick, selectedUnitId }: OrganizationalChartProps) {
  const { data: units, isLoading, error } = useOrganizationalHierarchy();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'flat' | 'attached'>('attached');

  const toggleNodeExpand = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const buildHierarchyTree = (unitsList: OrganizationalHierarchyItem[] | undefined) => {
    if (!unitsList) return null;

    // Create map for quick lookup
    const unitsMap: Record<string, {
      unit: OrganizationalHierarchyItem,
      children: string[]
    }> = {};

    // First pass: create map entries
    unitsList.forEach(unit => {
      unitsMap[unit.id] = {
        unit,
        children: []
      };
    });

    // Second pass: populate children arrays
    unitsList.forEach(unit => {
      if (unit.parent_id && unitsMap[unit.parent_id]) {
        unitsMap[unit.parent_id].children.push(unit.id);
      }
    });

    // Function to recursively render nodes
    const renderNode = (nodeId: string, parentColor?: string) => {
      const { unit, children } = unitsMap[nodeId];
      const isExpanded = !!expandedNodes[nodeId];
      
      // Determine the color to pass down to children (for attached mode)
      const currentColor = UNIT_TYPE_COLORS[unit.unit_type as keyof typeof UNIT_TYPE_COLORS];
      
      return (
        <ChartNode
          key={unit.id}
          node={unit}
          isExpanded={isExpanded}
          toggleExpand={() => toggleNodeExpand(unit.id)}
          onNodeClick={onUnitClick}
          selectedNodeId={selectedUnitId}
          viewMode={viewMode}
          parentColor={currentColor}
        >
          {children.map(childId => renderNode(childId, currentColor))}
        </ChartNode>
      );
    };

    // Get root nodes (no parent_id)
    const rootNodeIds = unitsList
      .filter(unit => !unit.parent_id)
      .map(unit => unit.id);

    return rootNodeIds.map(id => renderNode(id));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-4">
          <p className="text-destructive">خطأ في تحميل الهيكل التنظيمي</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">الهيكل التنظيمي</h3>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={viewMode === 'flat' ? 'default' : 'outline'}
              onClick={() => setViewMode('flat')}
            >
              منفصل
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'attached' ? 'default' : 'outline'}
              onClick={() => setViewMode('attached')}
            >
              متصل
            </Button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[500px]">
          {buildHierarchyTree(units)}
        </div>
      </CardContent>
    </Card>
  );
}
