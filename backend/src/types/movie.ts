export interface Movie {
  id: string;
  title: string;
  synopsis: string;
  posterUrl: string;
  rating: number;
  categories: string[];
  durationMinutes: number;
  releaseDate: string;
}