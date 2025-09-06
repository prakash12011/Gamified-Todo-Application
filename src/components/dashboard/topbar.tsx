"use client";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Coins } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchUserProfile } from "@/lib/supabase/profiles";
import { Profile } from "@/types/profile";

export default function Topbar() {
  const { user } = useAuth();
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

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
      <div className="font-semibold text-lg">Dashboard</div>
      <div className="flex items-center gap-4">
        <Badge variant="secondary">Lvl {displayProfile.level}</Badge>
        <div className="flex items-center gap-1 text-yellow-500">
          <Coins size={18} />
          <span className="font-medium">{displayProfile.coins}</span>
        </div>
        <Avatar>
          <AvatarImage src={displayProfile.avatar_url || undefined} alt={displayProfile.username || "User"} />
          <AvatarFallback>{(displayProfile.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
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
