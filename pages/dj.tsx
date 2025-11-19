import { FormEvent, useCallback, useEffect, useState } from "react";
import Timer from "../components/Timer";
import TrackList, { TrackItem } from "../components/TrackList";
import { POLLING_INTERVAL, readCookie } from "../lib/utils";

export default function DJPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [party, setParty] = useState<{ partyCode: string; playlistId: string; tracks: TrackItem[] } | null>(null);
  const [partyName, setPartyName] = useState("Voting Party");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TrackItem[]>([]);
  const [timerEnd, setTimerEnd] = useState<number>(0);
  const [roundFinished, setRoundFinished] = useState(false);
  const [topTracks, setTopTracks] = useState<TrackItem[]>([]);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    setAccessToken(readCookie("spotify_access_token"));
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then((response) => response.json())
      .then((data) => setProfileName(data.display_name || data.id || "DJ"))
      .catch(() => setProfileName("DJ"));
  }, [accessToken]);

  const refreshParty = useCallback(async () => {
    if (!party?.partyCode) {
      return;
    }
    const response = await fetch(`/api/party/${party.partyCode}`);
    if (response.ok) {
      const data = await response.json();
      setParty(data.party);
    }
  }, [party?.partyCode]);

  useEffect(() => {
    if (!party?.partyCode) {
      return;
    }
    const interval = setInterval(refreshParty, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [party?.partyCode, refreshParty]);

  const handleCreateParty = async (event: FormEvent) => {
    event.preventDefault();
    if (!accessToken) {
      setStatus("Connectez-vous avec Spotify");
      return;
    }
    setStatus("Création en cours...");
    const response = await fetch("/api/create-party", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, partyName })
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || "Impossible de créer la party");
      return;
    }
    setParty(data.party);
    setStatus(`Party créée ! Code ${data.party.partyCode}`);
  };

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: searchQuery.trim(), accessToken })
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || "Recherche impossible");
      return;
    }
    setSearchResults(data.tracks || []);
  };

  const handleAddTrack = async (track: TrackItem) => {
    if (!party?.partyCode) {
      return;
    }
    await fetch("/api/add-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyCode: party.partyCode, track })
    });
    refreshParty();
  };

  const handleVote = async (trackId: string) => {
    if (!party?.partyCode) {
      return;
    }
    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyCode: party.partyCode, trackId })
    });
    refreshParty();
  };

  const handleStartRound = () => {
    setTimerEnd(Date.now() + 5 * 60 * 1000);
    setRoundFinished(false);
    setTopTracks([]);
  };

  const fetchResults = useCallback(async () => {
    if (!party?.partyCode) {
      return;
    }
    const response = await fetch(`/api/results?partyCode=${party.partyCode}`);
    if (response.ok) {
      const data = await response.json();
      setTopTracks(data.topTracks || []);
    }
  }, [party?.partyCode]);

  const handleRoundComplete = () => {
    setRoundFinished(true);
    fetchResults();
  };

  const handleAddToPlaylist = async () => {
    if (!party?.partyCode || !accessToken) {
      setStatus("Connexion Spotify requise");
      return;
    }
    const response = await fetch("/api/add-to-playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyCode: party.partyCode, accessToken })
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || "Ajout impossible");
      return;
    }
    setStatus(`Ajout de ${data.added} titres dans la playlist`);
  };

  const handleReset = async () => {
    if (!party?.partyCode) {
      return;
    }
    await fetch("/api/reset-round", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyCode: party.partyCode })
    });
    setTopTracks([]);
    setRoundFinished(false);
    setTimerEnd(0);
    refreshParty();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout");
    setAccessToken(null);
    setProfileName("");
  };

  return (
    <main>
      <section className="section">
        <h1>Espace DJ</h1>
        {accessToken ? (
          <p>Connecté en tant que {profileName || "DJ"}</p>
        ) : (
          <p>Connectez-vous avec Spotify pour créer une party.</p>
        )}
        {!accessToken ? (
          <button className="primaryButton" onClick={() => (window.location.href = "/api/auth/login")}>Se connecter avec Spotify</button>
        ) : (
          <button className="secondaryButton" onClick={handleLogout}>Se déconnecter</button>
        )}
      </section>

      <section className="section">
        <h2>Créer une party</h2>
        <form onSubmit={handleCreateParty}>
          <input type="text" value={partyName} onChange={(event) => setPartyName(event.target.value)} placeholder="Nom de la party" />
          <button className="primaryButton" type="submit">Créer</button>
        </form>
        {status && <p>{status}</p>}
        {party && (
          <div style={{ marginTop: "1rem" }}>
            <p>Code party : <strong>{party.partyCode}</strong></p>
            <p>
              Playlist Spotify :{" "}
              <a href={`https://open.spotify.com/playlist/${party.playlistId}`} target="_blank" rel="noreferrer">
                ouvrir dans Spotify
              </a>
            </p>
          </div>
        )}
      </section>

      {party && (
        <>
          <section className="section">
            <h2>Lancer une manche</h2>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <button className="primaryButton" onClick={handleStartRound}>Démarrer 5 minutes</button>
              <Timer endTime={timerEnd} onComplete={handleRoundComplete} />
              <button className="secondaryButton" onClick={handleReset}>Réinitialiser</button>
            </div>
          </section>

          <section className="section">
            <h2>Recherche Spotify</h2>
            <form onSubmit={handleSearch}>
              <input type="text" placeholder="Titre, artiste..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
              <button className="primaryButton" type="submit">Rechercher</button>
            </form>
            <div>
              {searchResults.map((track) => (
                <div key={track.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid #eee" }}>
                  <div>
                    <strong>{track.title}</strong>
                    <p style={{ margin: 0, color: "#555" }}>{track.artist}</p>
                  </div>
                  <button className="secondaryButton" onClick={() => handleAddTrack(track)}>Proposer</button>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h2>Propositions en cours</h2>
            <TrackList tracks={party.tracks} onVote={handleVote} />
          </section>

          {roundFinished && (
            <section className="section">
              <h2>Top 3 de la manche</h2>
              <TrackList tracks={topTracks} showVotes />
              <button className="primaryButton" onClick={handleAddToPlaylist}>Ajouter à Spotify</button>
            </section>
          )}
        </>
      )}
    </main>
  );
}
