import type { NextApiRequest, NextApiResponse } from "next";
import { saveParty, getPartyByCode } from "../../lib/storage";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { partyCode, trackId } = req.body || {};
  if (!partyCode || !trackId) {
    return res.status(400).json({ error: "Missing data" });
  }
  const party = getPartyByCode(partyCode.toUpperCase());
  if (!party) {
    return res.status(404).json({ error: "Party not found" });
  }
  const track = party.tracks.find((t) => t.id === trackId);
  if (!track) {
    return res.status(404).json({ error: "Track not found" });
  }
  track.votes += 1;
  saveParty(party);
  return res.status(200).json({ track });
}
