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
    this.categoryService.createCategory(dto).subscribe(() => {
      this.newCategory = '';
      this.selectedParentId = undefined;
      this.loadAll();
    });
  }

  startEdit(category: any): void {
    this.editingCategory = { ...category };
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
    this.categoryService.createTag({ name: this.newTag }).subscribe(() => {
      this.newTag = '';
      this.loadAll();
    });
  }

  deleteTag(id: number): void {
    if (confirm('Delete this tag?')) {
      this.categoryService.deleteTag(id).subscribe(() => this.loadAll());
    }
  }
}
