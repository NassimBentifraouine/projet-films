import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { viewHistory } from "../data/history";
import { movies } from "../data/movies";
import { Movie } from "../types/movie";

type HistoryItemWithMovie = {
  movie: Movie;
  viewedAt: string;
};

export const addViewToHistory = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  try {
    const userId = req.user?.userId;
    const { movieId } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Non authentifié." });
      return;
    }

    const movie = movies.find((m) => m.id === movieId);

    if (!movie) {
      res.status(404).json({ error: "Film introuvable." });
      return;
    }

    const now = new Date().toISOString();

    // On supprime d'anciens enregistrements pour ce couple (user, movie)
    for (let i = viewHistory.length - 1; i >= 0; i -= 1) {
      if (viewHistory[i].userId === userId && viewHistory[i].movieId === movieId) {
        viewHistory.splice(i, 1);
      }
    }

    viewHistory.push({
      userId,
      movieId,
      viewedAt: now
    });

    res.status(200).json({
      message: "Consultation enregistrée.",
      movieId,
      viewedAt: now
    });
  } catch (error) {
    console.error("Erreur dans addViewToHistory:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de l'enregistrement de l'historique." });
  }
};

export const getMyHistory = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Non authentifié." });
      return;
    }

    const userHistory = viewHistory
      .filter((item) => item.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
      );

    const items: HistoryItemWithMovie[] = userHistory
      .map((item) => {
        const movie = movies.find((m) => m.id === item.movieId);
        if (!movie) return null;
        return { movie, viewedAt: item.viewedAt };
      })
      .filter((x): x is HistoryItemWithMovie => x !== null)
      .slice(0, 20);

    res.status(200).json({
      items,
      count: items.length
    });
  } catch (error) {
    console.error("Erreur dans getMyHistory:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération de l'historique." });
  }
};
