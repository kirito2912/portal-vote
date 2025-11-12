import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Vote } from "lucide-react";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-900">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 border-b border-gray-700 bg-gray-800">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="hover:bg-gray-700 rounded-lg p-2 text-white transition-colors" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Vote className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Sistema Electoral Nacional</h1>
              </div>
            </div>
          </header>
          <main className="flex-1 bg-gray-900">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}