export function buildAvatarSeed(username: string): string {
  const colors = ["#0ea5e9", "#22d3ee", "#fb923c", "#38bdf8", "#14b8a6"];
  let hash = 0;

  for (let i = 0; i < username.length; i += 1) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}
