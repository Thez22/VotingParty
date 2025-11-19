import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Set-Cookie", "spotify_access_token=; Path=/; Max-Age=0; SameSite=Lax");
  res.status(200).json({ ok: true });
}
