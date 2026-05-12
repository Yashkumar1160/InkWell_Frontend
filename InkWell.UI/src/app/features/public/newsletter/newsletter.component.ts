import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, CheckCircle, ArrowRight } from 'lucide-angular';
import { NewsletterService } from '../../../core/services/newsletter.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './newsletter.component.html',
  styleUrl: './newsletter.component.css'
})
export class NewsletterComponent {
  email = '';
  fullName = '';
  subscribed = false;

  readonly MailIcon = Mail;
  readonly ArrowRightIcon = ArrowRight;
  readonly CheckIcon = CheckCircle;

  constructor(
    private newsletterService: NewsletterService,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.email = user.email;
        this.fullName = user.fullName || user.username;
      }
    });
  }

  onSubscribe() {
    if (this.email && this.fullName) {
      const userId = this.authService.currentUserValue?.userId;
      this.newsletterService.subscribe(this.email, this.fullName, userId).subscribe({
        next: () => {
          this.subscribed = true;
        },
        error: (err: any) => {
          console.error('Subscription failed', err);
          alert(err.error?.message || 'Subscription failed. Please check your details.');
        }
      });
    }
  }
}
