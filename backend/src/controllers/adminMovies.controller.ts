import { Request, Response } from "express";
import { movies } from "../data/movies";
import { Movie } from "../types/movie";

const validateMoviePayload = (body: any): { valid: boolean; message?: string } => {
  const { title, synopsis, posterUrl, categories, durationMinutes, releaseDate } =
    body;

  if (!title || typeof title !== "string" || title.trim().length < 2) {
    return { valid: false, message: "Le titre est requis (min 2 caractères)." };
  }

  if (!synopsis || typeof synopsis !== "string" || synopsis.trim().length < 10) {
    return {
      valid: false,
      message: "Le synopsis est requis (min 10 caractères)."
    };
  }

  if (!posterUrl || typeof posterUrl !== "string") {
    return { valid: false, message: "L'URL de l'affiche est requise." };
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    return {
      valid: false,
      message: "Au moins une catégorie est requise."
    };
  }

  if (
    durationMinutes === undefined ||
    Number.isNaN(Number(durationMinutes)) ||
    Number(durationMinutes) <= 0
  ) {
    return {
      valid: false,
      message: "La durée (en minutes) doit être un nombre positif."
    };
  }

  if (!releaseDate || Number.isNaN(Date.parse(releaseDate))) {
    return {
      valid: false,
      message: "La date de sortie est invalide."
    };
  }

  return { valid: true };
};

export const createMovie = (req: Request, res: Response): void => {
  const validation = validateMoviePayload(req.body);

  if (!validation.valid) {
    res.status(400).json({ error: validation.message });
    return;
  }

  const { title, synopsis, posterUrl, categories, durationMinutes, releaseDate } =
    req.body as {
      title: string;
      synopsis: string;
      posterUrl: string;
      categories: string[];
      durationMinutes: number;
      releaseDate: string;
    };

  const newMovie: Movie = {
    id: (movies.length + 1).toString(),
    title: title.trim(),
    synopsis: synopsis.trim(),
    posterUrl: posterUrl.trim(),
    categories: categories.map((c) => c.trim()),
    durationMinutes: Number(durationMinutes),
    releaseDate: new Date(releaseDate).toISOString(),
    rating: 0
  };

  movies.push(newMovie);

  res.status(201).json({
    message: "Film créé avec succès.",
    movie: newMovie
  });
};

export const updateMovie = (req: Request, res: Response): void => {
  const { id } = req.params;

  const movie = movies.find((m) => m.id === id);

  if (!movie) {
    res.status(404).json({ error: "Film introuvable." });
    return;
  }

  const validation = validateMoviePayload(req.body);

  if (!validation.valid) {
    res.status(400).json({ error: validation.message });
    return;
  }

  const { title, synopsis, posterUrl, categories, durationMinutes, releaseDate } =
    req.body as {
      title: string;
      synopsis: string;
      posterUrl: string;
      categories: string[];
      durationMinutes: number;
      releaseDate: string;
    };

  movie.title = title.trim();
  movie.synopsis = synopsis.trim();
  movie.posterUrl = posterUrl.trim();
  movie.categories = categories.map((c) => c.trim());
  movie.durationMinutes = Number(durationMinutes);
  movie.releaseDate = new Date(releaseDate).toISOString();

  res.status(200).json({
    message: "Film mis à jour avec succès.",
    movie
  });
};

export const deleteMovie = (req: Request, res: Response): void => {
  const { id } = req.params;

  const index = movies.findIndex((m) => m.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Film introuvable." });
    return;
  }

  const deleted = movies.splice(index, 1)[0];

  res.status(200).json({
    message: "Film supprimé avec succès.",
    movie: deleted
  });
};
