import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService, Post } from '../../../core/services/post.service';
import { CommentService } from '../../../core/services/comment.service';
import { LucideAngularModule, Clock, Heart, MessageCircle, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css'
})
export class PostCardComponent implements OnInit {
  @Input() post!: Post;
  commentCount: number = 0;

  readonly Clock = Clock;
  readonly Heart = Heart;
  readonly MessageCircle = MessageCircle;
  readonly ChevronRight = ChevronRight;

  constructor(
    private commentService: CommentService,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    if (this.post?.postId) {
      this.commentService.getCommentCount(this.post.postId).subscribe({
        next: (count) => this.commentCount = count,
        error: () => this.commentCount = 0
      });
    }
  }
}
