import { api } from './client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  loan_id?: string;
  sent_at: string;
}

export const notificationsApi = {
  getAll: () => api.get<Notification[]>('/api/notifications'),
  markAsRead: (id: string) => api.put(`/api/notifications/${id}/read`, {}),
  updateFcmToken: (fcm_token: string) => api.put('/api/notifications/fcm-token', { fcm_token }),
};
