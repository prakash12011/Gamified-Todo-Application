"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You&apos;re Offline
          </h1>
          <p className="text-gray-600">
            It looks like you&apos;ve lost your internet connection.
            Don&apos;t worry, you can still access some features when you&apos;re back online.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleRetry}
            className="w-full"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <div className="text-sm text-gray-500">
            <p>This app works offline! You can:</p>
            <ul className="mt-2 space-y-1">
              <li>• View your cached todos</li>
              <li>• Access your profile</li>
              <li>• Use basic navigation</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
