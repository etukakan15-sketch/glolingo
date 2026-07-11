// functions/api/live-video-id.js
//
// Resolves a YouTube channel ID to its currently live video ID, so the
// frontend can load a real video into the YouTube IFrame Player API
// (which only accepts video IDs, not channel IDs).
//
// Uses a simple in-memory cache (best-effort — Workers may recycle
// isolates, so this isn't a hard guarantee, but it meaningfully reduces
// redundant search.list calls, which cost 100 quota units each against
// a 10,000/day free quota).

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map(); // channelId -> { videoId, expiresAt }

async function fetchLiveVideoId(channelId, apiKey) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&maxResults=1&key=${apiKey}`
  );
  const data = await res.json();
  const item = data.items && data.items[0];
  if (!item) return null;
  return item.id.videoId;
}

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const channelId = url.searchParams.get("channelId");

    if (!channelId) {
      return Response.json({ error: "Missing channelId" }, { status: 400 });
    }

    const apiKey = env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "YouTube lookup isn't configured yet." }, { status: 500 });
    }

    const cached = cache.get(channelId);
    if (cached && cached.expiresAt > Date.now()) {
      return Response.json({ videoId: cached.videoId, cached: true });
    }

    const videoId = await fetchLiveVideoId(channelId, apiKey);
    if (!videoId) {
      return Response.json({ videoId: null, message: "Channel isn't live right now." });
    }

    cache.set(channelId, { videoId, expiresAt: Date.now() + CACHE_TTL_MS });
    return Response.json({ videoId, cached: false });
  } catch (err) {
    return Response.json({ error: "Something went wrong looking up the live video." }, { status: 500 });
  }
}