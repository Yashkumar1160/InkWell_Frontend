import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Twitter, Github, Linkedin, Mail, Heart, CheckCircle, AlertCircle } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { NewsletterService } from '../../../core/services/newsletter.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  readonly Twitter = Twitter;
  readonly Github = Github;
  readonly Linkedin = Linkedin;
  readonly Mail = Mail;
  readonly Heart = Heart;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;

  isLoggedIn = false;
  userEmail = '';
  userName = '';
  isSubscribing = false;
  subscribeMessage = '';
  isSuccess = false;
  isSubscribed = false;

  constructor(
    private authService: AuthService,
    private newsletterService: NewsletterService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.userEmail = user.email;
        this.userName = user.fullName || user.username;
        this.checkSubscriptionStatus();
      }
    });
  }

  checkSubscriptionStatus() {
    this.newsletterService.getMySubscription().subscribe({
      next: (sub) => {
        this.isSubscribed = sub && sub.status === 'ACTIVE';
      },
      error: () => {
        this.isSubscribed = false;
      }
    });
  }

  subscribe(): void {
    if (!this.isLoggedIn) return;

    this.isSubscribing = true;
    this.subscribeMessage = '';
    
    this.newsletterService.subscribe(this.userEmail, this.userName, this.authService.currentUserValue?.userId).subscribe({
      next: (res) => {
        this.isSubscribing = false;
        this.isSuccess = true;
        this.subscribeMessage = res.message || 'Thank you for subscribing!';
        setTimeout(() => this.subscribeMessage = '', 5000);
      },
      error: (err) => {
        this.isSubscribing = false;
        this.isSuccess = false;
        this.subscribeMessage = err.error?.message || 'Failed to subscribe.';
        setTimeout(() => this.subscribeMessage = '', 5000);
      }
    });
  }
}
