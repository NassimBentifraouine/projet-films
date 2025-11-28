import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  message: string;
};

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiBaseUrl =
      import.meta.env.VITE_API_URL || "http://localhost:4000/api";

    const fetchHealth = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${apiBaseUrl}/health`);

        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data: HealthResponse = await response.json();
        setHealth(data);
      } catch (err: unknown) {
        console.error("Erreur lors de l'appel à /api/health", err);
        setError("Impossible de joindre l'API backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#0f172a",
        color: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "2rem",
          borderRadius: "1rem",
          background: "#020617",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          border: "1px solid rgba(148,163,184,0.3)"
        }}
      >
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "0.75rem"
          }}
        >
          🎬 Projet Films – Frontend
        </h1>
        <p style={{ marginBottom: "1.5rem", color: "#9ca3af" }}>
          Cette page vérifie la connexion entre le frontend React et l&apos;API
          backend.
        </p>

        {loading && <p>⏳ Vérification de l&apos;API en cours...</p>}

        {!loading && error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.6)",
              color: "#fecaca"
            }}
          >
            <strong>Erreur :</strong> {error}
          </div>
        )}

        {!loading && !error && health && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.6)",
              color: "#bbf7d0"
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>Statut :</strong> {health.status}
            </p>
            <p style={{ margin: "0.25rem 0 0 0" }}>
              <strong>Message :</strong> {health.message}
            </p>
          </div>
        )}

        <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#6b7280" }}>
          Backend attendu sur :{" "}
          <code style={{ fontFamily: "monospace" }}>
            {import.meta.env.VITE_API_URL || "http://localhost:4000/api"}
          </code>
        </p>
      </div>
    </div>
  );
}

export default App;
