"use client";

import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";

export function PWAInstallButton() {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();

  if (isInstalled) {
    return null; // Don't show if already installed
  }

  if (!isInstallable) {
    return null; // Don't show if not installable
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full mt-2"
      onClick={installPWA}
    >
      <Download className="w-4 h-4 mr-2" />
      Install App
      <Smartphone className="w-4 h-4 ml-2" />
    </Button>
  );
}
