
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Building2, FolderTree, Users, FileText } from "lucide-react";
import { OrganizationalHierarchyItem } from "@/hooks/hr/useOrganizationalHierarchy";

interface OrganizationalUnitDetailsProps {
  unit: OrganizationalHierarchyItem;
}

export function OrganizationalUnitDetails({ unit }: OrganizationalUnitDetailsProps) {
  const getTypeIcon = () => {
    if (unit.position_type === 'side' || unit.position_type === 'assistant') {
      return <FileText className="h-5 w-5 text-gray-400" />;
    }
    
    switch (unit.unit_type.toLowerCase()) {
      case 'department':
        return <Building2 className="h-5 w-5 text-blue-500" />;
      case 'division':
        return <FolderTree className="h-5 w-5 text-green-500" />;
      case 'team':
        return <Users className="h-5 w-5 text-orange-500" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };
  
  const getUnitTypeLabel = () => {
    switch (unit.unit_type.toLowerCase()) {
      case 'department':
        return 'إدارة';
      case 'division':
        return 'قسم';
      case 'team':
        return 'فريق';
      default:
        return unit.unit_type;
    }
  };
  
  const getPositionTypeLabel = () => {
    switch (unit.position_type) {
      case 'side':
        return 'منصب جانبي';
      case 'assistant':
        return 'منصب مساعد';
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {getTypeIcon()}
        <h2 className="text-xl font-semibold">{unit.name}</h2>
        {unit.position_type !== 'standard' && (
          <Badge variant="outline" className="text-gray-500 font-normal">
            {getPositionTypeLabel()}
          </Badge>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{getUnitTypeLabel()}</Badge>
        <Badge variant="outline">المستوى: {unit.level}</Badge>
      </div>
      
      {unit.description && (
        <p className="text-sm text-muted-foreground">
          {unit.description}
        </p>
      )}
    </div>
  );
}
