import type { NextApiRequest, NextApiResponse } from "next";
import { resolveSpotifyRedirectUri } from "../../../lib/redirect";

const AUTH_URL = "https://accounts.spotify.com/authorize";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: "Missing Spotify client id" });
  }
  const redirectUri = resolveSpotifyRedirectUri(req);
  const scope = "playlist-modify-private playlist-modify-public";
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope,
    state: Math.random().toString(36).slice(2)
  });
  res.redirect(`${AUTH_URL}?${params.toString()}`);
}
