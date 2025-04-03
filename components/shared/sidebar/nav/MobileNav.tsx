"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme/theme-toggle";
import { useConversation } from "@/hooks/useConversation";
import { UseNavigation } from "@/hooks/useNavigation";
import { UserButton } from "@clerk/nextjs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Badge } from "lucide-react";
import Link from "next/link";

function MobileNav() {
  const paths = UseNavigation();
  const {isActive}=useConversation()
  if(isActive) return null; 

  return (
    <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] flex items-center h-16 p-2 lg:hidden bg-white shadow-md rounded-full">
      <nav className="w-full">
        <ul className="flex justify-evenly items-center w-full">
          {paths.map((path, id) => (
            <li key={id} className="relative">
              <Link href={path.href}>
                <Tooltip>
                  <TooltipTrigger>
                    <Button size="icon" variant={path.active ? "default" : "outline"}>
                      {path.icon}
                    </Button>
                     {path.count?<Badge className="absolute left-6 bottom-7 px-2" >
                                                    {path.count}
                                                   </Badge> :null}
                  </TooltipTrigger>
                  <TooltipContent>{path.name}</TooltipContent>
                </Tooltip>
              </Link>
            </li>
          ))}
            <ThemeToggle/>
          
          {/* Clerk User Button inside Nav */}
          <li>

          
            <UserButton />
          </li>
        </ul>
      </nav>
    </Card>
  );
}

export default MobileNav;
