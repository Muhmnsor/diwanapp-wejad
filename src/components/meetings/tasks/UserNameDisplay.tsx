
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserNameDisplayProps {
  userId: string | undefined;
}

export const UserNameDisplay: React.FC<UserNameDisplayProps> = ({ userId }) => {
  const [displayName, setDisplayName] = useState<string>("-");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserName = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("display_name, email")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user name:", error);
          setDisplayName(userId.substring(0, 8) + "...");
        } else if (data) {
          setDisplayName(data.display_name || data.email || userId.substring(0, 8) + "...");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setDisplayName(userId.substring(0, 8) + "...");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserName();
  }, [userId]);

  if (isLoading) {
    return <span className="text-gray-400">جاري التحميل...</span>;
  }

  return <span>{displayName}</span>;
};
