import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.model';
import { PostService } from '../../../core/services/post.service';
import { Post } from '../../../core/models/post.model';
import { NewsletterService } from '../../../core/services/newsletter.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  activeTab: 'profile' | 'security' | 'notifications' = 'profile';
  isSaving = false;
  authorPosts: Post[] = [];


  constructor(
    private authService: AuthService, 
    private fb: FormBuilder, 
    private postService: PostService,
    private newsletterService: NewsletterService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required]],
      bio: [''],
      avatarUrl: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.profileForm.patchValue({
          fullName: user.fullName || '',
          bio: user.bio || '',
          avatarUrl: user.avatarUrl || ''
        });
      }
    });

    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user?.userId) {
        this.postService.getPostsByAuthor(user.userId).subscribe(posts => {
          this.authorPosts = posts.filter(p => p.status === 'PUBLISHED');
        });
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;
    this.isSaving = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        alert('Profile updated successfully!');
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Update failed', err);
        alert('Failed to update profile. Please try again.');
      }
    });
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) return;
    this.isSaving = true;

    // Map to backend field names
    const payload = {
      oldPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.authService.changePassword(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.passwordForm.reset();
        alert('Password updated successfully!');
      },
      error: (err) => {
        this.isSaving = false;
        alert(err.error?.message || 'Failed to update password. Check your current password.');
      }
    });
  }

  updateNewsletterPrefs(preferences: string): void {
    this.isSaving = true;
    this.newsletterService.updateMyPreferences({ preferences }).subscribe({
      next: () => {
        this.isSaving = false;
        alert('Newsletter preferences updated!');
      },
      error: (err) => {
        this.isSaving = false;
        alert(err.error?.message || 'Failed to update preferences.');
      }
    });
  }
}
