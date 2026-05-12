import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { LucideAngularModule, Mail, UserX, Send, Search, Users, UserCheck, Clock } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-newsletter',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './admin-newsletter.component.html',
  styleUrl: './admin-newsletter.component.css'
})
export class AdminNewsletterComponent implements OnInit {
  subscribers: any[] = [];
  newsletterSubject = '';
  newsletterBody = '';
  isSending = false;
  selectedStatus = 'ALL';
  searchEmail = '';
  searchResult: any = null;
  searchError = '';
  isSearching = false;

  readonly MailIcon = Mail;
  readonly DeleteIcon = UserX;
  readonly SendIcon = Send;
  readonly SearchIcon = Search;
  readonly AllIcon = Users;
  readonly ActiveIcon = UserCheck;
  readonly PendingIcon = Clock;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadSubscribers();
  }

  loadSubscribers(): void {
    this.selectedStatus = 'ALL';
    this.adminService.getAllSubscribers().subscribe((subs: any) => {
      this.subscribers = subs;
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    if (status === 'ALL') {
      this.adminService.getAllSubscribers().subscribe(data => this.subscribers = data);
    } else {
      this.adminService.getSubscribersByStatus(status).subscribe(data => this.subscribers = data);
    }
  }

  searchByEmail(): void {
    const email = this.searchEmail.trim();
    if (!email) return;
    this.isSearching = true;
    this.searchResult = null;
    this.searchError = '';
    this.adminService.getSubscriberByEmail(email).subscribe({
      next: (sub) => {
        this.searchResult = sub;
        this.isSearching = false;
      },
      error: (err) => {
        this.searchError = err.error?.message || 'Subscriber not found.';
        this.isSearching = false;
      }
    });
  }

  clearSearch(): void {
    this.searchEmail = '';
    this.searchResult = null;
    this.searchError = '';
  }

  deleteSubscriber(id: number): void {
    if (confirm('Remove this subscriber permanently?')) {
      this.adminService.deleteSubscriber(id).subscribe(() => {
        this.subscribers = this.subscribers.filter(s => s.subscriberId !== id);
        if (this.searchResult?.subscriberId === id) {
          this.searchResult = null;
        }
      });
    }
  }

  sendNewsletter(): void {
    if (!this.newsletterSubject.trim() || !this.newsletterBody.trim()) return;
    this.isSending = true;
    this.adminService.sendNewsletter({
      subject: this.newsletterSubject,
      body: this.newsletterBody
    }).subscribe({
      next: () => {
        this.newsletterSubject = '';
        this.newsletterBody = '';
        this.isSending = false;
        alert('Newsletter sent to all active subscribers!');
      },
      error: () => this.isSending = false
    });
  }
}
