import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Search, Bell, User, LogOut, Menu, PenSquare, Home, Compass, Mail, Settings, Layout } from 'lucide-angular';
import { NotificationService } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LucideAngularModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  readonly Search = Search;
  readonly Bell = Bell;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly Menu = Menu;
  readonly PenSquare = PenSquare;
  readonly Home = Home;
  readonly Compass = Compass;
  readonly Mail = Mail;
  readonly Settings = Settings;
  readonly Layout = Layout;

  showDropdown = false;
  unreadCount = 0;

  private subscriptions = new Subscription();

  constructor(
    public authService: AuthService, 
    public notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    // Only call refreshUnreadCount when user state CHANGES from null → user
    // distinctUntilChanged prevents firing multiple times for the same state
    const userSub = this.authService.currentUser$.pipe(
      distinctUntilChanged((a, b) => !!a === !!b) // only react to logged-in/out transitions
    ).subscribe(user => {
      if (user) {
        this.notificationService.refreshUnreadCount();
      } else {
        // User logged out — reset the count locally, no API call
        this.unreadCount = 0;
        this.notificationService.resetUnreadCount();
      }
    });

    const countSub = this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });

    this.subscriptions.add(userSub);
    this.subscriptions.add(countSub);
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.unsubscribe();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    this.authService.logout();
    this.showDropdown = false;
  }
}
