import { ReactNode } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 md:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
