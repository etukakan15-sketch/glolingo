var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/create-checkout-session.js
async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { plan, email } = body;
    const priceIds = {
      premium: context.env.VITE_STRIPE_PRO_PRICE_ID,
      elite: context.env.VITE_STRIPE_ELITE_PRICE_ID
    };
    const priceId = priceIds[plan];
    if (!priceId) {
      return Response.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }
    const params = new URLSearchParams({
      "payment_method_types[]": "card",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      mode: "subscription",
      success_url: `https://glolingoapp.pages.dev/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "https://glolingoapp.pages.dev/signup",
      customer_email: email
    });
    const response = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
      }
    );
    const session = await response.json();
    if (session.error) {
      return Response.json(
        { error: session.error.message },
        { status: 400 }
      );
    }
    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
__name(onRequestPost, "onRequestPost");

// api/live-video-id.js
var CACHE_TTL_MS = 5 * 60 * 1e3;
var cache = /* @__PURE__ */ new Map();
async function fetchLiveVideoId(channelId, apiKey) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&maxResults=1&key=${apiKey}`
  );
  const data = await res.json();
  const item = data.items && data.items[0];
  if (!item) return null;
  return item.id.videoId;
}
__name(fetchLiveVideoId, "fetchLiveVideoId");
async function onRequestGet({ request, env }) {
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
__name(onRequestGet, "onRequestGet");

// api/synthesize-speech.js
var VOICE_MAP = {
  English: {
    languageCode: "en-US",
    male: "en-US-Neural2-D",
    female: "en-US-Neural2-F"
  },
  Spanish: {
    languageCode: "es-US",
    male: "es-US-Neural2-B",
    female: "es-US-Neural2-A"
  },
  French: {
    languageCode: "fr-FR",
    male: "fr-FR-Neural2-B",
    female: "fr-FR-Neural2-A"
  },
  German: {
    languageCode: "de-DE",
    male: "de-DE-Neural2-B",
    female: "de-DE-Neural2-A"
  },
  Portuguese: {
    languageCode: "pt-PT",
    male: "pt-PT-Wavenet-B",
    female: "pt-PT-Wavenet-A"
  },
  Italian: {
    languageCode: "it-IT",
    male: "it-IT-Neural2-C",
    female: "it-IT-Neural2-A"
  },
  Japanese: {
    languageCode: "ja-JP",
    male: "ja-JP-Neural2-C",
    female: "ja-JP-Neural2-B"
  },
  Korean: {
    languageCode: "ko-KR",
    male: "ko-KR-Neural2-C",
    female: "ko-KR-Neural2-A"
  },
  Mandarin: {
    languageCode: "cmn-CN",
    male: "cmn-CN-Wavenet-B",
    female: "cmn-CN-Wavenet-A"
  },
  Arabic: {
    languageCode: "ar-XA",
    male: "ar-XA-Wavenet-B",
    female: "ar-XA-Wavenet-A"
  },
  Russian: {
    languageCode: "ru-RU",
    male: "ru-RU-Wavenet-B",
    female: "ru-RU-Wavenet-A"
  },
  Dutch: {
    languageCode: "nl-NL",
    male: "nl-NL-Wavenet-B",
    female: "nl-NL-Wavenet-A"
  },
  Hindi: {
    languageCode: "hi-IN",
    male: "hi-IN-Neural2-B",
    female: "hi-IN-Neural2-A"
  }
};
var PITCH_MALE_MAX_HZ = 165;
var PITCH_FEMALE_MIN_HZ = 180;
function pickVoice(targetLanguage, sourceGender, sourcePitchHz) {
  const entry = VOICE_MAP[targetLanguage];
  if (!entry) return null;
  let gender = sourceGender;
  if (!gender && typeof sourcePitchHz === "number") {
    if (sourcePitchHz <= PITCH_MALE_MAX_HZ) gender = "male";
    else if (sourcePitchHz >= PITCH_FEMALE_MIN_HZ) gender = "female";
  }
  const voiceName = gender === "female" ? entry.female : entry.male;
  return { languageCode: entry.languageCode, voiceName };
}
__name(pickVoice, "pickVoice");
function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
__name(escapeXml, "escapeXml");
function buildSSML(text, sourcePitchHz) {
  let pitchShift = "0st";
  if (typeof sourcePitchHz === "number") {
    if (sourcePitchHz <= PITCH_MALE_MAX_HZ) pitchShift = "-2st";
    else if (sourcePitchHz >= PITCH_FEMALE_MIN_HZ) pitchShift = "+2st";
  }
  return `<speak><prosody pitch="${pitchShift}">${escapeXml(text)}</prosody></speak>`;
}
__name(buildSSML, "buildSSML");
async function onRequestPost2(context) {
  try {
    const { text, targetLanguage, sourcePitchHz, sourceGender } = await context.request.json();
    if (!text || !targetLanguage) {
      return Response.json({ error: "Missing text or targetLanguage" }, { status: 400 });
    }
    const voice = pickVoice(targetLanguage, sourceGender, sourcePitchHz);
    if (!voice) {
      return Response.json(
        { error: `"${targetLanguage}" is not currently supported for speech synthesis.` },
        { status: 400 }
      );
    }
    const ssml = buildSSML(text, sourcePitchHz);
    const apiKey = context.env.GOOGLE_TTS_API_KEY;
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { ssml },
          voice: { languageCode: voice.languageCode, name: voice.voiceName },
          audioConfig: { audioEncoding: "MP3", speakingRate: 1 }
        })
      }
    );
    const data = await response.json();
    if (data.error) {
      throw new Error(`Google TTS error: ${data.error.message}`);
    }
    return Response.json({ audioContent: data.audioContent, voiceUsed: voice.voiceName });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
