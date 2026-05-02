import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', component: AdminDashboardComponent },
      { 
        path: 'users', 
        loadComponent: () => import('./users/admin-users.component').then(m => m.AdminUsersComponent) 
      },
      // Other routes will be added as components are created
      { 
        path: 'posts', 
        loadComponent: () => import('./posts/admin-posts.component').then(m => m.AdminPostsComponent) 
      },
      { 
        path: 'comments', 
        loadComponent: () => import('./comments/admin-comments.component').then(m => m.AdminCommentsComponent) 
      },
      { 
        path: 'taxonomy', 
        loadComponent: () => import('./taxonomy/admin-taxonomy.component').then(m => m.AdminTaxonomyComponent) 
      },
      { 
        path: 'newsletter', 
        loadComponent: () => import('./newsletter/admin-newsletter.component').then(m => m.AdminNewsletterComponent) 
      },
      { 
        path: 'media', 
        loadComponent: () => import('./media/admin-media.component').then(m => m.AdminMediaComponent) 
      },
      { 
        path: 'notifications', 
        loadComponent: () => import('./notifications/admin-notifications.component').then(m => m.AdminNotificationsComponent) 
      },
    ]
  }
];
