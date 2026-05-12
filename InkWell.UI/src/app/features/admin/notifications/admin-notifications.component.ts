import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Bell, Info, AlertTriangle, CheckCircle, Trash2, Send, Heart, MessageSquare, Search } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './admin-notifications.component.html',
  styleUrl: './admin-notifications.component.css'
})
export class AdminNotificationsComponent implements OnInit {
  notifications: any[] = [];
  loading = true;
  broadcastMessage = '';
  broadcastTitle = '';
  isBroadcasting = false;
  selectedType = 'ALL';
  relatedIdSearch = '';
  isSearching = false;
  searchError = '';

  readonly BellIcon = Bell;
  readonly DeleteIcon = Trash2;
  readonly SendIcon = Send;
  readonly SearchIcon = Search;
  readonly HeartIcon = Heart;
  readonly CommentIcon = MessageSquare;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.selectedType = 'ALL';
    this.relatedIdSearch = '';
    this.searchError = '';
    this.adminService.getAllNotifications().subscribe({
      next: (data) => { this.notifications = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  filterByType(type: string): void {
    this.selectedType = type;
    this.relatedIdSearch = '';
    this.searchError = '';
    this.loading = true;
    if (type === 'ALL') {
      this.adminService.getAllNotifications().subscribe({
        next: (data) => { this.notifications = data; this.loading = false; },
        error: () => this.loading = false
      });
    } else {
      // Uses GET /by-type?type=... endpoint
      this.adminService.getNotificationsByType(type).subscribe({
        next: (data) => { this.notifications = data; this.loading = false; },
        error: () => this.loading = false
      });
    }
  }

  searchByRelatedId(): void {
    const id = parseInt(this.relatedIdSearch.trim(), 10);
    if (isNaN(id)) { this.searchError = 'Please enter a valid numeric ID.'; return; }
    this.loading = true;
    this.searchError = '';
    this.selectedType = '';
    // Uses GET /by-related/{relatedId} endpoint
    this.adminService.getNotificationsByRelatedId(id).subscribe({
      next: (data) => { this.notifications = data; this.loading = false; },
      error: (err) => {
        this.searchError = err.error?.message || 'No notifications found.';
        this.loading = false;
      }
    });
  }

  getIcon(type: string) {
    if (type?.includes('COMMENT')) return this.CommentIcon;
    if (type?.includes('LIKE')) return this.HeartIcon;
    return this.BellIcon;
  }

  sendBroadcast(): void {
    if (!this.broadcastMessage.trim()) return;
    this.isBroadcasting = true;
    this.adminService.broadcastNotification({
      recipientIds: [],
      title: this.broadcastTitle || 'Announcement',
      message: this.broadcastMessage,
      roleFilter: ''
    }).subscribe({
      next: () => {
        this.broadcastMessage = '';
        this.isBroadcasting = false;
        alert('Broadcast sent to all users!');
        this.loadNotifications();
      },
      error: () => this.isBroadcasting = false
    });
  }

  deleteNote(id: number): void {
    if (confirm('Delete this notification?')) {
      this.notificationService.deleteNotification(id).subscribe(() => {
        this.notifications = this.notifications.filter(n => n.notificationId !== id);
      });
    }
  }
}

