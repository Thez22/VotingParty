export const PARTY_CODE_LENGTH = 6;
export const POLLING_INTERVAL = 2000;

export function generatePartyCode(): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < PARTY_CODE_LENGTH; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function getTopTracks<T extends { votes: number }>(tracks: T[], limit = 3): T[] {
  return [...tracks].sort((a, b) => b.votes - a.votes).slice(0, limit);
}

export function formatTimeLeft(milliseconds: number): string {
  if (milliseconds <= 0) {
    return "00:00";
  }
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}
