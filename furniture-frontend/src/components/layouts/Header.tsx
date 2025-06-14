import MainNavigation from "./MainNavigation";
import { siteConfig } from "@/config/site";
import MobileNavigation from "./MobileNavigation";
import { ModeToggle } from "../ui/mode-toggle";
import AuthDropDown from "@/components/layouts/AuthDropDown";
import CartSheet from "./CartSheet";
import ProgressBar from "@/components/layouts/ProgressBar";
import { User } from "@/types";

interface HeaderProps {
  user: User;
  isLoading: boolean;
}
function Header({ user, isLoading }: HeaderProps) {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background">
      <nav className="container mx-auto flex h-16 items-center">
        <ProgressBar />
        <MainNavigation items={siteConfig.mainNav} />
        <MobileNavigation items={siteConfig.mainNav} />
        <div className="mr-8 flex flex-1 items-center justify-end space-x-4 lg:mr-0">
          <CartSheet />
          <ModeToggle />
          <div className="relative">
            {!isLoading && <AuthDropDown user={user} />}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
