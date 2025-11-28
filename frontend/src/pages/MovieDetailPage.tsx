import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

type RateResponse = {
  message: string;
  movieId: string;
  userRating: number;
  averageRating: number;
  ratingsCount: number;
};

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const apiBaseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  const { user, token } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [myRating, setMyRating] = useState<number>(7);
  const [savingRating, setSavingRating] = useState<boolean>(false);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);

  // Charger le film
  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${apiBaseUrl}/movies/${id}`);

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data: Movie = await response.json();
        setMovie(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger ce film.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [apiBaseUrl, id]);

  // Enregistrer la consultation dans l'historique
  useEffect(() => {
    const logView = async () => {
      if (!id || !token) return;

      try {
        await fetch(`${apiBaseUrl}/movies/${id}/view`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Pas de message UI ici, c'est silencieux
      } catch (err) {
        console.error("Erreur lors de l'enregistrement de l'historique", err);
      }
    };

    logView();
  }, [apiBaseUrl, id, token]);

  const handleSubmitRating = async (event: FormEvent) => {
    event.preventDefault();
    setRatingMessage(null);

    if (!token) {
      setRatingMessage("Tu dois être connecté pour noter ce film.");
      return;
    }

    if (!id) return;

    try {
      setSavingRating(true);

      const response = await fetch(`${apiBaseUrl}/movies/${id}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: myRating })
      });

      const data: RateResponse = await response.json();

      if (!response.ok) {
        const message = (data as any).error || "Erreur lors de l'enregistrement.";
        throw new Error(message);
      }

      setRatingMessage("Ta note a bien été enregistrée.");

      // Mettre à jour la note moyenne du film dans l'état
      setMovie((prev) =>
        prev
          ? {
              ...prev,
              rating: data.averageRating
            }
          : prev
      );
    } catch (err) {
      console.error(err);
      setRatingMessage(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement de ta note."
      );
    } finally {
      setSavingRating(false);
    }
  };

  if (loading) {
    return <p>Chargement du film...</p>;
  }

  if (error || !movie) {
    return (
      <div>
        <h1>Erreur</h1>
        <p>{error ?? "Film introuvable."}</p>
      </div>
    );
  }

  const releaseYear = new Date(movie.releaseDate).getFullYear();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.4fr)",
        gap: "1.5rem"
      }}
    >
      <div>
        <div
          style={{
            borderRadius: "0.75rem",
            overflow: "hidden",
            border: "1px solid rgba(148,163,184,0.4)",
            marginBottom: "1rem"
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
        </div>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#9ca3af"
          }}
        >
          Catégories : {movie.categories.join(" · ")}
        </p>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#9ca3af"
          }}
        >
          Durée : {movie.durationMinutes} min · Sorti en {releaseYear}
        </p>
      </div>

      <div>
        <h1
          style={{
            fontSize: "1.8rem",
            marginBottom: "0.5rem"
          }}
        >
          {movie.title}
        </h1>
        <p
          style={{
            marginBottom: "0.75rem",
            color: "#9ca3af"
          }}
        >
          {movie.synopsis}
        </p>

        <p
          style={{
            marginBottom: "1rem",
            fontSize: "1rem"
          }}
        >
          <strong>Note moyenne :</strong> ⭐ {movie.rating.toFixed(1)} / 10
        </p>

        <hr
          style={{
            margin: "1rem 0",
            borderColor: "rgba(148,163,184,0.4)"
          }}
        />

        <section aria-label="Noter ce film">
          <h2
            style={{
              fontSize: "1.1rem",
              marginBottom: "0.5rem"
            }}
          >
            Donne ta note
          </h2>

          {!user && (
            <p style={{ color: "#f97316", fontSize: "0.9rem" }}>
              Tu dois être connecté pour noter ce film.
            </p>
          )}

          <form
            onSubmit={handleSubmitRating}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              maxWidth: "320px"
            }}
          >
            <div>
              <label
                htmlFor="rating"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                Ta note : {myRating.toFixed(1)} / 10
              </label>
              <input
                id="rating"
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={myRating}
                onChange={(e) => setMyRating(parseFloat(e.target.value))}
                disabled={!user}
                style={{ width: "100%" }}
              />
            </div>

            <button
              type="submit"
              disabled={!user || savingRating}
              style={{
                padding: "0.55rem 0.8rem",
                borderRadius: "0.5rem",
                border: "none",
                background: !user
                  ? "#4b5563"
                  : savingRating
                  ? "#4b5563"
                  : "#22c55e",
                color: "#0f172a",
                fontWeight: 600,
                cursor: !user || savingRating ? "not-allowed" : "pointer",
                fontSize: "0.9rem"
              }}
            >
              {savingRating ? "Enregistrement..." : "Enregistrer ma note"}
            </button>

            {ratingMessage && (
              <p
                style={{
                  fontSize: "0.9rem",
                  color: ratingMessage.startsWith("Erreur")
                    ? "#fecaca"
                    : "#bbf7d0"
                }}
              >
                {ratingMessage}
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
