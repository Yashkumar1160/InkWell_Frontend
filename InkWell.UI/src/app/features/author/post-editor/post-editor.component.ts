import { Component, OnInit, AfterViewInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PostService } from '../../../core/services/post.service';
import { CategoryService } from '../../../core/services/category.service';
import { MediaService } from '../../../core/services/media.service';
import { CategoryResponseDTO } from '../../../core/models/category.model';

declare var Quill: any;

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './post-editor.component.html',
  styleUrl: './post-editor.component.css'
})
export class PostEditorComponent implements OnInit, AfterViewInit {
  postForm: FormGroup;
  quill: any;
  categories: CategoryResponseDTO[] = [];
  selectedCategories: number[] = [];
  isEditMode = false;
  postId?: number;
  isSubmitting = false;
  currentTags: string[] = [];
  featuredMediaId?: number;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private categoryService: CategoryService,
    private mediaService: MediaService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      excerpt: ['', [Validators.maxLength(300)]],
      featuredImageUrl: [''],
      tagInput: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.postId = +params['id'];
        this.loadPost(this.postId);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initQuill();
  }

  initQuill(): void {
    this.quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'header': 1 }, { 'header': 2 }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          ['link', 'image'],
          ['clean']
        ]
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(cats => this.categories = cats);
  }

  loadPost(id: number): void {
    this.postService.getPostById(id).subscribe(post => {
      this.postForm.patchValue({
        title: post.title,
        excerpt: post.excerpt,
        featuredImageUrl: post.featuredImageUrl
      });
      
      this.categoryService.getTagsByPost(id).subscribe(tags => {
        this.currentTags = tags.map(t => t.name);
      });

      // Load assigned categories
      this.categoryService.getCategoriesByPost(id).subscribe(cats => {
        this.selectedCategories = cats.map(c => c.categoryId);
      });

      if (this.quill) {
        this.quill.root.innerHTML = post.content;
      } else {
        setTimeout(() => {
          if(this.quill) this.quill.root.innerHTML = post.content;
        }, 100);
      }
    });
  }

  toggleCategory(id: number): void {
    const index = this.selectedCategories.indexOf(id);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
      if (this.isEditMode && this.postId) {
        this.categoryService.removeCategoryFromPost(this.postId, id).subscribe();
      }
    } else {
      this.selectedCategories.push(id);
      if (this.isEditMode && this.postId) {
        this.categoryService.assignCategoryToPost(this.postId, id).subscribe();
      }
    }
  }

  addTag(event: any): void {
    const input = event.target;
    const value = input.value.trim();
    if (value && !this.currentTags.includes(value)) {
      this.currentTags.push(value);
      input.value = '';
    }
  }

  removeTag(tagName: string): void {
    const index = this.currentTags.indexOf(tagName);
    if (index > -1) {
      this.currentTags.splice(index, 1);
      
      if (this.isEditMode && this.postId) {
        this.categoryService.getAllTags().subscribe(tags => {
          const tag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
          if (tag) {
            this.categoryService.removeTagFromPost(this.postId!, tag.tagId).subscribe();
          }
        });
      }
    }
  }

  savePost(status: string): void {
    if (this.postForm.invalid) return;

    this.isSubmitting = true;
    const content = this.quill.root.innerHTML;
    const formValue = this.postForm.value;
    
    const postDto = {
      ...formValue,
      content,
      status,
      categoryIds: this.selectedCategories,
      tags: this.currentTags
    };

    if (this.isEditMode && this.postId) {
      this.postService.updatePost(this.postId, postDto).subscribe({
        next: () => {
          this.syncTaxonomy(this.postId!).subscribe({
            next: () => this.afterSave(status),
            error: () => {
              this.isSubmitting = false;
              alert('Post updated, but failed to sync categories/tags.');
            }
          });
        },
        error: () => this.isSubmitting = false
      });
    } else {
      this.postService.createPost(postDto).subscribe({
        next: (newPost) => {
          this.syncTaxonomy(newPost.postId).subscribe({
            next: () => {
              if (status === 'PUBLISHED') {
                this.postService.publishPost(newPost.postId).subscribe(() => this.afterSave(status));
              } else {
                this.afterSave(status);
              }
            },
            error: () => {
              this.isSubmitting = false;
              alert('Post created, but failed to sync categories/tags.');
            }
          });
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  private syncTaxonomy(postId: number): Observable<any> {
    const operations: Observable<any>[] = [];

    // Categories
    this.selectedCategories.forEach(catId => {
      operations.push(this.categoryService.assignCategoryToPost(postId, catId));
    });

    // Tags
    this.currentTags.forEach((tagName: string) => {
      // This is a bit complex because we might need to create the tag first
      // For simplicity in this sync, we'll just push them
      // In a real app, this should be handled by the Category Service in one go
      const tagObs = this.categoryService.getAllTags().pipe(
        switchMap(allTags => {
          const existingTag = allTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
          if (existingTag) {
            return this.categoryService.addTagToPost(postId, existingTag.tagId);
          } else {
            return this.categoryService.createTag({ name: tagName }).pipe(
              switchMap(newTag => this.categoryService.addTagToPost(postId, newTag.tagId))
            );
          }
        })
      );
      operations.push(tagObs);
    });

    // Link featured image
    if (this.featuredMediaId) {
      operations.push(this.mediaService.linkToPost(this.featuredMediaId, postId));
    }

    if (operations.length === 0) {
      return of(true);
    }

    return forkJoin(operations);
  }

  afterSave(status: string): void {
    this.isSubmitting = false;
    alert(`Post ${status === 'PUBLISHED' ? 'published' : 'saved as draft'} successfully!`);
    this.router.navigate(['/author']);
  }

  navigateBack(): void {
    this.router.navigate(['/author']);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.mediaService.upload(file).subscribe({
        next: (res) => {
          this.featuredMediaId = res.mediaId;
          this.postForm.patchValue({ featuredImageUrl: res.url });
        },
        error: (err: any) => alert('Upload failed: ' + err.message)
      });
    }
  }

  removeImage(): void {
    this.postForm.patchValue({ featuredImageUrl: '' });
    if (this.featuredMediaId) {
      this.mediaService.unlinkFromPost(this.featuredMediaId).subscribe();
      this.featuredMediaId = undefined;
    } else if (this.isEditMode && this.postId) {
      // If we didn't just upload it, but it was already attached, fetch and unlink
      this.mediaService.getByPost(this.postId).subscribe(mediaFiles => {
        mediaFiles.forEach(media => {
          this.mediaService.unlinkFromPost(media.mediaId).subscribe();
        });
      });
    }
  }
}

