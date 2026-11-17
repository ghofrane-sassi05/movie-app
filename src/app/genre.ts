/** TMDB movie genres (stable list, avoids an extra API call). */
export const GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export function genreName(id: number): string {
  return GENRES[id] ?? 'Other';
}

/** "Action, Thriller" : the first genres of a movie, as a short label. */
export function genreLabel(genreIds: number[] | undefined, max = 2): string {
  return (genreIds ?? []).slice(0, max).map(genreName).join(', ');
}
