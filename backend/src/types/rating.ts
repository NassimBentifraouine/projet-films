export interface Rating {
  userId: string;
  movieId: string;
  rating: number; // 0 à 10
  createdAt: string;
  updatedAt: string;
}