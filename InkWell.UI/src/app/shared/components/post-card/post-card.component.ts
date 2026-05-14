import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService, Post } from '../../../core/services/post.service';
import { CommentService } from '../../../core/services/comment.service';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryResponseDTO } from '../../../core/models/category.model';
import { LucideAngularModule, Clock, Heart, MessageCircle, ChevronRight } from 'lucide-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css'
})
export class PostCardComponent implements OnInit, OnDestroy {
  @Input() post!: Post;
  commentCount: number = 0;
  categories: CategoryResponseDTO[] = [];
  
  private subscriptions = new Subscription();

  readonly Clock = Clock;
  readonly Heart = Heart;
  readonly MessageCircle = MessageCircle;
  readonly ChevronRight = ChevronRight;

  constructor(
    private commentService: CommentService,
    private postService: PostService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    if (this.post?.postId) {
      // Fetch comment count
      this.subscriptions.add(
        this.commentService.getCommentCount(this.post.postId).subscribe({
          next: (count) => this.commentCount = count,
          error: () => this.commentCount = 0
        })
      );

      // Fetch categories for this post
      this.subscriptions.add(
        this.categoryService.getCategoriesByPost(this.post.postId).subscribe({
          next: (cats) => this.categories = cats,
          error: () => this.categories = []
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