__name(onRequestPost2, "onRequestPost");

// api/transcribe-audio.js
var LANGUAGE_TO_CODE = {
  English: "en-US",
  French: "fr-FR",
  Arabic: "ar-SA",
  Japanese: "ja-JP",
  Spanish: "es-ES",
  Portuguese: "pt-PT",
  German: "de-DE",
  Mandarin: "zh"
};
async function onRequestPost3({ request, env }) {
  try {
    const { audioBase64, sourceLanguage } = await request.json();
    if (!audioBase64) {
      return Response.json({ error: "No audio received." });
    }
    const apiKey = env.GOOGLE_SPEECH_API_KEY;
    if (!apiKey) {
      return Response.json({
        error: "Live captioning isn't configured yet (missing GOOGLE_SPEECH_API_KEY)."
      });
    }
    const languageCode = LANGUAGE_TO_CODE[sourceLanguage] || "en-US";
    const res = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config: {
          encoding: "WEBM_OPUS",
          languageCode,
          enableAutomaticPunctuation: true,
          model: "latest_short"
        },
        audio: { content: audioBase64 }
      })
    });
    const data = await res.json();
    if (data.error) {
      return Response.json({ error: data.error.message || "Speech-to-Text request failed." });
    }
    const transcript = (data.results || []).map((r) => r.alternatives?.[0]?.transcript || "").join(" ").trim();
    return Response.json({ transcript });
  } catch (err) {
    return Response.json({ error: "Something went wrong transcribing that audio chunk." }, { status: 500 });
  }
}
__name(onRequestPost3, "onRequestPost");

// _lib/googleAuth.js
function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(base64UrlEncode, "base64UrlEncode");
function arrayBufferToBase64Url(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(arrayBufferToBase64Url, "arrayBufferToBase64Url");
async function importPrivateKey(pem) {
  const pemContents = pem.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace(/\s/g, "");
  const binaryDer = atob(pemContents);
  const bytes = new Uint8Array(binaryDer.length);
  for (let i = 0; i < binaryDer.length; i++) {
    bytes[i] = binaryDer.charCodeAt(i);
  }
  return crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}
__name(importPrivateKey, "importPrivateKey");
async function getGoogleAccessToken(serviceAccountJsonString, scope) {
  const credentials = JSON.parse(serviceAccountJsonString);
  const now = Math.floor(Date.now() / 1e3);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: credentials.client_email,
    scope,
    aud: credentials.token_uri,
    exp: now + 3600,
    iat: now
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const unsignedJwt = `${encodedHeader}.${encodedClaimSet}`;
  const key = await importPrivateKey(credentials.private_key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedJwt)
  );
  const signedJwt = `${unsignedJwt}.${arrayBufferToBase64Url(signature)}`;
  const tokenResponse = await fetch(credentials.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt
    })
  });
  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    throw new Error(`Google auth failed: ${tokenData.error_description || tokenData.error}`);
  }
  return tokenData.access_token;
}
__name(getGoogleAccessToken, "getGoogleAccessToken");

