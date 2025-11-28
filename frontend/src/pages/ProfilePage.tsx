import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

type Movie = {
  id: string;
  title: string;
  posterUrl: string;
  rating: number;
  categories: string[];
};

type WatchlistResponse = {
  movies: Movie[];
  count: number;
};

export function ProfilePage() {
  const { user, token } = useAuth();
  const apiBaseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:4000/api";

  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState<boolean>(true);
  const [errorWatchlist, setErrorWatchlist] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!token) {
        setWatchlist([]);
        setLoadingWatchlist(false);
        return;
      }

      try {
        setLoadingWatchlist(true);
        setErrorWatchlist(null);

        const response = await fetch(`${apiBaseUrl}/me/watchlist`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement de la watchlist.");
        }

        const data: WatchlistResponse = await response.json();
        setWatchlist(data.movies);
      } catch (err) {
        console.error(err);
        setErrorWatchlist(
          "Impossible de récupérer la watchlist pour le moment."
        );
      } finally {
        setLoadingWatchlist(false);
      }
    };

    fetchWatchlist();
  }, [apiBaseUrl, token]);

  if (!user) {
    return (
      <div>
        <h1>👤 Mon profil</h1>
        <p>Tu dois être connecté pour voir cette page.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>👤 Mon profil</h1>
      <p>
        <strong>Nom :</strong> {user.name}
      </p>
      <p>
        <strong>Email :</strong> {user.email}
      </p>
      <p>
        <strong>Rôle :</strong> {user.role}
      </p>
      <p>
        <strong>Compte créé le :</strong>{" "}
        {new Date(user.createdAt).toLocaleString("fr-FR")}
      </p>

      <hr
        style={{
          margin: "1.5rem 0",
          borderColor: "rgba(148,163,184,0.4)"
        }}
      />

      <section>
        <h2
          style={{
            fontSize: "1.2rem",
            marginBottom: "0.5rem"
          }}
        >
          ⭐ Ma watchlist
        </h2>

        {loadingWatchlist && <p>Chargement de ta watchlist...</p>}

        {!loadingWatchlist && errorWatchlist && (
          <p style={{ color: "#fecaca" }}>{errorWatchlist}</p>
        )}

        {!loadingWatchlist &&
          !errorWatchlist &&
          watchlist.length === 0 && (
            <p>Tu n&apos;as encore ajouté aucun film à ta watchlist.</p>
          )}

        {!loadingWatchlist &&
          !errorWatchlist &&
          watchlist.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem",
                marginTop: "0.75rem"
              }}
            >
              {watchlist.map((movie) => (
                <article
                  key={movie.id}
                  style={{
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    border: "1px solid rgba(148,163,184,0.4)",
                    background: "#020617"
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      paddingTop: "145%",
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
                  <div style={{ padding: "0.6rem 0.75rem" }}>
                    <h3
                      style={{
                        margin: "0 0 0.25rem 0",
                        fontSize: "0.95rem"
                      }}
                    >
                      {movie.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.8rem",
                        color: "#9ca3af"
                      }}
                    >
                      ⭐ {movie.rating.toFixed(1)} ·{" "}
                      {movie.categories.join(" · ")}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}
