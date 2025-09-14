"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function ClearCachePage() {
  const [clearing, setClearing] = useState(false);

  const clearEverything = async () => {
    setClearing(true);
    try {
      // Clear all caches
      const cacheNames = await caches.keys();
      console.log('Found caches:', cacheNames);
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );

      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('Found service workers:', registrations.length);
        await Promise.all(
          registrations.map(registration => {
            console.log('Unregistering service worker');
            return registration.unregister();
          })
        );
      }

      // Clear storage
      localStorage.clear();
      sessionStorage.clear();

      alert('Everything cleared! Reloading page...');
      
      // Force hard reload
      window.location.href = window.location.href;
    } catch (error) {
      console.error('Error clearing:', error);
      alert('Error: ' + (error instanceof Error ? error.message : String(error)));
    }
    setClearing(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Clear Cache & Service Worker</h1>
        <p className="text-gray-600 mb-6">
          If you're experiencing offline page issues, click below to clear all caches and service workers.
        </p>
        <Button 
          onClick={clearEverything}
          disabled={clearing}
          className="w-full"
          size="lg"
        >
          {clearing ? 'Clearing...' : 'Clear Everything'}
        </Button>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>This will:</p>
          <ul className="mt-2 space-y-1">
            <li>• Clear all browser caches</li>
            <li>• Unregister service workers</li>
            <li>• Clear localStorage/sessionStorage</li>
            <li>• Force page reload</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
