
import * as React from "react";
import { SearchForm } from "@/components/SearchForm";
import { VersionSwitcher } from "@/components/VersionSwitcher";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { CheckSquare } from "lucide-react";

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [{
    title: "Main Menu",
    url: "#",
    items: [{
      title: "Tasks",
      url: "#",
      icon: CheckSquare,
      isActive: true
    }]
  }]
};

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return <Sidebar {...props} className="animate-fade-in">
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map(item => <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map(item => <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive} className={`transition-all duration-200 ${item.isActive ? "sidebar-item-active" : "sidebar-item"}`}>
                      <a href={item.url}>
                        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                        {item.title}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>)}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>;
}
