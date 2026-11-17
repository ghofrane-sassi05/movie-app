import { HttpClient } from '@angular/common/http';
import { inject, Injectable, computed } from '@angular/core';
import { environment } from '../../environments/environment';
import { map, Observable, shareReplay } from 'rxjs';
import { MovieResponse } from '../movie-response';
import { Movie } from '../movie';
import { signal } from '@angular/core';
import { genreName } from '../genre';


@Injectable({
    providedIn: 'root'
})
export class MovieService {
    private readonly http = inject(HttpClient);
    private readonly url=environment.url_api;
    private readonly key=environment.api_key;
    private readonly movieUrl=environment.url_movie_api
    public wishList= signal<Movie[]>([]);
    public movieList= signal<Movie[]>([]);
    public selectedMovie= signal<Movie | null>(null);

    /** Filters of the movie list. Genres are cumulative: a movie must have all the selected genres. */
    public selectedGenres = signal<number[]>([]);
    public minRating = signal(0);
    public selectedYear = signal<string | null>(null);

    private matches(movie: Movie, genres: number[]): boolean {
        if (genres.some(id => !movie.genre_ids?.includes(id))) {
            return false;
        }
        if (movie.vote_average < this.minRating()) {
            return false;
        }
        const year = this.selectedYear();
        return !year || movie.release_date?.slice(0, 4) === year;
    }

    /** Release years present in the current movie list (most recent first). */
    public years = computed(() => {
        const years = new Set<string>();
        for (const movie of this.movieList()) {
            if (movie.release_date) {
                years.add(movie.release_date.slice(0, 4));
            }
        }
        const selected = this.selectedYear();
        if (selected) {
            years.add(selected);
        }
        return [...years].sort().reverse();
    });

    /** Categories you can pick, with the number of movies you would get by picking them. */
    public categories = computed(() => {
        const selected = this.selectedGenres();
        const base = this.movieList().filter(movie => this.matches(movie, selected));
        const counts = new Map<number, number>();
        for (const movie of base) {
            for (const id of movie.genre_ids ?? []) {
                counts.set(id, (counts.get(id) ?? 0) + 1);
            }
        }
        // selected categories always stay visible
        for (const id of selected) {
            counts.set(id, base.length);
        }
        return [...counts.entries()]
            .map(([id, count]) => ({ id, name: genreName(id), count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    });

    /** Movies matching the genres, the minimum rating and the year. */
    public filteredMovies = computed(() =>
        this.movieList().filter(movie => this.matches(movie, this.selectedGenres()))
    );

    /** Number of movies for "All" (rating and year filters applied, no genre). */
    public allCount = computed(() =>
        this.movieList().filter(movie => this.matches(movie, [])).length
    );

    public hasActiveFilters = computed(() =>
        this.selectedGenres().length > 0 || this.minRating() > 0 || this.selectedYear() !== null
    );

    toggleGenre(id: number) {
        this.selectedGenres.update(genres =>
            genres.includes(id) ? genres.filter(genre => genre !== id) : [...genres, id]
        );
    }
    resetFilters() {
        this.selectedGenres.set([]);
        this.minRating.set(0);
        this.selectedYear.set(null);
    }

    constructor() {
        try {
            const saved = localStorage.getItem('wishList');
            if (saved) {
                this.wishList.set(JSON.parse(saved));
            }
        } catch {
            // corrupted or unavailable storage : start with an empty wish list
        }
    }

    getMovieList(): Observable<Movie[]>{
        return this.http.get<MovieResponse>(
            `${this.url}?api_key=${this.key}`
        ).pipe(
            map((response: MovieResponse) => response.results),
            shareReplay({ bufferSize: 1, refCount: false })
        );
    }
    getMovieById(id: number){
        return this.http.get<Movie>(
            `${this.movieUrl}/${id}?api_key=${this.key}&append_to_response=videos,credits,similar`
        ).pipe(map(response => response));
    }
    addToWish(movie: Movie) {
        if (this.isInWish(movie.id)) {
            return;
        }
        // the detail endpoint returns `genres` instead of `genre_ids`
        const genre_ids = movie.genre_ids ?? movie.genres?.map(genre => genre.id) ?? [];
        this.wishList.update(wishList =>[...wishList, { ...movie, genre_ids }]);
        this.saveWishList();
    }
    toggleWish(movie: Movie) {
        if (this.isInWish(movie.id)) {
            this.removeFromWish(movie.id);
        } else {
            this.addToWish(movie);
        }
    }
    removeFromWish(id: number) {
        this.wishList.update(wishList => wishList.filter(movie => movie.id !== id));
        this.saveWishList();
    }
    isInWish(id: number): boolean {
        return this.wishList().some(movie => movie.id === id);
    }
    private saveWishList() {
        localStorage.setItem('wishList', JSON.stringify(this.wishList()));
    }
}
