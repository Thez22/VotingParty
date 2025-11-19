import type { NextApiRequest, NextApiResponse } from "next";
import { addTracksToSpotifyPlaylist } from "../../lib/spotify";
import { getPartyByCode } from "../../lib/storage";
import { getTopTracks } from "../../lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { partyCode, accessToken } = req.body || {};
    if (!partyCode || !accessToken) {
      return res.status(400).json({ error: "Missing data" });
    }
    const party = getPartyByCode(partyCode.toUpperCase());
    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }
    const topTracks = getTopTracks(party.tracks);
    if (!topTracks.length) {
      return res.status(400).json({ error: "No tracks to add" });
    }
    await addTracksToSpotifyPlaylist(accessToken, party.playlistId, topTracks.map((track) => track.id));
    return res.status(200).json({ added: topTracks.length });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Failed to add tracks" });
  }
}