// api/translate-text.js
var LANGUAGE_ENGINES = {
  English: { engine: "deepl", code: "EN" },
  Spanish: { engine: "deepl", code: "ES" },
  French: { engine: "deepl", code: "FR" },
  Mandarin: { engine: "deepl", code: "ZH" },
  Arabic: { engine: "deepl", code: "AR" },
  Portuguese: { engine: "deepl", code: "PT-PT" },
  German: { engine: "deepl", code: "DE" },
  Japanese: { engine: "deepl", code: "JA" },
  Korean: { engine: "deepl", code: "KO" },
  Turkish: { engine: "deepl", code: "TR" },
  Russian: { engine: "deepl", code: "RU" },
  Italian: { engine: "deepl", code: "IT" },
  Dutch: { engine: "deepl", code: "NL" },
  Polish: { engine: "deepl", code: "PL" },
  Vietnamese: { engine: "deepl", code: "VI" },
  Hindi: { engine: "google", code: "hi" },
  Bengali: { engine: "google", code: "bn" },
  Thai: { engine: "google", code: "th" },
  Tagalog: { engine: "google", code: "tl" },
  Yoruba: { engine: "google", code: "yo" },
  Igbo: { engine: "google", code: "ig" },
  Kiswahili: { engine: "google", code: "sw" },
  Hausa: { engine: "google", code: "ha" },
  Amharic: { engine: "google", code: "am" },
  Zulu: { engine: "google", code: "zu" },
  Afrikaans: { engine: "google", code: "af" }
};
async function translateWithDeepL(text, targetCode, apiKey) {
  const isFreeKey = apiKey.endsWith(":fx");
  const baseUrl = isFreeKey ? "https://api-free.deepl.com" : "https://api.deepl.com";
  const response = await fetch(`${baseUrl}/v2/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: [text],
      target_lang: targetCode
    })
  });
  const data = await response.json();
  if (data.message) {
    throw new Error(`DeepL error: ${data.message}`);
  }
  return data.translations[0].text;
}
__name(translateWithDeepL, "translateWithDeepL");
async function translateWithGoogle(text, targetCode, serviceAccountJson) {
  const accessToken = await getGoogleAccessToken(
    serviceAccountJson,
    "https://www.googleapis.com/auth/cloud-translation"
  );
  const response = await fetch("https://translation.googleapis.com/language/translate/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      q: text,
      target: targetCode,
      format: "text"
    })
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(`Google Translate error: ${data.error.message}`);
  }
  return data.data.translations[0].translatedText;
}
__name(translateWithGoogle, "translateWithGoogle");
async function onRequestPost4(context) {
  try {
    const { text, targetLanguage } = await context.request.json();
    if (!text || !targetLanguage) {
      return Response.json({ error: "Missing text or targetLanguage" }, { status: 400 });
    }
    const target = LANGUAGE_ENGINES[targetLanguage];
    if (!target) {
      return Response.json(
        { error: `"${targetLanguage}" is not currently supported for translation.` },
        { status: 400 }
      );
    }
    let translatedText;
    if (target.engine === "deepl") {
      translatedText = await translateWithDeepL(text, target.code, context.env.DEEPL_API_KEY);
    } else {
      translatedText = await translateWithGoogle(text, target.code, context.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    }
    return Response.json({ translatedText, engine: target.engine });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
__name(onRequestPost4, "onRequestPost");

// api/verify-channel.js
var UC_ID_RE = /^UC[0-9A-Za-z_-]{22}$/;
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
  }
  if (input.startsWith("@")) return { type: "handle", value: input.slice(1) };
  return { type: "search", value: input };
}
__name(parseInput, "parseInput");
async function resolveChannel(parsed, apiKey) {
  const base = "https://www.googleapis.com/youtube/v3";
  if (parsed.type === "id") {
    const res2 = await fetch(`${base}/channels?part=snippet&id=${parsed.value}&key=${apiKey}`);
    const data2 = await res2.json();
    const item2 = data2.items && data2.items[0];
    if (!item2) return null;
    return { channelId: item2.id, channelName: item2.snippet.title, thumbnail: item2.snippet.thumbnails?.default?.url };
  }
  if (parsed.type === "handle") {
    const res2 = await fetch(`${base}/channels?part=snippet&forHandle=${encodeURIComponent(parsed.value)}&key=${apiKey}`);
    const data2 = await res2.json();
    const item2 = data2.items && data2.items[0];
    if (!item2) return null;
    return { channelId: item2.id, channelName: item2.snippet.title, thumbnail: item2.snippet.thumbnails?.default?.url };
  }
  const res = await fetch(`${base}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(parsed.value)}&key=${apiKey}`);
  const data = await res.json();
  const item = data.items && data.items[0];
  if (!item) return null;
  return { channelId: item.snippet.channelId, channelName: item.snippet.channelTitle, thumbnail: item.snippet.thumbnails?.default?.url };
}
__name(resolveChannel, "resolveChannel");
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
__name(findLiveVideoAndEmbeddability, "findLiveVideoAndEmbeddability");
async function onRequestPost5({ request, env }) {
  try {
    const { input } = await request.json();
    if (!input || typeof input !== "string") {
      return Response.json({ ok: false, message: "Please enter a channel link, handle, or ID." });
    }
    const apiKey = env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return Response.json({
        ok: false,
        message: "Channel verification isn't configured yet. Try the manual preview instead once this is set up."
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
      message = "This channel is live right now and allows embedding \u2014 it should play in GloLingo.";
    } else if (embeddable === false) {
      message = "This channel is live right now but has disabled embedding \u2014 it will NOT play in GloLingo.";
    } else {
      message = "This channel isn't currently live, so we can't pre-check embeddability. Use the preview below \u2014 if it plays, it'll keep working once they're live; if you see an error, it likely won't.";
    }
    return Response.json({
      ok: true,
      channelId: channel.channelId,
      channelName: channel.channelName,
      thumbnail: channel.thumbnail,
      liveVideoId,
      embeddable,
      message
    });
  } catch (err) {
    return Response.json({ ok: false, message: "Something went wrong verifying that channel. Please try again." }, { status: 500 });
  }
}
__name(onRequestPost5, "onRequestPost");

// api/verify-session.js
async function onRequestGet2(context) {
  try {
    const url = new URL(context.request.url);
    const sessionId = url.searchParams.get("session_id");
    if (!sessionId) {
      return Response.json({ error: "Missing session_id" }, { status: 400 });
    }
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=line_items`,
      {
        headers: {
          Authorization: `Bearer ${context.env.STRIPE_SECRET_KEY}`
        }
      }
    );
    const session = await response.json();
    if (session.error) {
      return Response.json({ error: session.error.message }, { status: 400 });
    }
    if (session.payment_status !== "paid") {
      return Response.json(
        { error: "Payment not completed for this session." },
        { status: 400 }
      );
    }
    const priceId = session.line_items?.data?.[0]?.price?.id;
    const priceMap = {
      [context.env.VITE_STRIPE_PRO_PRICE_ID]: "premium",
      [context.env.VITE_STRIPE_ELITE_PRICE_ID]: "elite"
    };
    const plan = priceMap[priceId];
    if (!plan) {
      return Response.json(
        { error: "Could not determine plan for this session." },
        { status: 400 }
      );
    }
    const email = session.customer_details?.email || session.customer_email || null;
    return Response.json({
      verified: true,
      plan,
      email
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
__name(onRequestGet2, "onRequestGet");

// api/live-transcribe.js
var LANGUAGE_TO_DEEPGRAM_CODE = {
  English: "en",
  French: "fr",
  Arabic: "ar",
  Japanese: "ja",
  Spanish: "es",
  Portuguese: "pt",
  German: "de",
  Mandarin: "zh"
};
async function onRequest(context) {
  const { request, env } = context;
  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected a WebSocket connection.", { status: 426 });
  }
  const url = new URL(request.url);
  const sourceLanguage = url.searchParams.get("sourceLanguage") || "English";
  const languageCode = LANGUAGE_TO_DEEPGRAM_CODE[sourceLanguage] || "en";
  const multiLang = url.searchParams.get("multiLang") === "true";
  const effectiveLanguageCode = multiLang ? "multi" : languageCode;
  const endpointingMs = multiLang ? 100 : 300;
  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);
  server.binaryType = "arraybuffer";
  server.accept();
  const apiKey = env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    server.send(JSON.stringify({ error: "Live captioning isn't configured yet (missing DEEPGRAM_API_KEY)." }));
    server.close(1011, "Missing API key");
    return new Response(null, { status: 101, webSocket: client });
  }
  const deepgramUrl = `https://api.deepgram.com/v1/listen?model=nova-2&language=${effectiveLanguageCode}&punctuate=true&interim_results=true&endpointing=${endpointingMs}`;
  let dgResponse;
  try {
    dgResponse = await fetch(deepgramUrl, {
      headers: {
        Upgrade: "websocket",
        Authorization: `Token ${apiKey}`
      }
    });
  } catch (err) {
    server.send(JSON.stringify({ error: "Couldn't reach the live transcription service." }));
    server.close(1011, "Upstream connection failed");
    return new Response(null, { status: 101, webSocket: client });
  }
  const dgSocket = dgResponse.webSocket;
  if (!dgSocket) {
    let bodyText = "";
    try {
      bodyText = await dgResponse.text();
    } catch {
    }
    console.log("Deepgram handshake rejected:", dgResponse.status, dgResponse.statusText, bodyText);
    server.send(JSON.stringify({
      error: `Transcription service rejected the connection (HTTP ${dgResponse.status}): ${bodyText || dgResponse.statusText}`
    }));
    server.close(1011, "No upstream socket");
    return new Response(null, { status: 101, webSocket: client });
  }
  dgSocket.accept();
  let loggedFirstChunk = false;
  server.addEventListener("message", (event) => {
    try {
      if (!loggedFirstChunk) {
        console.log(
          "First client->relay message type:",
          typeof event.data,
          event.data instanceof ArrayBuffer ? `ArrayBuffer(${event.data.byteLength} bytes)` : ""
        );
        loggedFirstChunk = true;
      }
      if (typeof event.data === "string") {
        console.log("Dropped unexpected text frame from client:", event.data.slice(0, 200));
        return;
      }
      const bytes = event.data instanceof ArrayBuffer ? new Uint8Array(event.data) : event.data;
      dgSocket.send(bytes);
    } catch (err) {
      console.log("Error forwarding audio to Deepgram:", err.message);
    }
  });
  dgSocket.addEventListener("message", (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (err) {
      console.log("Deepgram sent non-JSON message:", event.data);
      return;
    }
    if (data.type === "Error" || data.error) {
      console.log("Deepgram error frame:", JSON.stringify(data));
      try {
        server.send(JSON.stringify({
          error: `Deepgram error: ${data.description || data.error || data.message || JSON.stringify(data)}`
        }));
      } catch {
      }
      return;
    }
    const alt = data.channel?.alternatives?.[0];
    const transcript = alt?.transcript || "";
    if (transcript) {
      server.send(JSON.stringify({ transcript, is_final: !!data.is_final }));
    } else if (data.type && data.type !== "Results") {
      console.log("Deepgram message (no transcript):", JSON.stringify(data).slice(0, 500));
    }
  });
  const cleanup = /* @__PURE__ */ __name((label) => (event) => {
    console.log(`${label} closed/errored:`, event?.code, event?.reason || event?.message || "");
    try {
      server.close();
    } catch {
    }
    try {
      dgSocket.close();
    } catch {
    }
  }, "cleanup");
  server.addEventListener("close", cleanup("client socket"));
  server.addEventListener("error", cleanup("client socket"));
  dgSocket.addEventListener("close", cleanup("deepgram socket"));
  dgSocket.addEventListener("error", cleanup("deepgram socket"));
  return new Response(null, { status: 101, webSocket: client });
}
__name(onRequest, "onRequest");

// ../.wrangler/tmp/pages-zvFvE8/functionsRoutes-0.8464708864006113.mjs
var routes = [
  {
    routePath: "/api/create-checkout-session",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/live-video-id",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/synthesize-speech",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/transcribe-audio",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/translate-text",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/verify-channel",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/verify-session",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/live-transcribe",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  }
];

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-EeaAmv/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-EeaAmv/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.0999992001558564.mjs.map
