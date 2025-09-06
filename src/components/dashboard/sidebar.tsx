import { Home, Calendar, Target, User, BarChart, CheckSquare, Eye } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", icon: <Home size={20} />, label: "Dashboard" },
  { href: "/dashboard/todos", icon: <CheckSquare size={20} />, label: "Todos" },
  { href: "/dashboard/calendar", icon: <Calendar size={20} />, label: "Calendar" },
  { href: "/dashboard/vision", icon: <Eye size={20} />, label: "Vision Board" },
  { href: "/dashboard/profile", icon: <User size={20} />, label: "Profile" },
  { href: "/dashboard/analytics", icon: <BarChart size={20} />, label: "Analytics" },
];

export default function Sidebar() {
  return (
    <aside className="flex flex-col w-56 bg-card border-r border-border p-4 space-y-2">
      <div className="text-xl font-bold mb-6">Gamified Todo</div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
