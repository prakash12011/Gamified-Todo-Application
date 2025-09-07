"use client";

import { usePWA } from "@/components/pwa/pwa-provider";
import { Alert } from "@/components/ui/alert";
import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowAlert(true);
      // Auto-hide after 5 seconds if back online
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowAlert(false);
    }
  }, [isOnline]);

  if (!showAlert) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50">
      <Alert className={`border-l-4 ${isOnline ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
        <div className="flex items-center">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-600 mr-2" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-600 mr-2" />
          )}
          <span className={`text-sm font-medium ${isOnline ? 'text-green-800' : 'text-red-800'}`}>
            {isOnline ? 'Back Online' : 'You are offline'}
          </span>
        </div>
        {!isOnline && (
          <p className="text-xs text-red-700 mt-1">
            Some features may not be available until connection is restored.
          </p>
        )}
      </Alert>
    </div>
  );
}
