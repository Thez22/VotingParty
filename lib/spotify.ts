const SPOTIFY_API = "https://api.spotify.com/v1";

async function handleResponse(response: Response, context: string) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${context} failed: ${response.status} ${text}`);
  }
  return response.json();
}

export async function fetchSpotifyProfile(accessToken: string) {
  const response = await fetch(`${SPOTIFY_API}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return handleResponse(response, "Fetching profile");
}

export async function createSpotifyPlaylist(
  accessToken: string,
  userId: string,
  name: string
) {
  const body = {
    name: name || "Voting Party Playlist",
    description: "Voting Party collaborative playlist",
    public: false
  };
  const response = await fetch(`${SPOTIFY_API}/users/${userId}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  return handleResponse(response, "Creating playlist");
}

export async function searchSpotifyTracks(accessToken: string, query: string) {
  const params = new URLSearchParams({ q: query, type: "track", limit: "10" });
  const response = await fetch(`${SPOTIFY_API}/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return handleResponse(response, "Searching tracks");
}

export async function addTracksToSpotifyPlaylist(
  accessToken: string,
  playlistId: string,
  trackIds: string[]
) {
  const uris = trackIds.map((id) => (id.startsWith("spotify:track:") ? id : `spotify:track:${id}`));
  const response = await fetch(`${SPOTIFY_API}/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ uris })
  });
  return handleResponse(response, "Adding tracks to playlist");
}

async function requestClientCredentialsToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify credentials");
  }
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
    },
    body: new URLSearchParams({ grant_type: "client_credentials" })
  });
  const data = await handleResponse(response, "Client credentials");
  return data.access_token;
}

export async function getSearchToken(accessToken?: string): Promise<string> {
  if (accessToken) {
    return accessToken;
  }
  return requestClientCredentialsToken();
}
