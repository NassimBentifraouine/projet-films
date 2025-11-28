import { useParams } from "react-router-dom";

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>🎥 Détail du film</h1>
      <p>
        ID du film : <strong>{id}</strong>
      </p>
      <p>Plus tard, on affichera ici le synopsis, la note, les catégories, etc.</p>
    </div>
  );
}
