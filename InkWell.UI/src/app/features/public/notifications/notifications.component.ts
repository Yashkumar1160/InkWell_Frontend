import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Bell, MessageSquare, Heart, UserPlus, Check, Info, Trash2, XCircle, Eye } from 'lucide-angular';
import { NotificationService } from '../../../core/services/notification.service';
import { CommentService } from '../../../core/services/comment.service';
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
  showUnreadOnly = false;

  readonly BellIcon = Bell;
  readonly TrashIcon = Trash2;
  readonly ClearIcon = XCircle;
  readonly UnreadIcon = Eye;

  constructor(
    private notificationService: NotificationService,
    private commentService: CommentService,
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
    if (this.showUnreadOnly) {
      // Uses GET /unread endpoint
      this.notificationService.getUnreadNotifications().subscribe({
        next: (data) => { this.notifications = data; this.loading = false; },
        error: () => this.loading = false
      });
    } else {
      this.notificationService.getNotifications().subscribe({
        next: (data) => { this.notifications = data; this.loading = false; },
        error: () => this.loading = false
      });
    }
  }

  toggleUnreadFilter() {
    this.showUnreadOnly = !this.showUnreadOnly;
    this.loadNotifications();
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
    if (note.relatedType === 'Post' && note.relatedId) {
      this.router.navigate(['/post', note.relatedId]);
    } else if (note.type.includes('COMMENT') && note.relatedId) {
      this.commentService.getCommentById(note.relatedId).subscribe(comment => {
        this.router.navigate(['/post', comment.postId]);
      });
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      if (this.showUnreadOnly) this.notifications = [];
    });
  }

  deleteNotification(id: number, event: Event): void {
    event.stopPropagation();
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

