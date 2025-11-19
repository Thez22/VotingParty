import type { NextApiRequest, NextApiResponse } from "next";
import { getPartyByCode, saveParty, Track } from "../../lib/storage";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { partyCode, track } = req.body || {};
  if (!partyCode || !track) {
    return res.status(400).json({ error: "Missing data" });
  }
  const party = getPartyByCode(partyCode.toUpperCase());
  if (!party) {
    return res.status(404).json({ error: "Party not found" });
  }
  const exists = party.tracks.some((t) => t.id === track.id);
  if (!exists) {
    const newTrack: Track = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      votes: 0
    };
    party.tracks.push(newTrack);
    saveParty(party);
  }
  return res.status(200).json({ party });
}
