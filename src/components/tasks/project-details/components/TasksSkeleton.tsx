
import { Skeleton } from "@/components/ui/skeleton";

export const TasksSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border rounded-md p-4 space-y-2">
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-full max-w-[70%]" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
