import type { NextApiRequest, NextApiResponse } from "next";
import { createSpotifyPlaylist, fetchSpotifyProfile } from "../../lib/spotify";
import { generatePartyCode } from "../../lib/utils";
import { Party, saveParty } from "../../lib/storage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { accessToken, partyName } = req.body || {};
    if (!accessToken) {
      return res.status(400).json({ error: "Missing access token" });
    }
    const profile = await fetchSpotifyProfile(accessToken);
    const playlist = await createSpotifyPlaylist(accessToken, profile.id, partyName);
    const party: Party = {
      partyCode: generatePartyCode(),
      playlistId: playlist.id,
      roundEnd: 0,
      tracks: []
    };
    saveParty(party);
    return res.status(200).json({ party });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Failed to create party" });
  }
}
