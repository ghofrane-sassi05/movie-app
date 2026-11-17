export interface Video {
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
}

export interface Movie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  /** Only returned by the movie detail endpoint (instead of genre_ids). */
  genres?: { id: number; name: string }[];
  id: number;
  title: string;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  softcore: boolean;
  video: boolean;
  vote_average: number;
  vote_count: number;
  /** Detail endpoint only (minutes / US dollars, 0 when unknown). */
  runtime?: number;
  budget?: number;
  /** Detail endpoint with append_to_response=videos,credits,similar. */
  videos?: { results: Video[] };
  credits?: { cast: CastMember[]; crew: CrewMember[] };
  similar?: { results: Movie[] };
}
