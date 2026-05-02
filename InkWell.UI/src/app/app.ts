import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'InkWell.UI';

  constructor(private authService: AuthService) {
    if (this.authService.isLoggedIn()) {
      this.authService.fetchCurrentUser().subscribe({
        error: () => console.warn('Could not refresh user profile on startup')
      });
    }
  }
}

