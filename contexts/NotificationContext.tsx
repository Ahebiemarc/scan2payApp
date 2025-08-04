// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notification.service';
import { NotificationDto } from '../types/dto';
import { useAuth } from './AuthContext';

type NotificationContextType = {
  notifications: NotificationDto[];
  unreadCount: number;
  loading: boolean;
  refetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);

  const calculateUnread = (notifs: NotificationDto[]) => notifs.filter(n => !n.isRead).length;

  const refetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await notificationService.getMyNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refetchNotifications();
      // Optional: Polling
      // const interval = setInterval(refetchNotifications, 30000); // Poll every 30 seconds
      // return () => clearInterval(interval);
    }
  }, [user, refetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read.`, error);
      // Revert optimistic update on failure
      refetchNotifications();
    }
  }, [refetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read.', error);
      refetchNotifications();
    }
  }, [refetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: calculateUnread(notifications),
        loading,
        refetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
