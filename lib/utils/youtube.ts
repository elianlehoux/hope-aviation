/**
 * Extracts the 11-character YouTube video ID from various URL formats
 * (watch?v=..., youtu.be/..., embed/..., etc.) or returns the string if it's already an ID.
 */
export function getYoutubeId(urlOrId?: string | null): string | null {
  if (!urlOrId) return null;

  // If it's already a 11-char ID and not a URL
  if (urlOrId.length === 11 && !urlOrId.includes("/") && !urlOrId.includes(".")) {
    return urlOrId;
  }

  // Common YouTube URL regex
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = urlOrId.match(regex);

  return match ? match[1] : null;
}

export function isValidYoutubeRef(value?: string | null): boolean {
  return Boolean(getYoutubeId(value));
}
