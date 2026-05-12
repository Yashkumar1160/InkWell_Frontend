import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Search, Grid, List as ListIcon, Filter } from 'lucide-angular';
import { PostService, Post } from '../../../core/services/post.service';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryResponseDTO, TagResponseDTO } from '../../../core/models/category.model';
import { PostCardComponent } from '../../../shared/components/post-card/post-card.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, PostCardComponent],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent implements OnInit {
  posts: Post[] = [];
  categories: CategoryResponseDTO[] = [];
  trendingTags: TagResponseDTO[] = [];
  loading = true;
  selectedFilter = 'Trending Now';
  subCategories: CategoryResponseDTO[] = [];

  readonly SearchIcon = Search;
  readonly GridIcon = Grid;
  readonly ListIcon = ListIcon;

  allPosts: Post[] = [];

  constructor(
    private postService: PostService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadPosts();
    this.loadTaxonomy();
  }

  loadPosts() {
    this.loading = true;
    this.selectedFilter = 'Trending Now';
    this.postService.getPublishedPosts().subscribe(data => {
      this.allPosts = data;
      this.posts = data;
      this.loading = false;
    });
  }

  loadTaxonomy() {
    this.categoryService.getAllCategories().subscribe(data => this.categories = data);
    this.categoryService.getTrendingTags().subscribe(data => this.trendingTags = data);
  }

  onSearch(event: any) {
    const keyword = event.target.value;
    if (keyword.length > 2) {
      this.selectedFilter = `Results for "${keyword}"`;
      this.postService.searchPosts(keyword).subscribe(data => {
        this.posts = data;
      });
    } else if (keyword.length === 0) {
      this.posts = this.allPosts;
      this.selectedFilter = 'Trending Now';
    }
  }

  filterByCategory(slug: string) {
    this.loading = true;
    this.categoryService.getCategoryBySlug(slug).subscribe(cat => {
      this.selectedFilter = `Category: ${cat.name}`;
      this.categoryService.getChildCategories(cat.categoryId).subscribe(children => {
        this.subCategories = children;
      });
      // Client-side filtering as placeholder since no backend endpoint exists
      // Assuming posts might have category data in the future or we just fake the UI response
      this.posts = this.allPosts; // In reality this would filter if PostDTO had category data
      this.loading = false;
    });
  }

  filterByTag(slug: string) {
    this.loading = true;
    this.categoryService.getTagBySlug(slug).subscribe(tag => {
      this.selectedFilter = `Tag: #${tag.name}`;
      this.subCategories = [];
      // Client-side filtering as placeholder
      this.posts = this.allPosts;
      this.loading = false;
    });
  }
}
