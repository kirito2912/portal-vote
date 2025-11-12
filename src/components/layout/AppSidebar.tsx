import { Home, Vote, BarChart3, Info, Shield } from "lucide-react";
import { NavLink } from "@/components/NavLink";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Inicio", url: "/", icon: Home },
  { title: "Votar", url: "/vote", icon: Vote },
  { title: "Resultados", url: "/results", icon: BarChart3 },
];

const secondaryItems = [
  { title: "Acerca de", url: "/about", icon: Info },
  { title: "Admin", url: "/admin", icon: Shield },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="bg-gray-800 border-r border-gray-700">
      <SidebarContent className="bg-gray-800">
        <SidebarGroup className="bg-gray-800">
          <SidebarGroupLabel className="text-gray-400 px-4 bg-gray-800">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent className="bg-gray-800">
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title} className="bg-gray-800">
                  <SidebarMenuButton asChild className="bg-gray-800 hover:bg-gray-700">
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors bg-gray-800"
                      activeClassName="bg-blue-600 text-white"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="bg-gray-800">
          <SidebarGroupLabel className="text-gray-400 px-4 bg-gray-800">
            Otros
          </SidebarGroupLabel>
          <SidebarGroupContent className="bg-gray-800">
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title} className="bg-gray-800">
                  <SidebarMenuButton asChild className="bg-gray-800 hover:bg-gray-700">
                    <NavLink 
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors bg-gray-800"
                      activeClassName="bg-blue-600 text-white"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}