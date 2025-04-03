'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UseNavigation } from "@/hooks/useNavigation";
import { UserButton } from "@clerk/nextjs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import Link from "next/link";
import { ThemeToggle } from '@/components/ui/theme/theme-toggle';
import { Badge } from "@/components/ui/badge";


function DesktopNav() {
   const paths=UseNavigation();

  return <Card className="hidden lg:flex  lg:flex-col lg:justify-between lg:item-center lg:h-full lg:w-16 lg:px-2 lg:py-4">
    <nav>
        <ul className="flex flex-col item-center gap-4">
            {paths.map((path, id) =>{
                return (
                    <li key={id} className="relative">
                        <Link href={path.href}>
                        <Tooltip>
                            <TooltipTrigger>
                               <Button size="icon" variant={path.active? "default":"outline"} >
                                {path.icon}
                               </Button>
                               {path.count?<Badge className="absolute left-6 bottom-7 px-2" >
                                {path.count}
                               </Badge> :null}
                            </TooltipTrigger>
                            <TooltipContent>
                                {path.name}
                            </TooltipContent>
                        </Tooltip>
                        </Link>
                    </li>
                )
            } )}
        </ul>
    </nav>
    <div className="flex flex-col items-center gap-4">
        <ThemeToggle/>
        <UserButton  />
      </div>
  </Card>;
}

export default DesktopNav