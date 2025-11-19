import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const partyCode = code.trim().toUpperCase();
    if (!partyCode) {
      setError("Entrez un code valide");
      return;
    }
    const response = await fetch("/api/join-party", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyCode })
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Impossible de rejoindre la party");
      return;
    }
    router.push(`/party/${partyCode}`);
  };

  return (
    <main>
      <section className="section">
        <h1>Voting Party</h1>
        <p>Créez une party Spotify, invitez vos amis et laissez-les voter pour les prochains sons.</p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button className="primaryButton" onClick={() => router.push("/dj")}>Interface DJ</button>
          <button className="secondaryButton" onClick={() => router.push("/vote")}>Interface de vote</button>
        </div>
      </section>

      <section className="section">
        <h2>Rejoindre une party</h2>
        <form onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="Code party"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button className="primaryButton" type="submit">
            Rejoindre
          </button>
        </form>
      </section>
    </main>
  );
}
