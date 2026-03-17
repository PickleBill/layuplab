import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAchievementById } from "@/lib/achievements";
import { getLevelTitle } from "@/lib/xp";

interface Notification {
  id: string;
  type: 'achievement' | 'levelup';
  title: string;
  subtitle: string;
  icon: string;
}

interface NotificationContextType {
  showAchievement: (achievementId: string) => void;
  showLevelUp: (newLevel: number) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showAchievement: () => {},
  showLevelUp: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (n: Notification) => {
    setNotifications(prev => [...prev, n]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setTimeout(() => {
      removeNotification(notifications[0].id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [notifications]);

  const showAchievement = (achievementId: string) => {
    const ach = getAchievementById(achievementId);
    if (!ach) return;
    addNotification({
      id: `ach-${Date.now()}`,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      subtitle: ach.title,
      icon: ach.icon,
    });
  };

  const showLevelUp = (newLevel: number) => {
    addNotification({
      id: `lvl-${Date.now()}`,
      type: 'levelup',
      title: `Level ${newLevel}!`,
      subtitle: getLevelTitle(newLevel),
      icon: '🚀',
    });
  };

  return (
    <NotificationContext.Provider value={{ showAchievement, showLevelUp }}>
      {children}
      {/* Notification Overlay */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="pointer-events-auto"
            >
              {n.type === 'levelup' ? (
                <div className="relative overflow-hidden rounded-lg border border-primary/40 bg-background p-4 glow-orange min-w-[280px]">
                  {/* Animated background particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-primary/60"
                        initial={{ 
                          x: '50%', y: '100%', opacity: 1 
                        }}
                        animate={{ 
                          x: `${20 + Math.random() * 60}%`,
                          y: '-20%',
                          opacity: [1, 1, 0]
                        }}
                        transition={{ 
                          duration: 1.5 + Math.random(),
                          delay: i * 0.15,
                          repeat: Infinity,
                          repeatDelay: 0.5
                        }}
                      />
                    ))}
                  </div>
                  <div className="relative flex items-center gap-3">
                    <motion.span
                      className="text-4xl"
                      animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      {n.icon}
                    </motion.span>
                    <div>
                      <p className="font-display font-extrabold text-lg text-primary">{n.title}</p>
                      <p className="font-display font-bold text-sm text-foreground">{n.subtitle}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-accent/30 bg-background p-4 min-w-[280px]"
                  style={{ boxShadow: '0 0 20px hsla(142, 71%, 45%, 0.2)' }}
                >
                  <div className="flex items-center gap-3">
                    <motion.span
                      className="text-3xl"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.1 }}
                    >
                      {n.icon}
                    </motion.span>
                    <div>
                      <p className="font-display font-bold text-xs text-accent uppercase tracking-wider">{n.title}</p>
                      <p className="font-display font-bold text-foreground">{n.subtitle}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
