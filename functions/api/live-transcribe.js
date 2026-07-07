// functions/api/live-transcribe.js
//
// WebSocket relay: browser <-> this Worker <-> Deepgram's real-time streaming API.
//
// Why a relay instead of connecting the browser directly to Deepgram: this
// keeps DEEPGRAM_API_KEY server-side only, same as every other secret in
// this project, instead of exposing it in client-side code.
//
// Requires a DEEPGRAM_API_KEY secret (sign up at deepgram.com — $200 free
// credit, no credit card required to start).
//
// Note: this uses Cloudflare's documented pattern for making an OUTBOUND
// WebSocket connection from a Worker (fetch with an Upgrade header, then
// reading `.webSocket` off the response). This is the standard approach,
// but since it's a newer piece of this stack, worth testing early rather
// than assuming it behaves identically to a browser-to-Deepgram connection.

const LANGUAGE_TO_DEEPGRAM_CODE = {
  English: "en",
  French: "fr",
  Arabic: "ar",
  Japanese: "ja",
  Spanish: "es",
  Portuguese: "pt",
  German: "de",
  Mandarin: "zh",
};

export async function onRequest(context) {
  const { request, env } = context;

  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected a WebSocket connection.", { status: 426 });
  }

  const url = new URL(request.url);
  const sourceLanguage = url.searchParams.get("sourceLanguage") || "English";
  const languageCode = LANGUAGE_TO_DEEPGRAM_CODE[sourceLanguage] || "en";

  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);
  server.accept();

  const apiKey = env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    server.send(JSON.stringify({ error: "Live captioning isn't configured yet (missing DEEPGRAM_API_KEY)." }));
    server.close(1011, "Missing API key");
    return new Response(null, { status: 101, webSocket: client });
  }

  const deepgramUrl =
    `https://api.deepgram.com/v1/listen?model=nova-2&language=${languageCode}` +
    `&punctuate=true&interim_results=true&endpointing=300`;

  let dgResponse;
  try {
    dgResponse = await fetch(deepgramUrl, {
      headers: {
        Upgrade: "websocket",
        Authorization: `Token ${apiKey}`,
      },
    });
  } catch (err) {
    server.send(JSON.stringify({ error: "Couldn't reach the live transcription service." }));
    server.close(1011, "Upstream connection failed");
    return new Response(null, { status: 101, webSocket: client });
  }

  const dgSocket = dgResponse.webSocket;
  if (!dgSocket) {
    server.send(JSON.stringify({ error: "Transcription service rejected the connection. Check the API key." }));
    server.close(1011, "No upstream socket");
    return new Response(null, { status: 101, webSocket: client });
  }
  dgSocket.accept();

  // Browser -> Deepgram: forward raw audio bytes as they arrive.
  server.addEventListener("message", (event) => {
    try {
      dgSocket.send(event.data);
    } catch {
      // Upstream socket may have closed; nothing to do but drop this frame.
    }
  });

  // Deepgram -> browser: normalize to a simple { transcript, is_final } shape.
  dgSocket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      const alt = data.channel?.alternatives?.[0];
      const transcript = alt?.transcript || "";
      if (transcript) {
        server.send(JSON.stringify({ transcript, is_final: !!data.is_final }));
      }
    } catch {
      // Ignore any non-JSON or unexpected message shape from upstream.
    }
  });

  const cleanup = () => {
    try { server.close(); } catch {}
    try { dgSocket.close(); } catch {}
  };
  server.addEventListener("close", cleanup);
  server.addEventListener("error", cleanup);
  dgSocket.addEventListener("close", cleanup);
  dgSocket.addEventListener("error", cleanup);

  return new Response(null, { status: 101, webSocket: client });
}
