import { Component, computed, signal } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../../services/movie-service';
import { Movie } from '../../movie';
import { genreLabel } from '../../genre';
@Component({
  imports: [],
  selector: 'app-movie-detail',
  styleUrl: './movie-detail.css',
  templateUrl: './movie-detail.html',
  host: { '(document:keydown.escape)': 'closeTrailer()' },
})
export class MovieDetail implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  movieService = inject(MovieService)
  genreLabel = genreLabel;
  error = signal(false);
  trailerSrc = signal<SafeResourceUrl | null>(null);

  /** YouTube key of the trailer (official trailer first, then any trailer, then a teaser). */
  trailerKey = computed(() => {
    const videos = (this.movieService.selectedMovie()?.videos?.results ?? []).filter(video => video.site === 'YouTube');
    const best = videos.find(video => video.type === 'Trailer' && video.official)
      ?? videos.find(video => video.type === 'Trailer')
      ?? videos.find(video => video.type === 'Teaser');
    return best?.key ?? null;
  });
  directors = computed(() =>
    (this.movieService.selectedMovie()?.credits?.crew ?? [])
      .filter(person => person.job === 'Director')
      .map(person => person.name)
      .join(', ')
  );
  cast = computed(() => (this.movieService.selectedMovie()?.credits?.cast ?? []).slice(0, 12));
  similar = computed(() => (this.movieService.selectedMovie()?.similar?.results ?? []).slice(0, 6));

  ngOnInit(): void {
      this.route.paramMap.pipe( 
        switchMap(params => {
          const id = Number(params.get('id'));
          // avoid showing the previously opened movie while the new one loads
          this.movieService.selectedMovie.set(null);
          this.error.set(false);
          this.closeTrailer();
          return this.movieService.getMovieById(id).pipe(
            catchError(() => {
              this.error.set(true);
              return of(null);
            })
          );
  })

      ).subscribe(movie => {
        if (movie) {
          this.movieService.selectedMovie.set(movie);
        }
      });
  }

  backToMovieList() {
    this.router.navigate(['/']);
  }
  addToWish(movie:Movie){
    this.movieService.addToWish(movie);
  }
  toggleWish(event: Event, movie: Movie) {
    event.stopPropagation();
    this.movieService.toggleWish(movie);
  }
  navigateTo(movie: Movie) {
    this.router.navigate(['/movie', movie.id]);
  }
  openTrailer(key: string) {
    this.trailerSrc.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${key}?autoplay=1&rel=0`)
    );
  }
  closeTrailer() {
    this.trailerSrc.set(null);
  }
  formatRuntime(minutes?: number): string {
    if (!minutes) {
      return 'Unknown';
    }
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours ? `${hours}h ${rest.toString().padStart(2, '0')}min` : `${rest}min`;
  }
  formatBudget(budget?: number): string {
    return budget
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(budget)
      : 'Unknown';
  }
  initials(name: string): string {
    return name.split(' ').map(part => part[0]).slice(0, 2).join('');
  }
}
