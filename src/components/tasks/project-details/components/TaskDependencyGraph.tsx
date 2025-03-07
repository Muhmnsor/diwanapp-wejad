
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Node {
  id: string;
  label: string;
  status: string;
}

interface Edge {
  source: string;
  target: string;
  type: string;
}

interface TaskDependencyGraphProps {
  projectId: string;
  className?: string;
  height?: number;
}

export const TaskDependencyGraph: React.FC<TaskDependencyGraphProps> = ({
  projectId,
  className = "",
  height = 400
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const fetchDependencyData = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      try {
        // Fetch all tasks for this project
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('id, title, status')
          .eq('project_id', projectId);
          
        if (tasksError) throw tasksError;
        
        // Fetch all dependencies for these tasks
        const { data: depsData, error: depsError } = await supabase
          .from('task_dependencies')
          .select('task_id, dependency_task_id, dependency_type');
          
        if (depsError) throw depsError;
        
        // Create nodes and edges
        const nodeMap = (tasksData || []).reduce<Record<string, Node>>((acc, task) => {
          acc[task.id] = {
            id: task.id,
            label: task.title,
            status: task.status
          };
          return acc;
        }, {});
        
        // Filter for edges that have both source and target in our nodeMap
        const validEdges = (depsData || []).filter(dep => 
          nodeMap[dep.task_id] && nodeMap[dep.dependency_task_id]
        ).map(dep => ({
          source: dep.dependency_task_id, // From dependency to task
          target: dep.task_id,
          type: dep.dependency_type
        }));
        
        setNodes(Object.values(nodeMap));
        setEdges(validEdges);
      } catch (error) {
        console.error('Error fetching dependency data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDependencyData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{height: `${height}px`}}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If there are no dependencies, show a message
  if (edges.length === 0) {
    return (
      <div className="flex items-center justify-center bg-muted/20 rounded-md" style={{height: `${height}px`}}>
        <p className="text-muted-foreground">لا توجد تبعيات بين المهام في هذا المشروع</p>
      </div>
    );
  }

  // Simple SVG visualization (can be replaced with a more sophisticated graph library)
  return (
    <div className={`border rounded-md overflow-auto ${className}`} style={{height: `${height}px`}}>
      <svg width="100%" height="100%" viewBox={`0 0 1000 ${height}`}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" />
          </marker>
          <marker
            id="arrowhead-finish"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
            fill="blue"
          >
            <polygon points="0 0, 10 3.5, 0 7" />
          </marker>
          <marker
            id="arrowhead-start"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
            fill="green"
          >
            <polygon points="0 0, 10 3.5, 0 7" />
          </marker>
          <marker
            id="arrowhead-related"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
            fill="gray"
          >
            <polygon points="0 0, 10 3.5, 0 7" />
          </marker>
        </defs>
        
        {/* Simple layout (can be improved with force-directed graph algorithms) */}
        {nodes.map((node, index) => {
          const x = 150 + (index % 4) * 200;
          const y = 100 + Math.floor(index / 4) * 100;
          
          return (
            <g key={node.id} transform={`translate(${x}, ${y})`}>
              <circle 
                r="30" 
                fill={
                  node.status === 'completed' ? '#10b981' : 
                  node.status === 'in_progress' ? '#3b82f6' : 
                  '#f59e0b'
                } 
                stroke="#000" 
                strokeWidth="1"
              />
              <text 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fill="white"
                fontSize="12"
              >
                {node.label.substring(0, 10)}{node.label.length > 10 ? '...' : ''}
              </text>
            </g>
          );
        })}
        
        {/* Draw edges */}
        {edges.map((edge, index) => {
          const sourceIndex = nodes.findIndex(n => n.id === edge.source);
          const targetIndex = nodes.findIndex(n => n.id === edge.target);
          
          if (sourceIndex === -1 || targetIndex === -1) return null;
          
          const sourceX = 150 + (sourceIndex % 4) * 200;
          const sourceY = 100 + Math.floor(sourceIndex / 4) * 100;
          const targetX = 150 + (targetIndex % 4) * 200;
          const targetY = 100 + Math.floor(targetIndex / 4) * 100;
          
          // Calculate edge path
          const dx = targetX - sourceX;
          const dy = targetY - sourceY;
          const angle = Math.atan2(dy, dx);
          
          // Start and end points (outside the circles)
          const startX = sourceX + 30 * Math.cos(angle);
          const startY = sourceY + 30 * Math.sin(angle);
          const endX = targetX - 30 * Math.cos(angle);
          const endY = targetY - 30 * Math.sin(angle);
          
          // Edge styling based on dependency type
          let strokeColor = '#000';
          let markerEnd = 'url(#arrowhead)';
          let strokeWidth = 1;
          let strokeDasharray = '';
          
          switch (edge.type) {
            case 'finish-to-start':
              strokeColor = '#1e40af';
              markerEnd = 'url(#arrowhead-finish)';
              strokeWidth = 2;
              break;
            case 'start-to-start':
              strokeColor = '#047857';
              markerEnd = 'url(#arrowhead-start)';
              strokeWidth = 2;
              break;
            case 'finish-to-finish':
              strokeColor = '#b91c1c';
              markerEnd = 'url(#arrowhead-finish)';
              strokeWidth = 2;
              break;
            case 'relates_to':
              strokeColor = '#6b7280';
              markerEnd = 'url(#arrowhead-related)';
              strokeDasharray = '5,5';
              break;
            default:
              break;
          }
          
          return (
            <line
              key={`${edge.source}-${edge.target}-${index}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              markerEnd={markerEnd}
            />
          );
        })}
      </svg>
    </div>
  );
};
