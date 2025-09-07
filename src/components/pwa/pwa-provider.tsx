"use client";

import { createContext, useContext, useEffect, useState } from 'react';

interface PWAContextType {
  isOnline: boolean;
  isLoading: boolean;
  registration: ServiceWorkerRegistration | null;
}

const PWAContext = createContext<PWAContextType>({
  isOnline: true,
  isLoading: true,
  registration: null,
});

export function usePWA() {
  return useContext(PWAContext);
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Register service worker
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Unregister any existing service workers first
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }

          // Register new service worker
          const reg = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });
          setRegistration(reg);

          console.log('Service Worker registered successfully:', reg);

          // Handle updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, notify user
                  console.log('New content is available and will be used when all tabs for this page are closed.');
                  // You could show a toast notification here
                }
              });
            }
          });

          // Handle service worker errors
          reg.addEventListener('error', (error) => {
            console.error('Service Worker error:', error);
          });

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      } else {
        console.log('Service Worker not supported');
      }
    };

    registerSW();

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    setIsOnline(navigator.onLine);
    setIsLoading(false);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle navigation when offline
  useEffect(() => {
    if (!isOnline && typeof window !== 'undefined') {
      // If user navigates to a page that requires network, redirect to offline page
      const handleNavigation = (event: PopStateEvent) => {
        if (!navigator.onLine) {
          window.location.href = '/offline';
        }
      };

      window.addEventListener('popstate', handleNavigation);
      return () => window.removeEventListener('popstate', handleNavigation);
    }
  }, [isOnline]);

  return (
    <PWAContext.Provider value={{ isOnline, isLoading, registration }}>
      {children}
    </PWAContext.Provider>
  );
}
