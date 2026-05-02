import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { 
  LucideAngularModule, 
  Search, Bell, User, LogOut, Menu, PenSquare, 
  Clock, MessageCircle, Heart, ChevronRight,
  Mail, Lock, Eye, EyeOff, Loader2,
  ArrowRight, ArrowLeft, CheckCircle, Grid, List, Filter, Share2
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
      LucideAngularModule.pick({ 
        Search, Bell, User, LogOut, Menu, PenSquare, 
        Clock, MessageCircle, Heart, ChevronRight,
        Mail, Lock, Eye, EyeOff, Loader2,
        ArrowRight, ArrowLeft, CheckCircle, Grid, List, Filter, Share2 
      })
    )
  ]
};
