import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ratings } from "../data/ratings";
import { movies } from "../data/movies";
import { Rating } from "../types/rating";

export const rateMovie = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.userId;
  const { movieId } = req.params;
  const { rating } = req.body as { rating?: number };

  if (!userId) {
    res.status(401).json({ error: "Non authentifié." });
    return;
  }

  if (rating === undefined || Number.isNaN(rating)) {
    res.status(400).json({ error: "La note est requise." });
    return;
  }

  const numericRating = Number(rating);

  if (numericRating < 0 || numericRating > 10) {
    res
      .status(400)
      .json({ error: "La note doit être comprise entre 0 et 10." });
    return;
  }

  const movie = movies.find((m) => m.id === movieId);

  if (!movie) {
    res.status(404).json({ error: "Film introuvable." });
    return;
  }

  let existing = ratings.find(
    (r) => r.userId === userId && r.movieId === movieId
  );

  if (existing) {
    existing.rating = numericRating;
    existing.updatedAt = new Date().toISOString();
  } else {
    const newRating: Rating = {
      userId,
      movieId,
      rating: numericRating,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    ratings.push(newRating);
    existing = newRating;
  }

  const movieRatings = ratings.filter((r) => r.movieId === movieId);
  const average =
    movieRatings.reduce((sum, r) => sum + r.rating, 0) / movieRatings.length;

  movie.rating = Number(average.toFixed(1));

  res.status(200).json({
    message: "Note enregistrée.",
    movieId,
    userRating: existing.rating,
    averageRating: movie.rating,
    ratingsCount: movieRatings.length
  });
};
