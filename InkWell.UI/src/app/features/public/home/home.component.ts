import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService, Post } from '../../../core/services/post.service';
import { LucideAngularModule, Clock, MessageCircle, Heart, ChevronRight } from 'lucide-angular';
import { PostCardComponent } from '../../../shared/components/post-card/post-card.component';
import { AuthService } from '../../../core/services/auth.service';
import { CommentService } from '../../../core/services/comment.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LucideAngularModule,
    PostCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  loading = true;
  featuredAuthor: any = null;
  featuredCommentCount: number = 0;

  readonly Clock = Clock;
  readonly MessageCircle = MessageCircle;
  readonly Heart = Heart;
  readonly ChevronRight = ChevronRight;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    
    // Listen for browser back button / pageshow event to force refresh in background
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        this.loadPosts();
      }
    });
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getPublishedPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        if (this.posts.length > 0) {
          this.loadFeaturedDetails(this.posts[0]);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching posts', err);
        this.loading = false;
      }
    });
  }

  loadFeaturedDetails(post: Post) {
    this.authService.getPublicProfile(post.authorId).subscribe(user => {
      this.featuredAuthor = user;
    });
    this.commentService.getCommentCount(post.postId).subscribe(count => {
      this.featuredCommentCount = count;
    });
  }
}
