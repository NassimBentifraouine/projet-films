import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const { user } = useAuth();

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
    </div>
  );
}
