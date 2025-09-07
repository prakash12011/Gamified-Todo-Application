"use client";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Coins, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchUserProfile } from "@/lib/supabase/profiles";
import { Profile } from "@/types/profile";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function Topbar() {
  const { user, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id).then(setProfile);
    }
  }, [user]);

  // Fallback profile data if not loaded yet
  const displayProfile = profile || {
    username: user?.email?.split("@")[0] || "User",
    level: 1,
    coins: 100,
    avatar_url: null,
  };

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      if (signOut) {
        await signOut();
      } else {
        // Fallback: redirect to login page
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          className="md:hidden"
          aria-label="Toggle sidebar"
          onClick={() => {
            // Dispatch a custom event that the sidebar component will listen for
            document.dispatchEvent(new CustomEvent('toggle-sidebar'));
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
            <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </Button>
        <div className="font-semibold text-lg">Dashboard</div>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant="secondary">Lvl {displayProfile.level}</Badge>
        <div className="flex items-center gap-1 text-yellow-500">
          <Coins size={18} />
          <span className="font-medium">{displayProfile.coins}</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
              <AvatarImage src={displayProfile.avatar_url || undefined} alt={displayProfile.username || "User"} />
              <AvatarFallback>{(displayProfile.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{displayProfile.username}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex w-full cursor-pointer items-center">
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          size="icon"
          variant="ghost"
          aria-label="Toggle dark mode"
          onClick={() => setDarkMode((d) => !d)}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </header>
  );
}
