import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NewsletterService } from '../../../core/services/newsletter.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-newsletter-action',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './newsletter-action.component.html',
  styleUrl: './newsletter-action.component.css'
})
export class NewsletterActionComponent implements OnInit {
  action: string | null = null;
  token: string | null = null;
  status: 'LOADING' | 'SUCCESS' | 'ERROR' = 'LOADING';
  message: string = '';
  
  // For preferences
  preferences: string = '';

  constructor(
    private route: ActivatedRoute,
    private newsletterService: NewsletterService
  ) {}

  ngOnInit() {
    this.action = this.route.snapshot.paramMap.get('action');
    this.token = this.route.snapshot.paramMap.get('token');

    if (!this.action || !this.token) {
      this.status = 'ERROR';
      this.message = 'Invalid link.';
      return;
    }

    if (this.action === 'confirm') {
      this.newsletterService.confirmSubscription(this.token).subscribe({
        next: (res) => {
          this.status = 'SUCCESS';
          this.message = res.message || 'Subscription confirmed successfully!';
        },
        error: (err) => {
          this.status = 'ERROR';
          this.message = err.error?.message || 'Failed to confirm subscription.';
        }
      });
    } else if (this.action === 'unsubscribe') {
      this.newsletterService.unsubscribe(this.token).subscribe({
        next: (res) => {
          this.status = 'SUCCESS';
          this.message = res.message || 'You have been unsubscribed.';
        },
        error: (err) => {
          this.status = 'ERROR';
          this.message = err.error?.message || 'Failed to unsubscribe.';
        }
      });
    } else if (this.action === 'preferences') {
      // Just show the form for preferences
      this.status = 'SUCCESS';
      this.message = 'Update your preferences';
    } else {
      this.status = 'ERROR';
      this.message = 'Unknown action.';
    }
  }

  savePreferences() {
    if (!this.token) return;
    this.status = 'LOADING';
    this.newsletterService.updatePreferences(this.token, { preferences: this.preferences }).subscribe({
      next: (res) => {
        this.status = 'SUCCESS';
        this.message = res.message || 'Preferences updated successfully!';
      },
      error: (err) => {
        this.status = 'ERROR';
        this.message = err.error?.message || 'Failed to update preferences.';
      }
    });
  }
}
