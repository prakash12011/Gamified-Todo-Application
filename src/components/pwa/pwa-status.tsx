"use client";

import { usePWA } from "@/components/pwa/pwa-provider";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useIsPWA } from "@/hooks/useIsPWA";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Smartphone, Download, CheckCircle } from "lucide-react";

export function PWAStatus() {
  const { isOnline, isLoading, registration } = usePWA();
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();
  const isPWA = useIsPWA();

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">PWA Status</h3>

      <div className="space-y-3">
        {/* Online Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Connection</span>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>

        {/* PWA Mode */}
        <div className="flex items-center justify-between">
          <span className="text-sm">App Mode</span>
          <Badge variant={isPWA ? "default" : "secondary"}>
            {isPWA ? (
              <>
                <Smartphone className="w-3 h-3 mr-1" />
                PWA
              </>
            ) : (
              "Browser"
            )}
          </Badge>
        </div>

        {/* Installation Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Installation</span>
          <Badge variant={isInstalled ? "default" : isInstallable ? "secondary" : "outline"}>
            {isInstalled ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Installed
              </>
            ) : isInstallable ? (
              <>
                <Download className="w-3 h-3 mr-1" />
                Available
              </>
            ) : (
              "Not Available"
            )}
          </Badge>
        </div>

        {/* Service Worker */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Service Worker</span>
          <Badge variant={registration ? "default" : "outline"}>
            {registration ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Install Button */}
        {isInstallable && !isInstalled && (
          <Button
            onClick={installPWA}
            className="w-full mt-3"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Install PWA
          </Button>
        )}

        {/* Debug Info */}
        <details className="mt-3">
          <summary className="text-xs text-gray-500 cursor-pointer">Debug Info</summary>
          <div className="mt-2 text-xs space-y-1">
            <div>Online: {isOnline ? 'Yes' : 'No'}</div>
            <div>PWA Mode: {isPWA ? 'Yes' : 'No'}</div>
            <div>Installable: {isInstallable ? 'Yes' : 'No'}</div>
            <div>Installed: {isInstalled ? 'Yes' : 'No'}</div>
            <div>SW Registered: {registration ? 'Yes' : 'No'}</div>
            <div>SW State: {registration?.active?.state || 'N/A'}</div>
          </div>
        </details>
      </div>
    </Card>
  );
}
