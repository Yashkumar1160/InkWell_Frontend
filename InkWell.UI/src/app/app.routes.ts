import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ExploreComponent } from './features/public/explore/explore.component';
import { NewsletterComponent } from './features/public/newsletter/newsletter.component';
import { NewsletterActionComponent } from './features/public/newsletter-action/newsletter-action.component';
import { PostDetailComponent } from './features/public/post-detail/post-detail.component';
import { DashboardComponent as AuthorDashboard } from './features/author/dashboard/dashboard.component';

import { authGuard } from './core/guards/auth.guard';
import { authorGuard } from './core/guards/author.guard';
import { adminGuard } from './core/guards/admin.guard';

import { PostEditorComponent } from './features/author/post-editor/post-editor.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'newsletter', component: NewsletterComponent },
  { path: 'newsletter/:action/:token', component: NewsletterActionComponent },
  { path: 'post/:slug', component: PostDetailComponent },
  { 
    path: 'author', 
    canActivate: [authorGuard],
    children: [
      { path: '', component: AuthorDashboard },
      { path: 'create', component: PostEditorComponent },
      { path: 'edit/:id', component: PostEditorComponent }
    ]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [adminGuard]
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./features/public/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'notifications', 
    loadComponent: () => import('./features/public/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];
