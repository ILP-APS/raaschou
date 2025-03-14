
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardCard } from "@/components/DashboardCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { BarChart, LineChart, PieChart } from "lucide-react";

export default function Index() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur-sm">
            <SidebarTrigger className="-ml-1 transition-transform duration-200 hover:scale-105" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#" className="transition-colors duration-200 hover:text-primary">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex flex-1 flex-col gap-6 p-6">
            <div className="grid auto-rows-min gap-6 md:grid-cols-3">
              <DashboardCard className="flex flex-col items-center justify-center gap-4">
                <div className="flex aspect-square size-16 items-center justify-center rounded-full bg-primary/10">
                  <BarChart className="size-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">Analytics</h3>
                  <p className="text-sm text-muted-foreground">Monitor your key metrics</p>
                </div>
              </DashboardCard>
              
              <DashboardCard className="flex flex-col items-center justify-center gap-4">
                <div className="flex aspect-square size-16 items-center justify-center rounded-full bg-primary/10">
                  <LineChart className="size-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">Performance</h3>
                  <p className="text-sm text-muted-foreground">Track system performance</p>
                </div>
              </DashboardCard>
              
              <DashboardCard className="flex flex-col items-center justify-center gap-4">
                <div className="flex aspect-square size-16 items-center justify-center rounded-full bg-primary/10">
                  <PieChart className="size-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">Distribution</h3>
                  <p className="text-sm text-muted-foreground">Resource allocation</p>
                </div>
              </DashboardCard>
            </div>
            
            <DashboardCard className="min-h-[50vh] flex-1 md:min-h-min">
              <h2 className="mb-6 text-2xl font-semibold">Data Fetching</h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                Data fetching in modern applications can be implemented in different ways, each with their own benefits and trade-offs. This guide will help you understand the options available and how to choose the right approach for your use case.
              </p>
              <h3 className="mb-2 mt-6 text-xl font-medium">Server-side Rendering</h3>
              <p className="leading-relaxed text-muted-foreground">
                With server-side rendering, data is fetched on the server and the fully rendered HTML is sent to the client. This approach provides better SEO and faster initial load times.
              </p>
              <h3 className="mb-2 mt-6 text-xl font-medium">Client-side Fetching</h3>
              <p className="leading-relaxed text-muted-foreground">
                Client-side fetching is performed directly in the browser, which can provide a more dynamic user experience after the initial page load.
              </p>
              <h3 className="mb-2 mt-6 text-xl font-medium">Static Site Generation</h3>
              <p className="leading-relaxed text-muted-foreground">
                With static site generation, data is fetched at build time and pages are pre-rendered to static HTML, providing the benefits of both performance and SEO.
              </p>
            </DashboardCard>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
