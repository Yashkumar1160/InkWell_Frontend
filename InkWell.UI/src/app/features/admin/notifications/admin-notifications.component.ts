import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LucideAngularModule, Bell, Info, AlertTriangle, CheckCircle, Trash2, Send } from 'lucide-angular';
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
  isBroadcasting = false;

  readonly BellIcon = Bell;
  readonly DeleteIcon = Trash2;
  readonly SendIcon = Send;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.adminService.getAllNotifications().subscribe({
      next: (data) => { this.notifications = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getIcon(type: string) {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  }

  sendBroadcast(): void {
    if (!this.broadcastMessage.trim()) return;
    this.isBroadcasting = true;
    this.adminService.broadcastNotification({
      recipientIds: [], // Empty list = all users in backend implementation
      message: this.broadcastMessage,
      type: 'SYSTEM'
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
