export interface Notification {
  notificationId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: number;
  relatedType?: string;
}
