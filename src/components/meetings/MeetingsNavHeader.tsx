
import { useLocation, Link } from "react-router-dom";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const MeetingsNavHeader = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <div className="border-b sticky top-16 z-30 w-full bg-background">
      <NavigationMenu dir="rtl" className="mx-auto">
        <NavigationMenuList className="px-4 py-2">
          <NavigationMenuItem>
            <Link
              to="/admin/meetings"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-base font-medium transition-colors hover:text-primary",
                (currentPath === "/admin/meetings" || currentPath.startsWith("/admin/meetings/folder/")) ?
                  "text-primary" : "text-muted-foreground"
              )}
            >
              المجلدات
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link
              to="/admin/meetings/list"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-base font-medium transition-colors hover:text-primary",
                currentPath === "/admin/meetings/list" ?
                  "text-primary" : "text-muted-foreground"
              )}
            >
              كل الاجتماعات
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link
              to="/admin/meetings/calendar"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-base font-medium transition-colors hover:text-primary",
                currentPath === "/admin/meetings/calendar" ?
                  "text-primary" : "text-muted-foreground"
              )}
            >
              التقويم
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};
