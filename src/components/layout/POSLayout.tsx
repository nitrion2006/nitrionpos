import { SidebarProvider } from "@/components/ui/sidebar";
import { POSSidebar } from "./POSSidebar";

interface POSLayoutProps {
  children: React.ReactNode;
}

export function POSLayout({ children }: POSLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <POSSidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}