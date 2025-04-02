
import React, { useState } from "react";
import { ChevronRight, ChevronDown, Building2, FolderTree, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrganizationalUnit {
  id: string;
  name: string;
  description?: string;
  unit_type: string;
  parent_id?: string;
  is_active?: boolean;
  position_type?: 'standard' | 'side' | 'assistant';
}

interface OrganizationTreeViewProps {
  units: OrganizationalUnit[];
  onUnitClick: (unit: OrganizationalUnit) => void;
  selectedUnitId?: string;
}

export function OrganizationTreeView({ units, onUnitClick, selectedUnitId }: OrganizationTreeViewProps) {
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  // Function to toggle expanded state of a unit
  const toggleExpand = (unitId: string) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  // Get root level units (no parent_id)
  const rootUnits = units.filter(unit => !unit.parent_id);

  // Get children of a specific unit
  const getChildUnits = (parentId: string) => {
    return units.filter(unit => unit.parent_id === parentId);
  };

  // Render a unit and its children recursively
  const renderUnit = (unit: OrganizationalUnit, level = 0) => {
    const children = getChildUnits(unit.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedUnits[unit.id];
    const isSelected = unit.id === selectedUnitId;
    
    // Divide children into standard and side/assistant
    const standardChildren = children.filter(child => 
      !child.position_type || child.position_type === 'standard'
    );
    
    const sideChildren = children.filter(child => 
      child.position_type === 'side' || child.position_type === 'assistant'
    );

    return (
      <div key={unit.id}>
        <div 
          className={cn(
            "flex items-center py-1 px-2 hover:bg-secondary/50 rounded-md cursor-pointer",
            isSelected && "bg-secondary",
            (unit.position_type === 'side' || unit.position_type === 'assistant') && "italic"
          )}
          style={{ paddingRight: `${level * 12 + 8}px` }}
        >
          {hasChildren ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(unit.id);
              }}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : (
            <div className="w-6" />
          )}
          
          <div 
            className="flex items-center gap-2 flex-1 py-1" 
            onClick={() => onUnitClick(unit)}
          >
            {getUnitIcon(unit.unit_type, unit.position_type)}
            <span className={cn(
              unit.position_type === 'side' && "text-gray-600",
              unit.position_type === 'assistant' && "text-gray-500 font-light"
            )}>
              {unit.name}
            </span>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {/* First render standard children */}
            {standardChildren.map(childUnit => renderUnit(childUnit, level + 1))}
            
            {/* Then render side positions with slight indentation and styling */}
            {sideChildren.length > 0 && (
              <div className="mt-1 border-r-2 border-dotted border-gray-200 mr-4 pr-2">
                {sideChildren.map(childUnit => renderUnit(childUnit, level + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Get appropriate icon based on unit type and position type
  const getUnitIcon = (unitType: string, positionType?: string) => {
    if (positionType === 'side' || positionType === 'assistant') {
      return <FileText className="h-4 w-4 text-gray-400" />;
    }
    
    switch (unitType.toLowerCase()) {
      case 'department':
        return <Building2 className="h-4 w-4 text-blue-500" />;
      case 'division':
        return <FolderTree className="h-4 w-4 text-green-500" />;
      case 'team':
        return <Users className="h-4 w-4 text-orange-500" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  if (units.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">لا توجد وحدات تنظيمية</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[400px]">
      {rootUnits.map(unit => renderUnit(unit))}
    </div>
  );
}
