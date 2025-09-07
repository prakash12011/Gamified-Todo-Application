"use client";

import { PWADebugPanel } from "@/components/pwa/pwa-debug-panel";
import { PWAStatus } from "@/components/pwa/pwa-status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PWATestPage() {
  const simulateOffline = () => {
    // This will trigger the service worker's offline handling
    fetch('/nonexistent-endpoint').catch(() => {
      console.log('Simulated network error');
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">PWA Testing & Debug</h1>
      
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Quick Tests</h2>
        <div className="flex gap-4">
          <Button onClick={simulateOffline}>
            Simulate Network Error
          </Button>
          <Button onClick={() => window.location.href = '/offline'}>
            Go to Offline Page
          </Button>
          <Button onClick={() => {
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistration().then(reg => {
                console.log('SW Registration:', reg);
              });
            }
          }}>
            Log SW Info
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PWAStatus />
        <PWADebugPanel />
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Instructions for Testing Offline Mode</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Open Chrome DevTools (F12)</li>
          <li>Go to Network tab</li>
          <li>Check "Offline" checkbox</li>
          <li>Try navigating or refreshing the page</li>
          <li>You should see the offline page instead of connection errors</li>
          <li>Check Application → Service Workers for more details</li>
        </ol>
      </Card>
    </div>
  );
}
