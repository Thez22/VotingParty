import type { NextApiRequest } from "next";

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function resolveSpotifyRedirectUri(req: NextApiRequest) {
  if (process.env.SPOTIFY_REDIRECT_URI) {
    return process.env.SPOTIFY_REDIRECT_URI;
  }
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return `${normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL)}/api/auth/callback`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${normalizeBaseUrl(process.env.VERCEL_URL)}/api/auth/callback`;
  }
  const forwardedProtoHeader = req.headers["x-forwarded-proto"];
  const forwardedProto = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : forwardedProtoHeader;
  const host = req.headers.host || "localhost:3000";
  const protocol = forwardedProto || (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}/api/auth/callback`;
}
