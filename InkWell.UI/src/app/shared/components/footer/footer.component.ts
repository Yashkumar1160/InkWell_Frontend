import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Twitter, Github, Linkedin, Mail, Heart } from 'lucide-angular';
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

  isLoggedIn = false;
  userEmail = '';
  userName = '';
  isSubscribing = false;

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
      }
    });
  }

  subscribe(): void {
    if (!this.isLoggedIn) return;

    this.isSubscribing = true;
    this.newsletterService.subscribe(this.userEmail, this.userName, this.authService.currentUserValue?.userId).subscribe({
      next: () => {
        this.isSubscribing = false;
        alert('Thank you for subscribing!');
      },
      error: (err) => {
        this.isSubscribing = false;
        alert(err.error?.message || 'Failed to subscribe.');
      }
    });
  }
}
