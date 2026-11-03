import HomeIcon from "@/components/ui/home-icon";
import UserIcon from "@/components/ui/user-icon";
import LayersIcon from "@/components/ui/layers-icon";
import FileDescriptionIcon from "@/components/ui/file-description-icon";
import { NavBar } from "@/components/ui/tubelight-navbar";

export function NavBarDemo() {
  const navItems = [
    { name: "Home", url: "#", icon: HomeIcon },
    { name: "About", url: "#", icon: UserIcon },
    { name: "Projects", url: "#", icon: LayersIcon },
    { name: "Resume", url: "#", icon: FileDescriptionIcon },
  ];

  return <NavBar items={navItems} />;
}
