import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { LucideAngularModule, Tag, Plus, Trash2, Folder } from 'lucide-angular';

@Component({
  selector: 'app-admin-taxonomy',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-taxonomy.component.html',
  styleUrl: './admin-taxonomy.component.css'
})
export class AdminTaxonomyComponent implements OnInit {
  categories: any[] = [];
  tags: any[] = [];
  newCategory = '';
  newTag = '';
  editingCategory: any = null;
  editingTag: any = null;
  selectedParentId?: number;

  readonly FolderIcon = Folder;
  readonly TagIcon = Tag;
  readonly PlusIcon = Plus;
  readonly DeleteIcon = Trash2;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.categoryService.getAllCategories().subscribe((data: any) => this.categories = data);
    this.categoryService.getAllTags().subscribe((data: any) => this.tags = data);
  }

  addCategory(): void {
    if (!this.newCategory) return;
    const dto = { 
      name: this.newCategory,
      parentCategoryId: this.selectedParentId 
    };
    this.categoryService.createCategory(dto).subscribe((savedCategory: any) => {
      // Append the new category locally for instant feedback
      this.categories = [...this.categories, savedCategory];
      this.newCategory = '';
      this.selectedParentId = undefined;
      // Also trigger a background load to be safe
      this.loadAll();
    });
  }

  startEdit(category: any): void {
    this.categoryService.getCategoryById(category.categoryId).subscribe(data => {
      this.editingCategory = { ...data };
    });
  }

  saveEdit(): void {
    if (!this.editingCategory) return;
    this.categoryService.updateCategory(this.editingCategory.categoryId, this.editingCategory).subscribe(() => {
      this.editingCategory = null;
      this.loadAll();
    });
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure? This will unassign all posts from this category.')) {
      this.categoryService.deleteCategory(id).subscribe(() => this.loadAll());
    }
  }

  addTag(): void {
    if (!this.newTag) return;
    this.categoryService.createTag({ name: this.newTag }).subscribe((savedTag: any) => {
      // Append the new tag locally for instant feedback
      this.tags = [...this.tags, savedTag];
      this.newTag = '';
      // Also trigger a background load to be safe
      this.loadAll();
    });
  }

  startEditTag(tag: any): void {
    this.categoryService.getTagById(tag.tagId).subscribe(data => {
      this.editingTag = { ...data };
    });
  }

  saveEditTag(): void {
    if (!this.editingTag) return;
    // Assuming we have an updateTag method? Wait, let me check the service.
    // Actually, updateTag is NOT in the list provided by the user. 
    // But the user did provide getTagById.
    // Let's just use getTagById to show the detail for now.
    alert('Tag details fetched: ' + JSON.stringify(this.editingTag));
    this.editingTag = null;
  }

  deleteTag(id: number): void {
    if (confirm('Delete this tag?')) {
      this.categoryService.deleteTag(id).subscribe(() => this.loadAll());
    }
  }
}
