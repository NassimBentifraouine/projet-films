import { useEffect, useMemo, useState } from "react";

type Movie = {
  id: string;
  title: string;
  synopsis: string;
  posterUrl: string;
  rating: number;
  categories: string[];
  durationMinutes: number;
  releaseDate: string;
};

type MoviesResponse = {
  data: Movie[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  filters: {
    category: string | null;
    minRating: number | null;
    sortBy: string | null;
    sortOrder: string | null;
  };
};

const DEFAULT_LIMIT = 6;

export function MoviesPage() {
  const apiBaseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:4000/api";

  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [sortOrder, setSortOrder] = useState<string>("desc");

  // Pour la liste des catégories, on la déduit des films de la page courante
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((movie) => {
      movie.categories.forEach((cat) => set.add(cat));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [movies]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", DEFAULT_LIMIT.toString());
        if (selectedCategory) {
          params.set("category", selectedCategory);
        }
        if (minRating > 0) {
          params.set("minRating", minRating.toString());
        }
        if (sortBy) {
          params.set("sortBy", sortBy);
        }
        if (sortOrder) {
          params.set("sortOrder", sortOrder);
        }

        const url = `${apiBaseUrl}/movies?${params.toString()}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data: MoviesResponse = await response.json();

        setMovies(data.data);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.totalItems);
      } catch (err) {
        console.error("Erreur lors de la récupération des films", err);
        setError("Impossible de charger les films. Réessaie plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [apiBaseUrl, page, selectedCategory, minRating, sortBy, sortOrder]);

  const handleResetFilters = () => {
    setSelectedCategory("");
    setMinRating(0);
    setSortBy("rating");
    setSortOrder("desc");
    setPage(1);
  };

  const handleChangePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div>
      <h1
        style={{
          fontSize: "1.8rem",
          fontWeight: 700,
          marginBottom: "0.5rem"
        }}
      >
        📚 Catalogue de films
      </h1>
      <p style={{ marginBottom: "1.5rem", color: "#9ca3af" }}>
        Découvre une sélection de films. Tu peux filtrer par catégorie, note
        minimale et trier les résultats.
      </p>

      {/* FILTRES */}
      <section
        aria-label="Filtres du catalogue"
        style={{
          marginBottom: "1.5rem",
          padding: "1rem",
          borderRadius: "0.75rem",
          background: "#020617",
          border: "1px solid rgba(148,163,184,0.4)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem"
        }}
      >
        <div>
          <label
            htmlFor="category"
            style={{ display: "block", marginBottom: "0.25rem" }}
          >
            Catégorie
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              padding: "0.4rem 0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(148,163,184,0.6)",
              background: "#020617",
              color: "#e5e7eb"
            }}
          >
            <option value="">Toutes</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="minRating"
            style={{ display: "block", marginBottom: "0.25rem" }}
          >
            Note minimale : {minRating.toFixed(1)}
          </label>
          <input
            id="minRating"
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={minRating}
            onChange={(e) => {
              setMinRating(parseFloat(e.target.value));
              setPage(1);
            }}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label
            htmlFor="sortBy"
            style={{ display: "block", marginBottom: "0.25rem" }}
          >
            Trier par
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              padding: "0.4rem 0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(148,163,184,0.6)",
              background: "#020617",
              color: "#e5e7eb"
            }}
          >
            <option value="rating">Note</option>
            <option value="title">Titre</option>
            <option value="releaseDate">Date de sortie</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="sortOrder"
            style={{ display: "block", marginBottom: "0.25rem" }}
          >
            Ordre
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              padding: "0.4rem 0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(148,163,184,0.6)",
              background: "#020617",
              color: "#e5e7eb"
            }}
          >
            <option value="desc">Décroissant</option>
            <option value="asc">Croissant</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-start"
          }}
        >
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              padding: "0.45rem 0.8rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(148,163,184,0.7)",
              background: "transparent",
              color: "#e5e7eb",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            Réinitialiser
          </button>
        </div>
      </section>

      {/* CONTENU */}
      {loading && <p>⏳ Chargement des films...</p>}

      {!loading && error && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.6)",
            color: "#fecaca",
            marginBottom: "1rem"
          }}
        >
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {!loading && !error && movies.length === 0 && (
        <p>Aucun film ne correspond à ces critères.</p>
      )}

      {!loading && !error && movies.length > 0 && (
        <>
          <p
            style={{
              marginBottom: "0.75rem",
              fontSize: "0.9rem",
              color: "#9ca3af"
            }}
          >
            Résultats : {movies.length} / {totalItems} film(s) trouvé(s)
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.25rem",
              marginBottom: "1.5rem"
            }}
          >
            {movies.map((movie) => (
              <article
                key={movie.id}
                style={{
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: "#020617",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div
                  style={{
                    position: "relative",
                    paddingTop: "150%",
                    overflow: "hidden"
                  }}
                >
                  <img
                    src={movie.posterUrl}
                    alt={`Affiche du film ${movie.title}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                </div>
                <div style={{ padding: "0.75rem 0.85rem", flex: 1 }}>
                  <h2
                    style={{
                      fontSize: "1rem",
                      margin: "0 0 0.25rem 0"
                    }}
                  >
                    {movie.title}
                  </h2>
                  <p
                    style={{
                      margin: "0 0 0.5rem 0",
                      fontSize: "0.85rem",
                      color: "#9ca3af"
                    }}
                  >
                    {movie.synopsis.length > 120
                      ? movie.synopsis.slice(0, 120) + "..."
                      : movie.synopsis}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: "#e5e7eb"
                    }}
                  >
                    ⭐ {movie.rating.toFixed(1)} · {movie.durationMinutes} min
                  </p>
                  <p
                    style={{
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.8rem",
                      color: "#9ca3af"
                    }}
                  >
                    {movie.categories.join(" · ")}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* PAGINATION */}
          <nav
            aria-label="Pagination"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.9rem"
            }}
          >
            <button
              type="button"
              onClick={() => handleChangePage(page - 1)}
              disabled={page <= 1}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(148,163,184,0.7)",
                background: page <= 1 ? "rgba(15,23,42,0.6)" : "transparent",
                color: page <= 1 ? "#4b5563" : "#e5e7eb",
                cursor: page <= 1 ? "not-allowed" : "pointer"
              }}
            >
              ← Page précédente
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handleChangePage(page + 1)}
              disabled={page >= totalPages}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(148,163,184,0.7)",
                background: page >= totalPages ? "rgba(15,23,42,0.6)" : "transparent",
                color: page >= totalPages ? "#4b5563" : "#e5e7eb",
                cursor: page >= totalPages ? "not-allowed" : "pointer"
              }}
            >
              Page suivante →
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
