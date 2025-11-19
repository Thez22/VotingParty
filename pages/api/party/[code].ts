import type { NextApiRequest, NextApiResponse } from "next";
import { getPartyByCode } from "../../../lib/storage";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Missing party code" });
  }
  const party = getPartyByCode(code.toUpperCase());
  if (!party) {
    return res.status(404).json({ error: "Party not found" });
  }
  return res.status(200).json({ party });
}
