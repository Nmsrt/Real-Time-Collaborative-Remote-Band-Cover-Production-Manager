/**
 * Pull an 11-char YouTube video id out of watch/share/embed/shorts URLs.
 * @param {string} url
 * @returns {string|null}
 */
export function youtubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

/**
 * Look up a YouTube video's title via the public oEmbed endpoint (no API
 * key required). Returns null if the video id can't be resolved or the
 * request fails (private/deleted video, offline, etc).
 * @param {string} url
 * @returns {Promise<string|null>}
 */
export async function fetchYoutubeTitle(url) {
  const id = youtubeId(url);
  if (!id) return null;
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.title || null;
  } catch {
    return null;
  }
}
