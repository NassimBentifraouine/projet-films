import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { users } from "../data/users";
import { movies } from "../data/movies";
import { Movie } from "../types/movie";

export const getMyWatchlist = (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user?.userId;

  const user = users.find((u) => u.id === userId);

  if (!user) {
    res.status(404).json({ error: "Utilisateur non trouvé." });
    return;
  }

  const watchlistMovies: Movie[] = movies.filter((movie) =>
    user.watchlist.includes(movie.id)
  );

  res.status(200).json({
    movies: watchlistMovies,
    count: watchlistMovies.length
  });
};

export const addToWatchlist = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const userId = req.user?.userId;
  const { movieId } = req.params;

  const user = users.find((u) => u.id === userId);

  if (!user) {
    res.status(404).json({ error: "Utilisateur non trouvé." });
    return;
  }

  const movieExists = movies.some((m) => m.id === movieId);
  if (!movieExists) {
    res.status(404).json({ error: "Film introuvable." });
    return;
  }

  if (!user.watchlist.includes(movieId)) {
    user.watchlist.push(movieId);
  }

  res.status(200).json({
    message: "Film ajouté à la watchlist.",
    watchlist: user.watchlist
  });
};

export const removeFromWatchlist = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  const userId = req.user?.userId;
  const { movieId } = req.params;

  const user = users.find((u) => u.id === userId);

  if (!user) {
    res.status(404).json({ error: "Utilisateur non trouvé." });
    return;
  }

  user.watchlist = user.watchlist.filter((id) => id !== movieId);

  res.status(200).json({
    message: "Film retiré de la watchlist.",
    watchlist: user.watchlist
  });
};