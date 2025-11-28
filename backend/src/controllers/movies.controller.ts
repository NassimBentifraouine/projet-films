import { Request, Response } from "express";
import { movies } from "../data/movies";
import { Movie } from "../types/movie";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 6;

export const getMovies = (req: Request, res: Response): void => {
  try {
    const pageParam = (req.query.page as string) ?? DEFAULT_PAGE.toString();
    const limitParam = (req.query.limit as string) ?? DEFAULT_LIMIT.toString();
    const categoryParam = (req.query.category as string) ?? "";
    const minRatingParam = (req.query.minRating as string) ?? "";
    const sortByParam = (req.query.sortBy as string) ?? "";
    const sortOrderParam = (req.query.sortOrder as string) ?? "desc";

    const page = Math.max(parseInt(pageParam, 10) || DEFAULT_PAGE, 1);
    const limit = Math.max(parseInt(limitParam, 10) || DEFAULT_LIMIT, 1);

    const minRating =
      minRatingParam !== "" ? Math.max(parseFloat(minRatingParam) || 0, 0) : undefined;

    let filtered: Movie[] = [...movies];

    // Filtres
    if (categoryParam.trim() !== "") {
      const lowerCat = categoryParam.toLowerCase();
      filtered = filtered.filter((movie) =>
        movie.categories.some((cat) => cat.toLowerCase() === lowerCat)
      );
    }

    if (minRating !== undefined) {
      filtered = filtered.filter((movie) => movie.rating >= minRating);
    }

    // Tri
    let sorted = [...filtered];

    if (sortByParam) {
      const sortBy = sortByParam as "title" | "rating" | "releaseDate";
      const order = sortOrderParam === "asc" ? 1 : -1;

      sorted.sort((a, b) => {
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

    // Pagination
    const totalItems = sorted.length;
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
    const safePage = Math.min(page, totalPages);

    const startIndex = (safePage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = sorted.slice(startIndex, endIndex);

    res.status(200).json({
      data: paginated,
      pagination: {
        page: safePage,
        limit,
        totalItems,
        totalPages
      },
      filters: {
        category: categoryParam || null,
        minRating: minRating ?? null,
        sortBy: sortByParam || null,
        sortOrder: sortOrderParam || null
      }
    });
  } catch (error) {
    console.error("Erreur dans getMovies:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors du chargement des films." });
  }
};

export const getMovieById = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const movie = movies.find((m) => m.id === id);

    if (!movie) {
      res.status(404).json({
        error: "Film non trouvé"
      });
      return;
    }

    res.status(200).json(movie);
  } catch (error) {
    console.error("Erreur dans getMovieById:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors du chargement du film." });
  }
};
