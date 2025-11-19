import { FormEvent, useCallback, useEffect, useState } from "react";
import TrackList, { TrackItem } from "../components/TrackList";
import { POLLING_INTERVAL } from "../lib/utils";

export default function VotePage() {
  const [partyCode, setPartyCode] = useState("");
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchParty = useCallback(async () => {
    if (!currentCode) {
      return;
    }
    const response = await fetch(`/api/party/${currentCode}`);
    if (!response.ok) {
      setError("Party introuvable");
      return;
    }
    const data = await response.json();
    setTracks(data.party.tracks || []);
    setError(null);
  }, [currentCode]);

  useEffect(() => {
    if (!currentCode) {
      return;
    }
    fetchParty();
    const interval = setInterval(fetchParty, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [currentCode, fetchParty]);

  const handleJoin = async (event: FormEvent) => {
    event.preventDefault();
    const code = partyCode.trim().toUpperCase();
    if (!code) {
      setError("Entrez un code");
      return;
    }
    const response = await fetch(`/api/join-party`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyCode: code })
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Impossible de rejoindre");
      return;
    }
    setCurrentCode(code);
    setError(null);
    setPartyCode(code);
  };

  const handleVote = async (trackId: string) => {
    if (!currentCode) {
      return;
    }
    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyCode: currentCode, trackId })
    });
    fetchParty();
  };

  return (
    <main>
      <section className="section">
        <h1>Interface de vote</h1>
        <form onSubmit={handleJoin}>
          <input type="text" placeholder="Code party" value={partyCode} onChange={(event) => setPartyCode(event.target.value)} />
          <button className="primaryButton" type="submit">Rejoindre</button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </section>

      {currentCode && (
        <section className="section">
          <h2>Votes pour la party {currentCode}</h2>
          <TrackList tracks={tracks} onVote={handleVote} />
        </section>
      )}
    </main>
  );
}
