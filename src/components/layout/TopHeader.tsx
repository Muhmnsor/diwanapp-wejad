import { Logo } from "@/components/Logo";
import { UserNav } from "@/components/navigation/UserNav";
import { EventsNavBar } from "./EventsNavBar";

export const TopHeader = () => {
  console.log('Rendering TopHeader');
  
  return (
    <>
      <div className="w-full bg-white py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Logo />
            <UserNav />
          </div>
        </div>
      </div>
      <EventsNavBar />
    </>
  );
};