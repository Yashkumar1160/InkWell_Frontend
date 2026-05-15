import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-angular';
import { environment } from '../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    LucideAngularModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  credentials = { email: '', password: '' };
  loading = false;
  error = '';
  showPassword = false;

  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly Loader2 = Loader2;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // If already logged in, redirect home
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    // Initialize Google Sign-In
    this.initGoogleSignIn();
  }

  private initGoogleSignIn() {
    // Check if script is already loaded
    if (!(window as any).google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => this.renderGoogleButton();
      document.head.appendChild(script);
    } else {
      this.renderGoogleButton();
    }
  }

  private renderGoogleButton() {
    if (typeof google === 'undefined') return;

    google.accounts.id.initialize({
      client_id: '312598885948-ctk5vvebe4fm391rdtsdi8gn6t2v496r.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleLogin(response)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { 
        theme: 'outline', 
        size: 'large',
        width: 350 
      }
    );
  }

  private handleGoogleLogin(response: any) {
    this.loading = true;
    this.authService.googleLogin(response.credential).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = 'Google login failed. Please try again.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.message || (typeof err.error === 'string' ? err.error : 'Login failed. Please check your credentials.');
        this.loading = false;
      }
    });
  }
}

