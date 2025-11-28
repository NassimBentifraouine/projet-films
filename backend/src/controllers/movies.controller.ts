import { Request, Response } from "express";
import { movies } from "../data/movies";
import { Movie } from "../types/movie";

type MoviesQuery = {
  page?: string;
  limit?: string;
  category?: string;
  minRating?: string;
  sortBy?: "title" | "rating" | "releaseDate";
  sortOrder?: "asc" | "desc";
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 6;

export const getMovies = (req: Request, res: Response): void => {
  const {
    page = DEFAULT_PAGE.toString(),
    limit = DEFAULT_LIMIT.toString(),
    category,
    minRating,
    sortBy,
    sortOrder
  } = req.query as MoviesQuery;

  const pageNumber = Math.max(parseInt(page, 10) || DEFAULT_PAGE, 1);
  const limitNumber = Math.max(parseInt(limit, 10) || DEFAULT_LIMIT, 1);

  const minRatingNumber =
    minRating !== undefined ? Math.max(parseFloat(minRating) || 0, 0) : undefined;

  // 1. Filtres
  let filtered: Movie[] = [...movies];

  if (category && category.trim() !== "") {
    filtered = filtered.filter((movie) =>
      movie.categories.some(
        (cat) => cat.toLowerCase() === category.toLowerCase()
      )
    );
  }

  if (minRatingNumber !== undefined) {
    filtered = filtered.filter((movie) => movie.rating >= minRatingNumber);
  }

  // 2. Tri
  let sorted = [...filtered];

  if (sortBy) {
    sorted.sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;

      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title) * order;
        case "rating":
          return (a.rating - b.rating) * order;
        case "releaseDate":
          return (
            (new Date(a.releaseDate).getTime() -
              new Date(b.releaseDate).getTime()) * order
          );
        default:
          return 0;
      }
    });
  }

  // 3. Pagination
  const totalItems = sorted.length;
  const totalPages = Math.max(Math.ceil(totalItems / limitNumber), 1);
  const safePage = Math.min(pageNumber, totalPages);

  const startIndex = (safePage - 1) * limitNumber;
  const endIndex = startIndex + limitNumber;
  const paginated = sorted.slice(startIndex, endIndex);

  res.status(200).json({
    data: paginated,
    pagination: {
      page: safePage,
      limit: limitNumber,
      totalItems,
      totalPages
    },
    filters: {
      category: category || null,
      minRating: minRatingNumber ?? null,
      sortBy: sortBy || null,
      sortOrder: sortOrder || null
    }
  });
};

export const getMovieById = (req: Request, res: Response): void => {
  const { id } = req.params;

  const movie = movies.find((m) => m.id === id);

  if (!movie) {
    res.status(404).json({
      error: "Film non trouvé"
    });
    return;
  }

  res.status(200).json(movie);
};