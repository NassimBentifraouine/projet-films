import { FormEvent, useEffect, useState } from "react";
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

type MoviesResponse = {
  data: Movie[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

type AdminFormMode = "create" | "edit";

export function AdminDashboardPage() {
  const apiBaseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:4000/api";

  const { user, token } = useAuth();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<AdminFormMode>("create");
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  // Champs du formulaire
  const [title, setTitle] = useState<string>("");
  const [synopsis, setSynopsis] = useState<string>("");
  const [posterUrl, setPosterUrl] = useState<string>("");
  const [categoriesInput, setCategoriesInput] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState<string>("120");
  const [releaseDate, setReleaseDate] = useState<string>("2010-01-01");

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadingPoster, setUploadingPoster] = useState<boolean>(false);

  // Chargement de la liste des films (admin peut voir tous les films)
  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "100");
      params.set("sortBy", "title");
      params.set("sortOrder", "asc");

      const response = await fetch(
        `${apiBaseUrl}/movies?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data: MoviesResponse = await response.json();
      setMovies(data.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger la liste des films.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl]);

  const resetForm = () => {
    setTitle("");
    setSynopsis("");
    setPosterUrl("");
    setCategoriesInput("");
    setDurationMinutes("120");
    setReleaseDate("2010-01-01");
    setFormError(null);
    setFormSuccess(null);
    setEditingMovie(null);
    setFormMode("create");
  };

  const handleEdit = (movie: Movie) => {
    setFormMode("edit");
    setEditingMovie(movie);
    setTitle(movie.title);
    setSynopsis(movie.synopsis);
    setPosterUrl(movie.posterUrl);
    setCategoriesInput(movie.categories.join(", "));
    setDurationMinutes(String(movie.durationMinutes));
    // format yyyy-mm-dd
    setReleaseDate(movie.releaseDate.slice(0, 10));
    setFormError(null);
    setFormSuccess(null);
  };

  const handleDelete = async (movie: Movie) => {
    if (!token) {
      alert("Tu dois être connecté en admin pour supprimer un film.");
      return;
    }

    const confirmed = window.confirm(
      `Supprimer le film "${movie.title}" ? Cette action est définitive (dans les données en mémoire).`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${apiBaseUrl}/admin/movies/${movie.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const message = data.error || "Erreur lors de la suppression.";
        throw new Error(message);
      }

      setMovies((prev) => prev.filter((m) => m.id !== movie.id));
      alert("Film supprimé avec succès.");
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression du film."
      );
    }
  };

  const handlePosterFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!token) {
      alert("Tu dois être connecté en admin pour uploader une affiche.");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPoster(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const formData = new FormData();
      formData.append("poster", file);

      const response = await fetch(
        `${apiBaseUrl}/admin/upload/poster`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const message = data.error || "Erreur lors de l'upload de l'affiche.";
        throw new Error(message);
      }

      setPosterUrl(data.url);
      setFormSuccess("Affiche uploadée avec succès.");
    } catch (err) {
      console.error(err);
      setFormError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'upload de l'affiche."
      );
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      setFormError("Tu dois être connecté en admin pour gérer les films.");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const categories = categoriesInput
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const payload = {
        title,
        synopsis,
        posterUrl,
        categories,
        durationMinutes: Number(durationMinutes),
        releaseDate // format yyyy-mm-dd, le backend convertira en ISO
      };

      const url =
        formMode === "create"
          ? `${apiBaseUrl}/admin/movies`
          : `${apiBaseUrl}/admin/movies/${editingMovie?.id}`;

      const method = formMode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.error || "Erreur lors de l'enregistrement.";
        throw new Error(message);
      }

      setFormSuccess(
        formMode === "create"
          ? "Film créé avec succès."
          : "Film mis à jour avec succès."
      );

      // Mise à jour locale de la liste
      if (formMode === "create") {
        setMovies((prev) => [...prev, data.movie]);
      } else if (formMode === "edit") {
        setMovies((prev) =>
          prev.map((m) => (m.id === data.movie.id ? data.movie : m))
        );
      }

      // Option : reset partiel
      if (formMode === "create") {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setFormError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement du film."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Protection : il faut être connecté et admin
  if (!user) {
    return (
      <div>
        <h1>🔐 Espace admin</h1>
        <p>Tu dois être connecté pour accéder au back-office.</p>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div>
        <h1>🔐 Espace admin</h1>
        <p>
          Accès refusé. Cette section est réservée aux utilisateurs avec le rôle{" "}
          <strong>admin</strong>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1
        style={{
          fontSize: "1.6rem",
          fontWeight: 700,
          marginBottom: "0.75rem"
        }}
      >
        🔧 Back-office – Gestion des films
      </h1>
      <p style={{ marginBottom: "1.5rem", color: "#9ca3af" }}>
        Ici, tu peux créer, modifier et supprimer des films, ainsi qu&apos;uploader
        des affiches.
      </p>

      {/* LAYOUT EN DEUX COLONNES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.1fr)",
          gap: "1.5rem"
        }}
      >
        {/* COLONNE GAUCHE : LISTE */}
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem"
            }}
          >
            <h2 style={{ fontSize: "1.1rem" }}>Liste des films</h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={fetchMovies}
                style={{
                  padding: "0.35rem 0.7rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  background: "transparent",
                  color: "#e5e7eb",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                Actualiser
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "0.35rem 0.7rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background: "#3b82f6",
                  color: "#e5e7eb",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                Nouveau film
              </button>
            </div>
          </div>

          {loading && <p>Chargement des films...</p>}

          {!loading && error && (
            <p style={{ color: "#fecaca" }}>{error}</p>
          )}

          {!loading && !error && movies.length === 0 && (
            <p>Aucun film pour le moment.</p>
          )}

          {!loading && !error && movies.length > 0 && (
            <div
              style={{
                maxHeight: "420px",
                overflowY: "auto",
                borderRadius: "0.75rem",
                border: "1px solid rgba(148,163,184,0.4)"
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.85rem"
                }}
              >
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    background: "#020617"
                  }}
                >
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem",
                        borderBottom: "1px solid rgba(148,163,184,0.4)"
                      }}
                    >
                      Titre
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem",
                        borderBottom: "1px solid rgba(148,163,184,0.4)"
                      }}
                    >
                      Note
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem",
                        borderBottom: "1px solid rgba(148,163,184,0.4)"
                      }}
                    >
                      Sortie
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem",
                        borderBottom: "1px solid rgba(148,163,184,0.4)"
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie.id}>
                      <td
                        style={{
                          padding: "0.45rem 0.5rem",
                          borderBottom: "1px solid rgba(31,41,55,0.8)"
                        }}
                      >
                        {movie.title}
                      </td>
                      <td
                        style={{
                          padding: "0.45rem 0.5rem",
                          borderBottom: "1px solid rgba(31,41,55,0.8)"
                        }}
                      >
                        ⭐ {movie.rating.toFixed(1)}
                      </td>
                      <td
                        style={{
                          padding: "0.45rem 0.5rem",
                          borderBottom: "1px solid rgba(31,41,55,0.8)"
                        }}
                      >
                        {movie.releaseDate.slice(0, 10)}
                      </td>
                      <td
                        style={{
                          padding: "0.45rem 0.5rem",
                          borderBottom: "1px solid rgba(31,41,55,0.8)"
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleEdit(movie)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.4rem",
                            border: "none",
                            background: "#22c55e",
                            color: "#0f172a",
                            cursor: "pointer",
                            marginRight: "0.3rem"
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(movie)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.4rem",
                            border: "none",
                            background: "#ef4444",
                            color: "#f9fafb",
                            cursor: "pointer"
                          }}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* COLONNE DROITE : FORMULAIRE */}
        <section>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
            {formMode === "create"
              ? "Créer un nouveau film"
              : `Modifier le film : ${editingMovie?.title}`}
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem"
            }}
          >
            <div>
              <label
                htmlFor="title"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                Titre
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.45rem 0.6rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  background: "#020617",
                  color: "#e5e7eb"
                }}
              />
            </div>

            <div>
              <label
                htmlFor="synopsis"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                Synopsis
              </label>
              <textarea
                id="synopsis"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                required
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.45rem 0.6rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  background: "#020617",
                  color: "#e5e7eb",
                  resize: "vertical"
                }}
              />
            </div>

            <div>
              <label
                htmlFor="categories"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                Catégories (séparées par des virgules)
              </label>
              <input
                id="categories"
                type="text"
                value={categoriesInput}
                onChange={(e) => setCategoriesInput(e.target.value)}
                placeholder="Ex : Action, Science-Fiction"
                required
                style={{
                  width: "100%",
                  padding: "0.45rem 0.6rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  background: "#020617",
                  color: "#e5e7eb"
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem"
              }}
            >
              <div>
                <label
                  htmlFor="duration"
                  style={{ display: "block", marginBottom: "0.25rem" }}
                >
                  Durée (minutes)
                </label>
                <input
                  id="duration"
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.45rem 0.6rem",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(148,163,184,0.7)",
                    background: "#020617",
                    color: "#e5e7eb"
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="releaseDate"
                  style={{ display: "block", marginBottom: "0.25rem" }}
                >
                  Date de sortie
                </label>
                <input
                  id="releaseDate"
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.45rem 0.6rem",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(148,163,184,0.7)",
                    background: "#020617",
                    color: "#e5e7eb"
                  }}
                />
              </div>
            </div>

            {/* UPLOAD AFFICHES */}
            <div>
              <label
                htmlFor="posterFile"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                Affiche (upload d&apos;image)
              </label>
              <input
                id="posterFile"
                type="file"
                accept="image/*"
                onChange={handlePosterFileChange}
                style={{
                  marginBottom: "0.4rem"
                }}
              />
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  margin: 0
                }}
              >
                Après upload, l&apos;URL générée sera utilisée comme affiche du film.
              </p>
            </div>

            <div>
              <label
                htmlFor="posterUrl"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                URL de l&apos;affiche
              </label>
              <input
                id="posterUrl"
                type="text"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.45rem 0.6rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  background: "#020617",
                  color: "#e5e7eb"
                }}
              />
              {posterUrl && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem"
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "90px",
                      borderRadius: "0.4rem",
                      overflow: "hidden",
                      border: "1px solid rgba(148,163,184,0.5)"
                    }}
                  >
                    <img
                      src={posterUrl}
                      alt="Aperçu de l'affiche"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                    Aperçu de l&apos;affiche
                  </span>
                </div>
              )}
            </div>

            {formError && (
              <div
                style={{
                  padding: "0.5rem 0.7rem",
                  borderRadius: "0.5rem",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.7)",
                  color: "#fecaca",
                  fontSize: "0.85rem"
                }}
              >
                {formError}
              </div>
            )}

            {formSuccess && (
              <div
                style={{
                  padding: "0.5rem 0.7rem",
                  borderRadius: "0.5rem",
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.7)",
                  color: "#bbf7d0",
                  fontSize: "0.85rem"
                }}
              >
                {formSuccess}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginTop: "0.5rem"
              }}
            >
              <button
                type="submit"
                disabled={submitting || uploadingPoster}
                style={{
                  padding: "0.55rem 0.9rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background:
                    submitting || uploadingPoster ? "#4b5563" : "#22c55e",
                  color: "#0f172a",
                  fontWeight: 600,
                  cursor:
                    submitting || uploadingPoster ? "not-allowed" : "pointer",
                  fontSize: "0.9rem"
                }}
              >
                {formMode === "create"
                  ? submitting
                    ? "Création..."
                    : "Créer le film"
                  : submitting
                  ? "Mise à jour..."
                  : "Enregistrer les modifications"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "0.55rem 0.9rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(148,163,184,0.7)",
                  background: "transparent",
                  color: "#e5e7eb",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                Réinitialiser le formulaire
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
