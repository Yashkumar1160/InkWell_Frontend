import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommentService } from '../../../core/services/comment.service';
import { CommentResponseDTO } from '../../../core/models/comment.model';
import { AuthService } from '../../../core/services/auth.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TimeAgoPipe],
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.css'
})
export class CommentSectionComponent implements OnInit {
  @Input() postId!: number;
  @Input() isLoggedIn: boolean = false;
  @Input() postAuthorId: number = 0;

  comments: CommentResponseDTO[] = [];
  repliesMap: { [parentId: number]: CommentResponseDTO[] } = {};
  authorMap: { [authorId: number]: any } = {}; // Map to store user profiles by ID

  newCommentContent: string = '';
  replyContent: string = '';
  replyingTo: number | null = null;
  isSubmitting: boolean = false;
  currentUserId: number | null = null;

  constructor(
    private commentService: CommentService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.checkAuth();
    this.loadComments();
  }

  checkAuth(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.userId || null;
    });
  }

  loadComments(): void {
    if (!this.postId) return;
    this.commentService.getTopLevel(this.postId).subscribe(comments => {
      this.comments = comments;
      // Load replies and author profiles
      this.comments.forEach(c => {
        this.loadAuthor(c.authorId);
        this.loadReplies(c.commentId);
      });
    });
  }

  loadReplies(parentId: number): void {
    this.commentService.getReplies(parentId).subscribe(replies => {
      if (replies.length > 0) {
        this.repliesMap[parentId] = replies;
        replies.forEach(r => this.loadAuthor(r.authorId));
      }
    });
  }

  loadAuthor(authorId: number) {
    if (this.authorMap[authorId]) return; // Already loading or loaded
    this.authorMap[authorId] = { loading: true };
    this.authService.getPublicProfile(authorId).subscribe({
      next: (user) => this.authorMap[authorId] = user,
      error: (err) => console.error('Failed to load author profile:', err)
    });
  }

  submitComment(): void {
    if (!this.newCommentContent.trim()) return;

    this.isSubmitting = true;
    this.commentService.addComment({
      postId: this.postId,
      content: this.newCommentContent,
      postAuthorId: this.postAuthorId
    }).subscribe({
      next: (comment) => {
        this.loadAuthor(comment.authorId);
        this.comments.unshift(comment);
        this.newCommentContent = '';
        this.isSubmitting = false;
      },
      error: () => this.isSubmitting = false
    });
  }

  toggleReply(comment: CommentResponseDTO): void {
    if (!this.isLoggedIn) {
      // Could show a toast or redirect
      return;
    }
    this.replyingTo = this.replyingTo === comment.commentId ? null : comment.commentId;
    this.replyContent = '';
  }

  submitReply(parent: CommentResponseDTO): void {
    if (!this.replyContent.trim()) return;

    this.isSubmitting = true;
    this.commentService.addComment({
      postId: this.postId,
      content: this.replyContent,
      parentCommentId: parent.commentId
    }).subscribe({
      next: (reply) => {
        if (!this.repliesMap[parent.commentId]) {
          this.repliesMap[parent.commentId] = [];
        }
        this.loadAuthor(reply.authorId);
        this.repliesMap[parent.commentId].push(reply);
        this.replyingTo = null;
        this.replyContent = '';
        this.isSubmitting = false;
      },
      error: () => this.isSubmitting = false
    });
  }

  likeComment(comment: CommentResponseDTO): void {
    if (!this.isLoggedIn) return;
    this.commentService.likeComment(comment.commentId).subscribe(() => {
      comment.likesCount++;
    });
  }

  canDelete(comment: CommentResponseDTO): boolean {
    return this.currentUserId === comment.authorId;
  }

  deleteComment(comment: CommentResponseDTO): void {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.commentService.deleteComment(comment.commentId).subscribe(() => {
      if (comment.parentCommentId) {
        this.repliesMap[comment.parentCommentId] = this.repliesMap[comment.parentCommentId]
          .filter(c => c.commentId !== comment.commentId);
      } else {
        this.comments = this.comments.filter(c => c.commentId !== comment.commentId);
      }
    });
  }
  // Add a tracking Set for liked comments (since backend doesn't return isLiked in CommentResponseDTO)
  likedComments = new Set<number>();
  editingCommentId: number | null = null;
  editContent: string = '';

  toggleLikeComment(comment: CommentResponseDTO): void {
    if (!this.isLoggedIn) return;
    if (this.likedComments.has(comment.commentId)) {
      this.commentService.unlikeComment(comment.commentId).subscribe(() => {
        comment.likesCount--;
        this.likedComments.delete(comment.commentId);
      });
    } else {
      this.commentService.likeComment(comment.commentId).subscribe(() => {
        comment.likesCount++;
        this.likedComments.add(comment.commentId);
      });
    }
  }

  startEditComment(comment: CommentResponseDTO): void {
    this.editingCommentId = comment.commentId;
    this.editContent = comment.content;
  }

  saveEditComment(comment: CommentResponseDTO): void {
    if (!this.editContent.trim()) return;
    this.commentService.updateComment(comment.commentId, this.editContent).subscribe(updated => {
      comment.content = updated.content;
      this.editingCommentId = null;
    });
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editContent = '';
  }
}
