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

  readonly SearchIcon = Search;
  readonly GridIcon = Grid;
  readonly ListIcon = ListIcon;

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
      this.postService.searchPosts(keyword).subscribe(data => this.posts = data);
    } else if (keyword.length === 0) {
      this.loadPosts();
    }
  }
}
