import type { NextApiRequest, NextApiResponse } from "next";

const AUTH_URL = "https://accounts.spotify.com/authorize";

function getRedirectUri(req: NextApiRequest) {
  return (
    process.env.SPOTIFY_REDIRECT_URI ||
    `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}/api/auth/callback`
  );
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: "Missing Spotify client id" });
  }
  const redirectUri = getRedirectUri(req);
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
