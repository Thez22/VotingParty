import type { NextApiRequest, NextApiResponse } from "next";

function getRedirectUri(req: NextApiRequest) {
  return (
    process.env.SPOTIFY_REDIRECT_URI ||
    `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}/api/auth/callback`
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).send("Missing code");
  }
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).send("Missing Spotify credentials");
  }
  const redirectUri = getRedirectUri(req);
  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    })
  });
  const data = await tokenResponse.json();
  if (!tokenResponse.ok) {
    return res.status(500).send(data.error || "Failed to authenticate");
  }
  const maxAge = data.expires_in || 3600;
  res.setHeader("Set-Cookie", `spotify_access_token=${data.access_token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`);
  res.redirect("/dj");
}
