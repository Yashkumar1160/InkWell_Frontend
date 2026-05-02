import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, User, Mail, Lock, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  userData = { username: '', fullName: '', email: '', password: '' };
  loading = false;
  error = '';

  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly ArrowIcon = ArrowRight;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.authService.register(this.userData).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        // Handle both object {message: "..."} and plain string "..."
        this.error = err.error?.message || (typeof err.error === 'string' ? err.error : 'Registration failed. Please try again.');
        this.loading = false;
      }
    });
  }
}
