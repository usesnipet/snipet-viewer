import { Outlet } from "react-router-dom";
import { AppSidebar } from "../sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export function RootLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}