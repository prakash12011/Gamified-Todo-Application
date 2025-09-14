"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ServiceWorkerClear() {
  const clearServiceWorker = async () => {
    try {
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');

      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
        console.log('All service workers unregistered');
      }

      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      console.log('Storage cleared');

      alert('Cache and service workers cleared! Please refresh the page.');
      
      // Force reload
      window.location.reload();
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Error clearing cache. Please manually clear in DevTools.');
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-yellow-800">Development Debug</h3>
          <p className="text-sm text-yellow-600">Clear service worker cache if experiencing offline issues</p>
        </div>
        <Button 
          onClick={clearServiceWorker}
          variant="outline"
          size="sm"
          className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
        >
          Clear SW Cache
        </Button>
      </div>
    </Card>
  );
}
