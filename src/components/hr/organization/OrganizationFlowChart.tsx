
import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  useReactFlow,
  Panel
} from "@xyflow/react";
import { Building2, FolderTree, Users, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// Import the required styles
import "@xyflow/react/dist/style.css";

interface OrganizationalUnit {
  id: string;
  name: string;
  description?: string;
  unit_type: string;
  parent_id?: string;
  is_active?: boolean;
  position_type?: 'standard' | 'side' | 'assistant';
}

interface OrganizationFlowChartProps {
  units: OrganizationalUnit[];
  onUnitClick: (unit: OrganizationalUnit) => void;
  selectedUnitId?: string;
}

export function OrganizationFlowChart({ units, onUnitClick, selectedUnitId }: OrganizationFlowChartProps) {
  // Convert organizational units to nodes
  const { nodes, edges } = useMemo(() => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];
    
    // Helper function to get the icon based on unit type
    const getUnitIcon = (unitType: string, positionType?: string) => {
      if (positionType === 'side' || positionType === 'assistant') {
        return FileText;
      }
      
      switch (unitType.toLowerCase()) {
        case 'department':
          return Building2;
        case 'division':
          return FolderTree;
        case 'team':
          return Users;
        default:
          return Building2;
      }
    };

    // Find root nodes (no parent_id)
    const rootUnits = units.filter(unit => !unit.parent_id);
    
    // Track positions for layout
    const positions: Record<string, { x: number, y: number }> = {};
    const levelWidths: Record<number, number> = {};
    const levelNodeCounts: Record<number, number> = {};
    const nodesByLevel: Record<number, OrganizationalUnit[]> = {};
    
    // First pass - determine levels
    const determineLevel = (unit: OrganizationalUnit, level = 0): number => {
      // Initialize arrays for this level if not already done
      if (!nodesByLevel[level]) {
        nodesByLevel[level] = [];
      }
      
      nodesByLevel[level].push(unit);
      
      if (!levelNodeCounts[level]) {
        levelNodeCounts[level] = 0;
      }
      levelNodeCounts[level]++;
      
      // Find children and process them
      const children = units.filter(u => u.parent_id === unit.id);
      let maxChildLevel = level;
      
      for (const child of children) {
        const childLevel = determineLevel(child, level + 1);
        maxChildLevel = Math.max(maxChildLevel, childLevel);
      }
      
      return maxChildLevel;
    };
    
    // Determine max levels starting from root nodes
    let maxLevel = 0;
    for (const rootUnit of rootUnits) {
      const unitMaxLevel = determineLevel(rootUnit);
      maxLevel = Math.max(maxLevel, unitMaxLevel);
    }
    
    // Calculate level widths
    for (let level = 0; level <= maxLevel; level++) {
      levelWidths[level] = nodesByLevel[level]?.length || 0;
    }
    
    // Calculate horizontal spacing for nodes
    const BASE_SPACING_X = 250;
    const BASE_SPACING_Y = 100;
    
    // Second pass - calculate positions and create nodes
    for (let level = 0; level <= maxLevel; level++) {
      const nodesInLevel = nodesByLevel[level] || [];
      const levelWidth = nodesInLevel.length * BASE_SPACING_X;
      const startX = -levelWidth / 2 + BASE_SPACING_X / 2;
      
      nodesInLevel.forEach((unit, index) => {
        // For side/assistant positions, adjust positions
        let yOffset = level * BASE_SPACING_Y;
        let xOffset = startX + index * BASE_SPACING_X;
        
        // For side and assistant positions, adjust position
        if (unit.position_type === 'side' || unit.position_type === 'assistant') {
          // Find the parent position
          const parentUnit = units.find(u => u.id === unit.parent_id);
          if (parentUnit && positions[parentUnit.id]) {
            const parentPos = positions[parentUnit.id];
            
            // Position to the right of parent for side/assistant
            xOffset = parentPos.x + 180;
            yOffset = parentPos.y + 30;
          }
        }
        
        positions[unit.id] = { x: xOffset, y: yOffset };
        
        // Create the node
        const UnitIcon = getUnitIcon(unit.unit_type, unit.position_type);
        
        const isSelected = unit.id === selectedUnitId;
        
        initialNodes.push({
          id: unit.id,
          position: positions[unit.id],
          data: { 
            label: unit.name,
            unit: unit,
            onClick: () => onUnitClick(unit)
          },
          type: 'organizationalUnit',
          style: {
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? '#6E59A5' : '#e2e8f0',
            backgroundColor: isSelected ? '#e5deff' : 'white',
            cursor: 'pointer',
          }
        });
        
        // Create the edge if there is a parent
        if (unit.parent_id) {
          const edgeType = unit.position_type === 'side' || unit.position_type === 'assistant' 
            ? 'smoothstep' 
            : 'step';
            
          const edgeStyle = unit.position_type === 'side' || unit.position_type === 'assistant' 
            ? { stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' } 
            : { stroke: '#94a3b8', strokeWidth: 1 };
          
          initialEdges.push({
            id: `e-${unit.parent_id}-${unit.id}`,
            source: unit.parent_id,
            target: unit.id,
            type: edgeType,
            style: edgeStyle,
            sourceHandle: 'bottom',
            targetHandle: 'top',
          });
        }
      });
    }
    
    return { nodes: initialNodes, edges: initialEdges };
  }, [units, selectedUnitId]);
  
  // Custom node renderer for organizational units
  const nodeTypes = useMemo(() => ({
    organizationalUnit: ({ data }: { data: any }) => {
      const unit = data.unit as OrganizationalUnit;
      const UnitIcon = data.unit.icon;
      
      let iconColor = "text-blue-500";
      if (unit.unit_type.toLowerCase() === 'division') {
        iconColor = "text-green-500";
      } else if (unit.unit_type.toLowerCase() === 'team') {
        iconColor = "text-orange-500";
      } else if (unit.position_type === 'side' || unit.position_type === 'assistant') {
        iconColor = "text-gray-400";
      }
      
      return (
        <div 
          className={cn(
            "px-3 py-2 min-w-40 border shadow-sm rounded-md bg-white hover:bg-secondary/50 transition-colors",
            (unit.position_type === 'side' || unit.position_type === 'assistant') && "italic",
            unit.id === selectedUnitId && "border-primary-500 bg-secondary font-medium"
          )}
          onClick={data.onClick}
        >
          <div className="flex items-center gap-2">
            {unit.unit_type.toLowerCase() === 'department' && <Building2 className={`h-4 w-4 ${iconColor} flex-shrink-0`} />}
            {unit.unit_type.toLowerCase() === 'division' && <FolderTree className={`h-4 w-4 ${iconColor} flex-shrink-0`} />}
            {unit.unit_type.toLowerCase() === 'team' && <Users className={`h-4 w-4 ${iconColor} flex-shrink-0`} />}
            {(unit.position_type === 'side' || unit.position_type === 'assistant') && 
              <FileText className={`h-4 w-4 ${iconColor} flex-shrink-0`} />
            }
            <span className={cn(
              "text-sm transition-colors",
              unit.position_type === 'side' && "text-gray-600",
              unit.position_type === 'assistant' && "text-gray-500 font-light"
            )}>
              {unit.name}
            </span>
          </div>
          <div className="hidden">
            <div className="connection-handle top" data-handle-id="top" data-handlepos={Position.Top} />
            <div className="connection-handle bottom" data-handle-id="bottom" data-handlepos={Position.Bottom} />
          </div>
        </div>
      );
    },
  }), [selectedUnitId]);

  // Handle flow props
  const flowClassName = "bg-slate-50";
  
  if (units.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md bg-slate-50 h-[500px] flex items-center justify-center">
        <p className="text-muted-foreground">لا توجد وحدات تنظيمية</p>
      </div>
    );
  }

  return (
    <div className="h-[500px] border rounded-md overflow-hidden bg-slate-50" dir="ltr">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        className={flowClassName}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="bottom-right" showInteractive={false} />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
}
