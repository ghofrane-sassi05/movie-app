import { Component, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import {inject} from '@angular/core';
import { Router } from '@angular/router';
import { MovieService } from '../../services/movie-service';
@Component({
  imports: [FontAwesomeModule],
  selector: 'app-head-bar',
  styleUrl: './head-bar.css',
  templateUrl: './head-bar.html',
})
export class HeadBar {
  faHeart = faHeart;
  faSun = faSun;
  faMoon = faMoon;
  router= inject(Router);
  movieService = inject(MovieService);
  theme = signal<'dark' | 'light'>(document.documentElement.dataset['theme'] === 'light' ? 'light' : 'dark');
  navigateToWishList() {
   this.router.navigate(['/wishlist']);
}
  navigateToHome() {
    this.router.navigate(['/']);
  }
  toggleTheme() {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    document.documentElement.dataset['theme'] = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // storage unavailable : the theme just won't be remembered
    }
  }
}
