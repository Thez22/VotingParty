import type { NextApiRequest, NextApiResponse } from "next";
import { getPartyByCode } from "../../lib/storage";
import { getTopTracks } from "../../lib/utils";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { partyCode } = req.query;
  if (!partyCode || typeof partyCode !== "string") {
    return res.status(400).json({ error: "Missing party code" });
  }
  const party = getPartyByCode(partyCode.toUpperCase());
  if (!party) {
    return res.status(404).json({ error: "Party not found" });
  }
  const topTracks = getTopTracks(party.tracks);
  return res.status(200).json({ topTracks });
}
