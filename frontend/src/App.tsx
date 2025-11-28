import { Link, NavLink, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { MoviesPage } from "./pages/MoviesPage";
import { MovieDetailPage } from "./pages/MovieDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#e5e7eb",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}
      >
        <p>Chargement de la session utilisateur...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#0f172a",
        color: "#e5e7eb",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* BARRE DE NAVIGATION */}
      <header
        style={{
          borderBottom: "1px solid rgba(148,163,184,0.3)",
          background: "#020617"
        }}
      >
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            padding: "0.75rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem"
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "#e5e7eb",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <span>🎬</span>
            <span>Films App</span>
          </Link>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              fontSize: "0.95rem"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem"
              }}
            >
              <NavItem to="/">Accueil</NavItem>
              <NavItem to="/movies">Catalogue</NavItem>
              {user && <NavItem to="/profile">Profil</NavItem>}
              {user?.role === "admin" && <NavItem to="/admin">Admin</NavItem>}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem"
              }}
            >
              {user ? (
                <>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "#9ca3af"
                    }}
                  >
                    Bonjour, <strong>{user.name}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    style={{
                      padding: "0.3rem 0.7rem",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(248,113,113,0.8)",
                      background: "transparent",
                      color: "#fecaca",
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <NavItem to="/login">Connexion</NavItem>
                  <NavItem to="/register">Inscription</NavItem>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* CONTENU CENTRAL */}
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "2rem 1.5rem"
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "960px",
            background: "#020617",
            borderRadius: "1rem",
            padding: "2rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            border: "1px solid rgba(148,163,184,0.3)"
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:id" element={<MovieDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>

      {/* PIED DE PAGE */}
      <footer
        style={{
          padding: "0.75rem 1.5rem",
          textAlign: "center",
          fontSize: "0.8rem",
          color: "#6b7280"
        }}
      >
        Projet scolaire – Catalogue de films · React &amp; Node.js
      </footer>
    </div>
  );
}

type NavItemProps = {
  to: string;
  children: React.ReactNode;
};

function NavItem({ to, children }: NavItemProps) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        textDecoration: "none",
        color: isActive ? "#fbbf24" : "#e5e7eb",
        fontWeight: isActive ? 600 : 400,
        borderBottom: isActive ? "2px solid #fbbf24" : "2px solid transparent",
        paddingBottom: "0.15rem"
      })}
    >
      {children}
    </NavLink>
  );
}

export default App;
