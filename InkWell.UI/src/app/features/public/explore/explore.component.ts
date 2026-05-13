import { Component, OnInit } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
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
    const keyword = event.target.value.toLowerCase();
    if (keyword.length > 2) {
      this.selectedFilter = `Results for "${keyword}"`;
      this.loading = true;

      // 1. Title search
      this.postService.searchPosts(keyword).subscribe(titleResults => {
        let finalResults = [...titleResults];

        // 2. Category check
        const matchedCats = this.categories.filter(c => c.name.toLowerCase().includes(keyword));
        
        // 3. Tag check
        const matchedTags = this.trendingTags.filter(t => t.name.toLowerCase().includes(keyword));

        // If we have category/tag matches, we need to fetch those IDs too
        if (matchedCats.length > 0 || matchedTags.length > 0) {
           const obs: Observable<number[]>[] = [];
           matchedCats.forEach(c => obs.push(this.categoryService.getPostIdsByCategorySlug(c.slug)));
           matchedTags.forEach(t => obs.push(this.categoryService.getPostIdsByTagSlug(t.slug)));

           if (obs.length > 0) {
             forkJoin(obs).subscribe(idArrays => {
               const allIds = new Set<number>();
               idArrays.forEach(ids => ids.forEach(id => allIds.add(id)));
               
               // Add posts from id matches that aren't already in title results
               const extraPosts = this.allPosts.filter(p => allIds.has(p.postId) && !finalResults.some(fr => fr.postId === p.postId));
               this.posts = [...finalResults, ...extraPosts];
               this.loading = false;
             });
           } else {
             this.posts = finalResults;
             this.loading = false;
           }
        } else {
          this.posts = finalResults;
          this.loading = false;
        }
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
      
      this.categoryService.getPostIdsByCategorySlug(slug).subscribe(ids => {
        this.posts = this.allPosts.filter(p => ids.includes(p.postId));
        this.loading = false;
      });
    });
  }

  filterByTag(slug: string) {
    this.loading = true;
    this.categoryService.getTagBySlug(slug).subscribe(tag => {
      this.selectedFilter = `Tag: #${tag.name}`;
      this.subCategories = [];
      
      this.categoryService.getPostIdsByTagSlug(slug).subscribe(ids => {
        this.posts = this.allPosts.filter(p => ids.includes(p.postId));
        this.loading = false;
      });
    });
  }
}
