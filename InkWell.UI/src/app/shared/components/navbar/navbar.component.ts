import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Search, Bell, User, LogOut, Menu, PenSquare, Home, Compass, Mail, Settings, Layout } from 'lucide-angular';

import { NotificationService } from '../../../core/services/notification.service';

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
export class NavbarComponent implements OnInit {
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

  constructor(
    public authService: AuthService, 
    public notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.notificationService.refreshUnreadCount();
      } else {
        this.unreadCount = 0;
      }
    });

    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }


  logout() {
    this.authService.logout();
    this.showDropdown = false;
  }
}

