import fs from "fs";
import path from "path";

export type Track = {
  id: string;
  title: string;
  artist: string;
  votes: number;
};

export type Party = {
  partyCode: string;
  playlistId: string;
  roundEnd: number;
  tracks: Track[];
};

const dataPath = path.join(process.cwd(), "data", "parties.json");

function ensureFile() {
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
  }
}

export function readParties(): Party[] {
  ensureFile();
  const raw = fs.readFileSync(dataPath, "utf-8");
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse parties file", error);
    return [];
  }
}

export function writeParties(parties: Party[]): void {
  ensureFile();
  fs.writeFileSync(dataPath, JSON.stringify(parties, null, 2));
}

export function getPartyByCode(partyCode: string): Party | undefined {
  const parties = readParties();
  return parties.find((party) => party.partyCode === partyCode);
}

export function saveParty(party: Party): Party {
  const parties = readParties();
  const index = parties.findIndex((p) => p.partyCode === party.partyCode);
  if (index >= 0) {
    parties[index] = party;
  } else {
    parties.push(party);
  }
  writeParties(parties);
  return party;
}

export function updateParty(
  partyCode: string,
  updater: (party: Party) => Party
): Party | undefined {
  const parties = readParties();
  const index = parties.findIndex((p) => p.partyCode === partyCode);
  if (index === -1) {
    return undefined;
  }
  const updated = updater(parties[index]);
  parties[index] = updated;
  writeParties(parties);
  return updated;
}
