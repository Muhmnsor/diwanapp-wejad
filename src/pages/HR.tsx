
import React, { useState } from "react";
import { SearchIcon } from "lucide-react";
import { HRTabs } from "@/components/hr/HRTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { PermissionGuard } from "@/components/permissions/PermissionGuard";

const HR = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement search functionality
  };

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">إدارة الموارد البشرية</h1>
        
        <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
          <Input
            placeholder="بحث عن موظف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-auto min-w-[250px] text-right"
          />
          <Button type="submit" variant="outline" size="icon">
            <SearchIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <PermissionGuard permissions={["hr.view", "hr.manage"]}>
        <HRTabs defaultTab="dashboard" />
      </PermissionGuard>
    </div>
  );
};

export default HR;
