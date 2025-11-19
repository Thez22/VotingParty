import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import TrackList, { TrackItem } from "../../components/TrackList";
import { POLLING_INTERVAL } from "../../lib/utils";

export default function PartyView() {
  const router = useRouter();
  const [partyCode, setPartyCode] = useState<string>("");
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<TrackItem[]>([]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (typeof router.query.code === "string") {
      setPartyCode(router.query.code.toUpperCase());
    }
  }, [router.query.code]);

  const fetchParty = useCallback(async () => {
    if (!partyCode) {
      return;
    }
    const response = await fetch(`/api/party/${partyCode}`);
    if (response.ok) {
      const data = await response.json();
      setTracks(data.party.tracks || []);
    }
  }, [partyCode]);

  useEffect(() => {
    fetchParty();
  }, [fetchParty]);

  useEffect(() => {
    if (!partyCode) {
      return;
    }
    const interval = setInterval(fetchParty, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [partyCode, fetchParty]);

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: searchQuery.trim() })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Recherche impossible");
      return;
    }
    setResults(data.tracks || []);
  };

  const handlePropose = async (track: TrackItem) => {
    if (!partyCode) {
      return;
    }
    const response = await fetch("/api/add-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyCode, track })
    });
    if (response.ok) {
      setMessage("Titre ajouté !");
      fetchParty();
    } else {
      const data = await response.json();
      setMessage(data.error || "Impossible d'ajouter le titre");
    }
  };

  const handleVote = async (trackId: string) => {
    if (!partyCode) {
      return;
    }
    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyCode, trackId })
    });
    fetchParty();
  };

  return (
    <main>
      <section className="section">
        <h1>Party {partyCode}</h1>
        <p>Proposez un titre Spotify via la recherche et votez pour vos favoris.</p>
        {message && <p>{message}</p>}
      </section>

      <section className="section">
        <h2>Rechercher un titre</h2>
        <form onSubmit={handleSearch}>
          <input type="text" placeholder="Ex: Daft Punk" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          <button className="primaryButton" type="submit">Rechercher</button>
        </form>
        <div>
          {results.map((track) => (
            <div key={track.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #eee" }}>
              <div>
                <strong>{track.title}</strong>
                <p style={{ margin: 0, color: "#666" }}>{track.artist}</p>
              </div>
              <button className="secondaryButton" onClick={() => handlePropose(track)}>Proposer</button>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Votes en cours</h2>
        <TrackList tracks={tracks} onVote={handleVote} />
      </section>
    </main>
  );
}
