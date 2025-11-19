import { FormEvent, useState } from "react";
import TrackList, { TrackItem } from "../components/TrackList";

export default function ResultsPage() {
  const [partyCode, setPartyCode] = useState("");
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async (event: FormEvent) => {
    event.preventDefault();
    const code = partyCode.trim().toUpperCase();
    if (!code) {
      setError("Code requis");
      return;
    }
    const response = await fetch(`/api/results?partyCode=${code}`);
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Impossible de récupérer les résultats");
      return;
    }
    setTracks(data.topTracks || []);
    setError(null);
  };

  return (
    <main>
      <section className="section">
        <h1>Résultats</h1>
        <form onSubmit={handleFetch}>
          <input type="text" placeholder="Code party" value={partyCode} onChange={(event) => setPartyCode(event.target.value)} />
          <button className="primaryButton" type="submit">Afficher le top 3</button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </section>

      {tracks.length > 0 && (
        <section className="section">
          <h2>Top 3</h2>
          <TrackList tracks={tracks} showVotes />
        </section>
      )}
    </main>
  );
}
