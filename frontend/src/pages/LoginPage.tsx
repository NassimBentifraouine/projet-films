import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("admin@example.com");
  const [password, setPassword] = useState<string>("Admin123!");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      navigate("/profile");
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Erreur lors de la connexion.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1
        style={{
          fontSize: "1.6rem",
          fontWeight: 700,
          marginBottom: "0.75rem"
        }}
      >
        🔐 Connexion
      </h1>
      <p style={{ marginBottom: "1.5rem", color: "#9ca3af" }}>
        Connecte-toi avec ton compte. Tu peux utiliser l&apos;admin par défaut :
        <br />
        <code>admin@example.com / Admin123!</code>
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          maxWidth: "360px"
        }}
      >
        <div>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "0.25rem" }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(148,163,184,0.8)",
              background: "#020617",
              color: "#e5e7eb"
            }}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: "0.25rem" }}
          >
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(148,163,184,0.8)",
              background: "#020617",
              color: "#e5e7eb"
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: "0.6rem 0.8rem",
              borderRadius: "0.5rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.7)",
              color: "#fecaca",
              fontSize: "0.9rem"
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: "0.5rem",
            padding: "0.55rem 0.8rem",
            borderRadius: "0.5rem",
            border: "none",
            background: submitting ? "#4b5563" : "#22c55e",
            color: "#0f172a",
            fontWeight: 600,
            cursor: submitting ? "not-allowed" : "pointer"
          }}
        >
          {submitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
