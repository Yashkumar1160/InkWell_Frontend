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
      const token = this.authService.getToken();
      if (token) {
        this.authService.validateToken(token).subscribe({
          next: (res) => {
            if (res.valid) {
              // Token is valid — silently refresh the user profile
              this.authService.fetchCurrentUser().subscribe({
                error: () => console.warn('Could not refresh user profile on startup')
              });
            } else {
              // Token is explicitly invalid — clear session
              this.authService.clearSessionAndRedirect();
            }
          },
          // IMPORTANT: On network/server error, do NOT log the user out.
          // The services may just be waking up on Render's free plan.
          // The token in localStorage is still valid — keep the session.
          error: () => console.warn('Token validation skipped — server may be starting up.')
        });
      }
    }
  }
}
