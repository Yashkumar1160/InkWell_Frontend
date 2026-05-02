import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { LucideAngularModule, Mail, UserCheck, UserX, Send } from 'lucide-angular';
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

  readonly MailIcon = Mail;
  readonly DeleteIcon = UserX;
  readonly SendIcon = Send;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadSubscribers();
  }

  loadSubscribers(): void {
    this.adminService.getAllSubscribers().subscribe((subs: any) => {
      this.subscribers = subs;
    });
  }

  deleteSubscriber(id: number): void {
    if (confirm('Remove this subscriber permanently?')) {
      this.adminService.deleteSubscriber(id).subscribe(() => {
        this.subscribers = this.subscribers.filter(s => s.subscriberId !== id);
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
        alert('Newsletter sent to all subscribers!');
      },
      error: () => this.isSending = false
    });
  }
}
