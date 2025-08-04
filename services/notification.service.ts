// Description: Service pour gérer les notifications.
// ============================================================
import api from './api';
import { NotificationDto } from '../types/dto';

export const notificationService = {
    getMyNotifications: (pageNumber = 1, pageSize = 20) => {
        return api.get<NotificationDto[]>(`/notifications/my-notifications`, {
            params: { pageNumber, pageSize }
        });
    },
    markAsRead: (notificationId: string) => {
        return api.put(`/notifications/${notificationId}/mark-read`);
    },
    markAllAsRead: () => {
        return api.put('/notifications/mark-all-read');
    }
}