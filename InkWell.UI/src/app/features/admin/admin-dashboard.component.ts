import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { LucideAngularModule, Users, FileText, Mail, Image } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  stats = { users: 0, posts: 0, subscribers: 0, media: 0 };
  
  readonly UsersIcon = Users;
  readonly PostsIcon = FileText;
  readonly NewsletterIcon = Mail;
  readonly MediaIcon = Image;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.adminService.getAllUsers().subscribe((data: any[]) => this.stats.users = data.length);
    this.adminService.getAllPosts().subscribe((data: any[]) => this.stats.posts = data.length);
    this.adminService.getSubscriberCount().subscribe(res => this.stats.subscribers = res.count);
    this.adminService.getAllMedia().subscribe((data: any[]) => this.stats.media = data.length);
  }
}
