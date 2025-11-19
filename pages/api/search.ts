import type { NextApiRequest, NextApiResponse } from "next";
import { getSearchToken, searchSpotifyTracks } from "../../lib/spotify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { query, accessToken } = req.body || {};
    if (!query) {
      return res.status(400).json({ error: "Missing query" });
    }
    const token = await getSearchToken(accessToken);
    const data = await searchSpotifyTracks(token, query);
    const tracks = (data.tracks?.items || []).map((item: any) => ({
      id: item.id,
      title: item.name,
      artist: item.artists.map((artist: any) => artist.name).join(", "),
      albumArt: item.album?.images?.[1]?.url || item.album?.images?.[0]?.url || "",
      votes: 0
    }));
    return res.status(200).json({ tracks });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Search failed" });
  }
}
