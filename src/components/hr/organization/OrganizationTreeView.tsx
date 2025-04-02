
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
      <div key={unit.id} className="relative">
        <div 
          className={cn(
            "flex items-center py-2 px-3 my-1 hover:bg-secondary/50 rounded-md cursor-pointer transition-colors",
            isSelected && "bg-secondary font-medium",
            (unit.position_type === 'side' || unit.position_type === 'assistant') && "italic"
          )}
          style={{ 
            marginRight: `${level * 4}px`,
            marginLeft: `${level * 16}px` 
          }}
        >
          {hasChildren ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 p-0 mr-1" 
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(unit.id);
              }}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : (
            <div className="w-6 mr-1" />
          )}
          
          <div 
            className="flex items-center gap-2 flex-1 py-1" 
            onClick={() => onUnitClick(unit)}
          >
            {getUnitIcon(unit.unit_type, unit.position_type)}
            <span className={cn(
              "text-sm transition-colors",
              unit.position_type === 'side' && "text-gray-600",
              unit.position_type === 'assistant' && "text-gray-500 font-light"
            )}>
              {unit.name}
            </span>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="relative">
            {/* Standard children with vertical line connector */}
            {standardChildren.length > 0 && (
              <div className="relative">
                <div 
                  className="absolute border-r-2 border-gray-200" 
                  style={{ 
                    right: `${level * 4 + 17}px`,
                    top: '0px',
                    height: '100%',
                    width: '2px'
                  }}
                />
                <div className="mt-1 pt-1">
                  {standardChildren.map(childUnit => renderUnit(childUnit, level + 1))}
                </div>
              </div>
            )}
            
            {/* Side/assistant positions with dotted line styling */}
            {sideChildren.length > 0 && (
              <div className="relative mt-3">
                <div 
                  className="absolute border-r-2 border-dotted border-gray-300" 
                  style={{ 
                    right: `${level * 4 + 17}px`,
                    top: '-10px',
                    height: 'calc(100% + 10px)',
                    width: '2px'
                  }}
                />
                <div 
                  className="absolute border-t-2 border-dotted border-gray-300" 
                  style={{
                    right: `${level * 4 + 17}px`,
                    top: '-10px',
                    width: '12px',
                  }}
                />
                <div className="pt-1 pr-2">
                  {sideChildren.map(childUnit => renderUnit(childUnit, level + 1))}
                </div>
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
      return <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />;
    }
    
    switch (unitType.toLowerCase()) {
      case 'department':
        return <Building2 className="h-4 w-4 text-blue-500 flex-shrink-0" />;
      case 'division':
        return <FolderTree className="h-4 w-4 text-green-500 flex-shrink-0" />;
      case 'team':
        return <Users className="h-4 w-4 text-orange-500 flex-shrink-0" />;
      default:
        return <Building2 className="h-4 w-4 flex-shrink-0" />;
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
    <div className="overflow-y-auto max-h-[500px] pr-2">
      {rootUnits.map(unit => renderUnit(unit))}
    </div>
  );
}
