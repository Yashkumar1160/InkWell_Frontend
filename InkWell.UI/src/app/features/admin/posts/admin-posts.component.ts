import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { PostService } from '../../../core/services/post.service';
import { LucideAngularModule, FileText, Trash2, EyeOff, Eye, User, ExternalLink, Edit, Star } from 'lucide-angular';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './admin-posts.component.html',
  styleUrl: './admin-posts.component.css'
})
export class AdminPostsComponent implements OnInit {
  posts: any[] = [];
  readonly PostIcon = FileText;
  readonly UserIcon = User;
  readonly DeleteIcon = Trash2;
  readonly HideIcon = EyeOff;
  readonly ShowIcon = Eye;
  readonly ViewIcon = ExternalLink;
  readonly EditIcon = Edit;
  readonly StarIcon = Star;

  constructor(private adminService: AdminService, private postService: PostService) { }

  selectedStatus = 'ALL';

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    if (status === 'ALL') {
      this.loadPosts();
    } else {
      this.adminService.getPostsByStatus(status).subscribe(data => this.posts = data);
    }
  }
  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.adminService.getAllPosts().subscribe((data: any) => this.posts = data);
  }

  // Also fix the stub methods publish/unpublish that just console.log:
  unpublish(id: number): void {
    // inject PostService and call it
    this.postService.unpublishPost(id).subscribe(() => this.loadPosts());
  }

  publish(id: number): void {
    this.postService.publishPost(id).subscribe(() => this.loadPosts());
  }

  featurePost(id: number): void {
    this.adminService.featurePost(id).subscribe(() => this.loadPosts());
  }

  unfeaturePost(id: number): void {
    this.adminService.unfeaturePost(id).subscribe(() => this.loadPosts());
  }

  deletePost(id: number): void {
    if (confirm('Permanently delete this post? This cannot be undone.')) {
      this.adminService.deletePost(id).subscribe(() => this.loadPosts());
    }
  }
}
