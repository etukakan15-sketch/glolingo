// functions/api/verify-channel.js
//
// Resolves a user-submitted YouTube channel link/handle/ID to a real channel,
// and — only when that channel happens to be live at the moment of checking —
// verifies whether YouTube will actually allow it to be embedded, using the
// "embeddable" flag from the YouTube Data API's videos.status resource.
//
// Requires a YOUTUBE_API_KEY secret (enable "YouTube Data API v3" on the same
// Google Cloud project you already use for Translation/Speech-to-Text, then
// add the key as a Cloudflare Pages secret: YOUTUBE_API_KEY).
//
// Quota note: channels.list and videos.list cost 1 unit each; search.list
// (used to find a channel's current live video) costs 100 units. The free
// daily quota is 10,000 units — roughly 90-100 "is this channel live right
// now" checks per day. If you outgrow that, cache resolved channelIds so
// repeat checks by the same user don't re-run the expensive search call.

const UC_ID_RE = /^UC[0-9A-Za-z_-]{22}$/;

function parseInput(raw) {
  const input = raw.trim();
  if (UC_ID_RE.test(input)) return { type: "id", value: input };

  try {
    const url = new URL(input.startsWith("http") ? input : `https://${input}`);
    const path = url.pathname;

    const channelMatch = path.match(/\/channel\/(UC[0-9A-Za-z_-]{22})/);
    if (channelMatch) return { type: "id", value: channelMatch[1] };

    const handleMatch = path.match(/\/@([^/?]+)/);
    if (handleMatch) return { type: "handle", value: handleMatch[1] };

    const legacyMatch = path.match(/\/(?:c|user)\/([^/?]+)/);
    if (legacyMatch) return { type: "search", value: legacyMatch[1] };
  } catch {
    // Not a URL — fall through to handle/search below.
  }

  if (input.startsWith("@")) return { type: "handle", value: input.slice(1) };
  return { type: "search", value: input };
}

async function resolveChannel(parsed, apiKey) {
  const base = "https://www.googleapis.com/youtube/v3";

  if (parsed.type === "id") {
    const res = await fetch(`${base}/channels?part=snippet&id=${parsed.value}&key=${apiKey}`);
    const data = await res.json();
    const item = data.items && data.items[0];
    if (!item) return null;
    return { channelId: item.id, channelName: item.snippet.title, thumbnail: item.snippet.thumbnails?.default?.url };
  }

  if (parsed.type === "handle") {
    const res = await fetch(`${base}/channels?part=snippet&forHandle=${encodeURIComponent(parsed.value)}&key=${apiKey}`);
    const data = await res.json();
    const item = data.items && data.items[0];
    if (!item) return null;
    return { channelId: item.id, channelName: item.snippet.title, thumbnail: item.snippet.thumbnails?.default?.url };
  }

  // Fallback: search by name (costs 100 units)
  const res = await fetch(`${base}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(parsed.value)}&key=${apiKey}`);
  const data = await res.json();
  const item = data.items && data.items[0];
  if (!item) return null;
  return { channelId: item.snippet.channelId, channelName: item.snippet.channelTitle, thumbnail: item.snippet.thumbnails?.default?.url };
}

async function findLiveVideoAndEmbeddability(channelId, apiKey) {
  const base = "https://www.googleapis.com/youtube/v3";

  const liveRes = await fetch(
    `${base}/search?part=snippet&channelId=${channelId}&eventType=live&type=video&maxResults=1&key=${apiKey}`
  );
  const liveData = await liveRes.json();
  const liveItem = liveData.items && liveData.items[0];
  if (!liveItem) return { liveVideoId: null, embeddable: "unknown" };

  const videoId = liveItem.id.videoId;
  const statusRes = await fetch(`${base}/videos?part=status&id=${videoId}&key=${apiKey}`);
  const statusData = await statusRes.json();
  const statusItem = statusData.items && statusData.items[0];
  if (!statusItem) return { liveVideoId: videoId, embeddable: "unknown" };

  return { liveVideoId: videoId, embeddable: !!statusItem.status.embeddable };
}

export async function onRequestPost({ request, env }) {
  try {
    const { input } = await request.json();
    if (!input || typeof input !== "string") {
      return Response.json({ ok: false, message: "Please enter a channel link, handle, or ID." });
    }

    const apiKey = env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return Response.json({
        ok: false,
        message: "Channel verification isn't configured yet. Try the manual preview instead once this is set up.",
      });
    }

    const parsed = parseInput(input);
    const channel = await resolveChannel(parsed, apiKey);
    if (!channel) {
      return Response.json({ ok: false, message: "Couldn't find a channel matching that link, handle, or ID." });
    }

    const { liveVideoId, embeddable } = await findLiveVideoAndEmbeddability(channel.channelId, apiKey);

    let message;
    if (embeddable === true) {
      message = "This channel is live right now and allows embedding — it should play in GloLingo.";
    } else if (embeddable === false) {
      message = "This channel is live right now but has disabled embedding — it will NOT play in GloLingo.";
    } else {
      message = "This channel isn't currently live, so we can't pre-check embeddability. Use the preview below — if it plays, it'll keep working once they're live; if you see an error, it likely won't.";
    }

    return Response.json({
      ok: true,
      channelId: channel.channelId,
      channelName: channel.channelName,
      thumbnail: channel.thumbnail,
      liveVideoId,
      embeddable,
      message,
    });
  } catch (err) {
    return Response.json({ ok: false, message: "Something went wrong verifying that channel. Please try again." }, { status: 500 });
  }
}
