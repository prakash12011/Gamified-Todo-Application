"use client";

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ServiceWorkerDebugInfo {
  registration: ServiceWorkerRegistration | null;
  controller: ServiceWorker | null;
  state: string;
  scope: string;
  updateFound: boolean;
}

export function PWADebugPanel() {
  const [swInfo, setSwInfo] = useState<ServiceWorkerDebugInfo | null>(null);
  const [cacheInfo, setCacheInfo] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get service worker info
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        setSwInfo({
          registration,
          controller: navigator.serviceWorker.controller,
          state: registration?.active?.state || 'none',
          scope: registration?.scope || 'none',
          updateFound: false
        });
      });
    }

    // Get cache info
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        setCacheInfo(cacheNames);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const clearCaches = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      setCacheInfo([]);
      console.log('All caches cleared');
    }
  };

  const reregisterSW = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      
      window.location.reload();
    }
  };

  const testOfflineFeature = () => {
    // Force offline mode for testing
    window.location.href = '/offline';
  };

  return (
    <Card className="p-6 m-4">
      <h2 className="text-xl font-bold mb-4">PWA Debug Panel</h2>
      
      {/* Connection Status */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Connection Status</h3>
        <Badge variant={isOnline ? "default" : "destructive"}>
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      {/* Service Worker Info */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Service Worker</h3>
        {swInfo ? (
          <div className="space-y-2 text-sm">
            <div>Registration: <Badge variant={swInfo.registration ? "default" : "destructive"}>
              {swInfo.registration ? "Active" : "None"}
            </Badge></div>
            <div>Controller: <Badge variant={swInfo.controller ? "default" : "destructive"}>
              {swInfo.controller ? "Active" : "None"}
            </Badge></div>
            <div>State: <Badge variant="outline">{swInfo.state}</Badge></div>
            <div>Scope: <code className="text-xs bg-gray-100 p-1 rounded">{swInfo.scope}</code></div>
          </div>
        ) : (
          <Badge variant="destructive">Not Supported</Badge>
        )}
      </div>

      {/* Cache Info */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Caches ({cacheInfo.length})</h3>
        <div className="max-h-32 overflow-y-auto">
          {cacheInfo.map((cacheName, index) => (
            <div key={index} className="text-xs bg-gray-100 p-1 rounded mb-1">
              {cacheName}
            </div>
          ))}
        </div>
      </div>

      {/* Debug Actions */}
      <div className="space-y-2">
        <h3 className="font-semibold mb-2">Debug Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={clearCaches}>
            Clear Caches
          </Button>
          <Button variant="outline" size="sm" onClick={reregisterSW}>
            Re-register SW
          </Button>
          <Button variant="outline" size="sm" onClick={testOfflineFeature}>
            Test Offline Page
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>

      {/* Console Logs */}
      <div className="mt-4 text-xs text-gray-500">
        <p>Check browser console for detailed service worker logs</p>
        <p>Press F12 → Application tab → Service Workers for more info</p>
      </div>
    </Card>
  );
}
