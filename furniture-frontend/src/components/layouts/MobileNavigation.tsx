import { useEffect, useState } from "react";
import { Link } from "react-router";
// import { cn } from "@/lib/utils";
import type { MainNavItem } from "@/types";
import { Icons } from "../Icon";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@radix-ui/react-scroll-area";

interface MainNavigationProps {
  items: MainNavItem[];
}

function MobileNavigation({ items }: MainNavigationProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const query = "(min-width:1024px)";
  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setIsDesktop(event.matches);
    }
    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    return () => {
      result.removeEventListener("change", onChange);
    };
  }, [query, isDesktop]);

  if (isDesktop) {
    return null;
  }
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-4 size-5">
            <Icons.menu aria-hidden={true} />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side={"left"} className="pl-4 pr-0 pt-9">
          <SheetClose asChild>
            <Link to={"/"} className="flex text-center">
              <Icons.logo className="mr-2 size-6" />
              <span className="font-bold">{siteConfig.name}</span>
              <span className="sr-only">Home</span>
            </Link>
          </SheetClose>
          <ScrollArea className="h-[calc(100vh - 8rem)] my-4 pb-8">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>{items?.[0].title}</AccordionTrigger>
                <AccordionContent>
                  <div className="ml-2 flex flex-col space-y-2">
                    {items?.[0]?.card &&
                      items?.[0]?.card.map((item) => (
                        <SheetClose asChild key={item.title}>
                          <Link
                            to={String(item.href)}
                            className="text-foreground/70"
                          >
                            {item.title}
                          </Link>
                        </SheetClose>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="mt-4 flex flex-col space-y-2">
              {items?.[0]?.menu &&
                items[0].menu.map((item) => (
                  <SheetClose asChild key={item.title}>
                    <Link to={String(item.href)} className="">
                      {item.title}
                    </Link>
                  </SheetClose>
                ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNavigation;
