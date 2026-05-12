import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { MediaService } from '../../../core/services/media.service';
import { LucideAngularModule, Image, Trash2, ExternalLink, RefreshCcw, File, Edit2 } from 'lucide-angular';

@Component({
  selector: 'app-admin-media',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-media.component.html',
  styleUrl: './admin-media.component.css'
})
export class AdminMediaComponent implements OnInit {
  mediaItems: any[] = [];
  readonly ImageIcon = Image;
  readonly DeleteIcon = Trash2;
  readonly LinkIcon = ExternalLink;
  readonly RefreshIcon = RefreshCcw;
  readonly FileIcon = File;
  readonly EditIcon = Edit2;

  selectedType = 'ALL';

  constructor(private adminService: AdminService, private mediaService: MediaService) {}

  ngOnInit(): void {
    this.loadMedia();
  }

  loadMedia(): void {
    this.selectedType = 'ALL';
    this.adminService.getAllMedia().subscribe((data: any) => this.mediaItems = data);
  }

  filterByType(type: string): void {
    this.selectedType = type;
    if (type === 'ALL') {
      this.loadMedia();
    } else if (type === 'DELETED') {
      this.adminService.getDeletedMedia().subscribe(data => this.mediaItems = data);
    } else {
      this.adminService.getMediaByMimeType(type).subscribe(data => this.mediaItems = data);
    }
  }

  cleanup(): void {
    if (confirm('Clean up orphaned media files? This will remove files not linked to any posts.')) {
      this.adminService.cleanupDeletedMedia().subscribe(() => {
        if (this.selectedType === 'DELETED') {
          this.filterByType('DELETED');
        } else {
          this.loadMedia();
        }
      });
    }
  }

  deleteMedia(id: number): void {
    if (confirm('Permanently delete this media asset?')) {
      this.adminService.deleteMedia(id).subscribe(() => {
        if (this.selectedType === 'DELETED') {
          this.filterByType('DELETED');
        } else {
          this.loadMedia();
        }
      });
    }
  }

  editAltText(item: any): void {
    const newAlt = prompt('Update Alt Text for SEO/Accessibility:', item.altText || '');
    if (newAlt !== null) {
      this.mediaService.updateAltText(item.mediaId, newAlt).subscribe(() => {
        item.altText = newAlt;
      });
    }
  }

  viewDetails(id: number): void {
    this.mediaService.getById(id).subscribe(item => {
      alert(`Media Details:\n\nName: ${item.fileName}\nType: ${item.mimeType}\nSize: ${item.sizeKb} KB\nPost ID: ${item.linkedPostId || 'Not linked'}`);
    });
  }
}
