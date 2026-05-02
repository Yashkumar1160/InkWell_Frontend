import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Bell, MessageSquare, Heart, UserPlus, Check, Info, Trash2, XCircle } from 'lucide-angular';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  readonly BellIcon = Bell;
  readonly TrashIcon = Trash2;
  readonly ClearIcon = XCircle;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) { }

  get unreadCount() {
    return this.notifications.filter(n => !n.isRead).length;
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading = true;
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getCategoryClass(type: string) {
    if (type.includes('COMMENT')) return 'comment';
    if (type.includes('LIKE')) return 'like';
    if (type.includes('FOLLOW')) return 'follow';
    return 'system';
  }

  getIcon(type: string) {
    if (type.includes('COMMENT')) return MessageSquare;
    if (type.includes('LIKE')) return Heart;
    if (type.includes('FOLLOW')) return UserPlus;
    return Bell;
  }

  handleNotificationClick(note: Notification) {
    if (!note.isRead) {
      this.notificationService.markAsRead(note.notificationId).subscribe();
      note.isRead = true;
    }

    // Logic to navigate to related content
    if (note.relatedType === 'Post' && note.relatedId) {
      // We need to find the slug if possible, but for now we might need to fetch it
      // or navigate by ID if supported. Let's assume we can navigate to detail.
      this.router.navigate(['/post', note.relatedId]);
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
    });
  }

  deleteNotification(id: number, event: Event): void {
    event.stopPropagation();  // prevent triggering handleNotificationClick
    this.notificationService.deleteNotification(id).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.notificationId !== id);
    });
  }

  deleteAllRead(): void {
    this.notificationService.deleteReadNotifications().subscribe(() => {
      this.notifications = this.notifications.filter(n => !n.isRead);
    });
  }
}
