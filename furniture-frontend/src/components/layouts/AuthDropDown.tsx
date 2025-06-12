import { Link, Form } from "react-router";
// import { Icons } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Icons } from "../Icon";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { AccordionItem } from "../ui/accordion";
import { User } from "@/types";

interface UserProps {
  user: User | null;
}

const imageUrl = import.meta.env.VITE_IMAGE_URL;
function AuthDropDown({ user }: UserProps) {
  // Replace with actual user fetching logicI
  // const initialName = "Anonymous";
  // if (!user) {
  //   return (
  //     <Button size={"sm"} asChild>
  //       <Link to={"/signin"}>Sign In</Link>
  //       <span className="sr-only">Sign In</span>
  //     </Button>
  //   );
  // }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="size-8 rounded-full">
          <Avatar>
            <AvatarImage
              src={user ? imageUrl + user?.image : "none_profile.webp"}
              alt={user?.username ?? "Ananymous"}
            />
            <AvatarFallback>{user?.username}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.username ?? "Ananymous"}
            </p>
            {/* <p className="text-sm leading-none text-muted-foreground">
              {user.email}
            </p> */}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={"#"}>
            <Icons.dashboard className="mr-2 size-4" aria-hidden={true} />
            Dashboard
            <DropdownMenuShortcut>⇧⌘D</DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-1"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="flex gap-2">
                <Icons.gear className="mr-2 size-4" aria-hidden={true} />
                <span>Setting</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="ml-4 mt-2 flex flex-col space-y-1">
                  <Button
                    asChild
                    variant={"ghost"}
                    className="flex justify-start"
                  >
                    <Link to={"/editProfile"}>Edit Profile</Link>
                  </Button>
                  <Button
                    asChild
                    variant={"ghost"}
                    className="flex justify-start"
                  >
                    <Link to={"/changePassword"}>Change Password</Link>
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </DropdownMenuItem>
        {/* <ChangePassword /> */}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          {/* <Link to={"/login"}>
            <Icons.exit className="mr-2 size-4" aria-hidden={true} />
            Log Out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </Link> */}
          <Form method="POST" action="/logout">
            <button type="submit" className="flex w-full items-center">
              <Icons.exit className="mr-2 size-4" aria-hidden={true} />
              Logout
            </button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AuthDropDown;
