
import * as React from "react";
import { SearchForm } from "@/components/SearchForm";
import { VersionSwitcher } from "@/components/VersionSwitcher";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [{
    title: "Operations",
    url: "#",
    items: [{
      title: "Fokusark",
      url: "/fokusark",
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
                    <SidebarMenuButton asChild isActive={item.isActive} className="transition-all duration-200">
                      <a href={item.url}>
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
