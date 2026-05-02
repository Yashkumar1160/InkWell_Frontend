import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostService, Post } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryResponseDTO, TagResponseDTO } from '../../../core/models/category.model';
import { LucideAngularModule, Clock, Heart, MessageCircle, Share2, ArrowLeft, Tag as TagIcon, Folder } from 'lucide-angular';

import { CommentSectionComponent } from '../../../shared/components/comment-section/comment-section.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, CommentSectionComponent],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  author: any = null; // User profile of the post author
  categories: CategoryResponseDTO[] = [];
  tags: TagResponseDTO[] = [];
  loading = true;

  readonly ArrowIcon = ArrowLeft;
  readonly HeartIcon = Heart;
  readonly ShareIcon = Share2;
  readonly MessageCircleIcon = MessageCircle;
  readonly TagIcon = TagIcon;
  readonly FolderIcon = Folder;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private authService: AuthService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slugOrId = params['slug'];
      if (slugOrId) {
        this.loading = true;
        // Check if the parameter is a numeric ID or a string slug
        const isId = !isNaN(Number(slugOrId));

        const request = isId 
          ? this.postService.getPostById(Number(slugOrId))
          : this.postService.getPostBySlug(slugOrId);

        request.subscribe({
          next: (data) => {
            this.post = data;
            this.loadAuthor(data.authorId);
            this.loadTaxonomy(data.postId);
            this.loading = false;
          },
          error: () => this.loading = false
        });
      }
    });
  }

  loadAuthor(authorId: number) {
    this.authService.getPublicProfile(authorId).subscribe({
      next: (user) => this.author = user,
      error: (err) => console.error('Failed to load author profile:', err)
    });
  }

  loadTaxonomy(postId: number) {
    this.categoryService.getCategoriesByPost(postId).subscribe(cats => this.categories = cats);
    this.categoryService.getTagsByPost(postId).subscribe(tags => this.tags = tags);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  scrollToComments() {
    const element = document.querySelector('app-comment-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  likePost() {
    if (!this.post) return;
    
    if (!this.isLoggedIn) {
      alert('Please sign in to like this story!');
      return;
    }

    // Optimistic Update
    const wasLiked = this.post.isLiked;
    this.post.isLiked = !wasLiked;
    this.post.likesCount += wasLiked ? -1 : 1;

    const request = wasLiked 
      ? this.postService.unlikePost(this.post.postId)
      : this.postService.likePost(this.post.postId);

    request.subscribe({
      error: (err) => {
        // Rollback on error
        if (this.post) {
          this.post.isLiked = wasLiked;
          this.post.likesCount += wasLiked ? 1 : -1;
        }
        console.error('Like action failed:', err);
        if (err.status === 401) {
          alert('Session expired. Please sign in again.');
        } else {
          alert('Something went wrong. Please try again.');
        }
      }
    });
  }
}
