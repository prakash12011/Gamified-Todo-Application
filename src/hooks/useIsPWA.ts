"use client";

import { useEffect, useState } from 'react';

export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if app is running in standalone mode (PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // Check for iOS PWA
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      // Check if running from home screen on Android
      const isFromHomeScreen = window.location.search.includes('homescreen=1');

      setIsPWA(isStandalone || isInWebAppiOS || isFromHomeScreen);
    }
  }, []);

  return isPWA;
}
