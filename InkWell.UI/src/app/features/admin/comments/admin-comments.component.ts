import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { CommentService } from '../../../core/services/comment.service';
import { LucideAngularModule, MessageSquare, Trash2, Check, X, Search } from 'lucide-angular';

@Component({
  selector: 'app-admin-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-comments.component.html',
  styleUrl: './admin-comments.component.css'
})
export class AdminCommentsComponent implements OnInit {
  comments: any[] = [];
  filteredComments: any[] = [];
  statusFilter: string = 'PENDING';
  moderationEnabled = false;
  searchPostId: number | null = null;

  readonly CommentIcon = MessageSquare;
  readonly DeleteIcon = Trash2;
  readonly ApproveIcon = Check;
  readonly RejectIcon = X;
  readonly SearchIcon = Search;

  constructor(
    private adminService: AdminService,
    private commentService: CommentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadComments();
    this.loadModerationStatus();
  }

  loadModerationStatus(): void {
    this.adminService.getModerationMode().subscribe(data => this.moderationEnabled = data.moderationEnabled);
  }

  toggleModeration(): void {
    this.adminService.setModerationMode(!this.moderationEnabled).subscribe(() => {
      this.loadModerationStatus();
    });
  }

  loadComments(): void {
    if (this.searchPostId) {
      this.commentService.getByPost(this.searchPostId).subscribe(data => {
        this.comments = data;
        this.filteredComments = data;
      });
      return;
    }

    // load based on selected status filter
    if (this.statusFilter === 'PENDING') {
      this.adminService.getPendingComments().subscribe(data => {
        this.comments = data;
        this.filteredComments = data;
      });
    } else {
      this.adminService.getAllComments().subscribe(data => {
        this.comments = data;
        this.filteredComments = data;
      });
    }
  }

  onStatusChange(status: string): void {
    this.statusFilter = status;
    this.loadComments();
  }

  approveComment(id: number): void {
    this.adminService.approveComment(id).subscribe(() => this.loadComments());
  }

  rejectComment(id: number): void {
    this.adminService.rejectComment(id).subscribe(() => this.loadComments());
  }

  deleteComment(id: number): void {
    if (confirm('Delete this comment permanently?')) {
      this.adminService.deleteComment(id).subscribe(() => this.loadComments());
    }
  }
}
