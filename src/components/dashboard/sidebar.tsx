"use client";

import { Home, Calendar, User, BarChart, CheckSquare, Eye, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", icon: <Home size={20} />, label: "Dashboard" },
  { href: "/dashboard/todos", icon: <CheckSquare size={20} />, label: "Todos" },
  { href: "/dashboard/calendar", icon: <Calendar size={20} />, label: "Calendar" },
  { href: "/dashboard/vision", icon: <Eye size={20} />, label: "Vision Board" },
  { href: "/dashboard/profile", icon: <User size={20} />, label: "Profile" },
  { href: "/dashboard/analytics", icon: <BarChart size={20} />, label: "Analytics" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for toggle-sidebar event from topbar
  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsOpen(prev => !prev);
    };

    document.addEventListener('toggle-sidebar', handleToggleSidebar);
    
    return () => {
      document.removeEventListener('toggle-sidebar', handleToggleSidebar);
    };
  }, []);

  // Handle responsive behavior
  const sidebarClasses = `
    ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
    md:translate-x-0
    transition-transform duration-300 ease-in-out
    fixed md:relative
    inset-y-0 left-0 z-40
    flex flex-col w-64 bg-card border-r border-border p-4 space-y-2
    md:flex
  `;

  return (
    <>
      {/* Overlay for mobile - only show when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between mb-6">
          <div className="text-xl font-bold">Gamified Todo</div>
          <Button 
            size="icon" 
            variant="ghost" 
            className="md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>
        
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)} // Close sidebar on mobile after navigation
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
