import { useCallback } from 'react';
import { NotificationPayload, NotificationStatus, Notification } from '@/types/notifications';
import { NotificationService } from '@/services/notifications/NotificationService';

interface UseNotifications {
  scheduleNotification: (payload: NotificationPayload) => Promise<Notification>;
  getNotifications: (userId: string, status?: NotificationStatus) => Promise<Notification[]>;
}

export const useNotifications = (): UseNotifications => {
  const notifications = NotificationService.getInstance();

  const scheduleNotification = useCallback(async (payload: NotificationPayload) => {
    return notifications.scheduleNotification(payload);
  }, []);

  const getNotifications = useCallback(async (userId: string, status?: NotificationStatus) => {
    return notifications.getNotificationsForUser(userId, status);
  }, []);

  return {
    scheduleNotification,
    getNotifications,
  };
};
