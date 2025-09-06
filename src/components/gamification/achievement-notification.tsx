'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Achievement {
  id: string;
  badge_name: string;
  badge_description: string;
  xp_earned: number;
  icon: string;
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementNotification({ 
  achievement, 
  onClose 
}: AchievementNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (achievement) {
      setShow(true);
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Card className="w-80 bg-gradient-to-r from-yellow-400 to-orange-500 border-none shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="text-3xl"
                  >
                    {achievement.icon}
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Trophy className="h-4 w-4 text-white" />
                      <h3 className="font-bold text-white">Achievement Unlocked!</h3>
                    </div>
                    <h4 className="font-semibold text-white text-lg">
                      {achievement.badge_name}
                    </h4>
                    <p className="text-white/90 text-sm mb-2">
                      {achievement.badge_description}
                    </p>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      +{achievement.xp_earned} XP
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
