import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService, Post } from '../../../core/services/post.service';
import { MediaService } from '../../../core/services/media.service';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Plus, FileText, Eye, Heart, Edit, Trash2, CheckCircle, Slash, ExternalLink, Archive, RefreshCw, Image } from 'lucide-angular';

@Component({
  selector: 'app-author-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  posts: Post[] = [];
  filterStatus: 'ALL' | 'PUBLISHED' | 'DRAFT' = 'ALL';
  mediaCount = 0;
  totalPosts = 0;
  myFiles: any[] = [];

  readonly Archive = Archive;
  readonly RefreshCw = RefreshCw;
  readonly Plus = Plus;
  readonly FileText = FileText;
  readonly Eye = Eye;
  readonly Heart = Heart;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly CheckCircle = CheckCircle;
  readonly Slash = Slash;
  readonly ExternalLink = ExternalLink;
  readonly ImageIcon = Image;

  constructor(
    private postService: PostService, 
    private mediaService: MediaService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadPosts();
    this.loadMediaCount();
    this.loadPostCount();
    this.loadMyFiles();
  }

  loadPosts() {
    this.postService.getMyPosts().subscribe({
      next: (data) => this.posts = data,
      error: (err) => console.error(err)
    });
  }
  
  loadMediaCount() {
    this.mediaService.getMediaCount().subscribe({
      next: (res) => this.mediaCount = res.count,
      error: (err) => console.error(err)
    });
  }

  loadPostCount() {
    this.authService.currentUser$.subscribe(user => {
      if (user?.userId) {
        this.postService.getPostCount(user.userId).subscribe({
          next: (res) => this.totalPosts = res.count,
          error: (err) => console.error(err)
        });
      }
    });
  }

  loadMyFiles() {
    this.mediaService.getMyFiles().subscribe(files => this.myFiles = files);
  }
  
  archivePost(id: number) {
    this.postService.archivePost(id).subscribe(() => this.loadPosts());
  }

  unarchivePost(id: number) {
    this.postService.unarchivePost(id).subscribe(() => this.loadPosts());
  }

  setFilter(status: 'ALL' | 'PUBLISHED' | 'DRAFT') {
    this.filterStatus = status;
  }

  getFilteredPosts() {
    if (this.filterStatus === 'ALL') {
      return this.posts;
    }
    return this.posts.filter(p => p.status === this.filterStatus);
  }

  publishPost(id: number) {
    this.postService.publishPost(id).subscribe(() => this.loadPosts());
  }

  unpublishPost(id: number) {
    this.postService.unpublishPost(id).subscribe(() => this.loadPosts());
  }

  deletePost(id: number) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(id).subscribe(() => this.loadPosts());
    }
  }

  getTotalViews() {
    return this.posts.reduce((acc, p) => acc + p.viewCount, 0);
  }

  getTotalLikes() {
    return this.posts.reduce((acc, p) => acc + p.likesCount, 0);
  }
}
