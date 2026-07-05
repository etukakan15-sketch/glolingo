// functions/api/transcribe-audio.js
//
// Accepts a short (~6 second) WEBM/Opus audio chunk captured from the user's
// own browser tab (via getDisplayMedia "share tab audio") and transcribes it
// using Google Cloud Speech-to-Text's synchronous recognize endpoint.
//
// This is intentionally NOT trying to intercept the original broadcast feed —
// it transcribes audio the user's own browser is already playing, which they
// explicitly granted permission to capture for this purpose.
//
// Requires a GOOGLE_SPEECH_API_KEY secret. If you already have a Google Cloud
// API key enabled for Speech-to-Text (e.g., the one used elsewhere in this
// project), you can reuse the same value — just make sure "Cloud Speech-to-Text
// API" is enabled on that key's project and, if the key is restricted, that
// Speech-to-Text is included in its allowed API list.
//
// Quota/cost note: Google Cloud Speech-to-Text has a limited free tier
// (60 minutes/month at time of writing), then billed per 15-second increment.
// Continuous live captioning per active viewer adds up fast — worth watching
// usage once this is live with real users.

// Maps the channel's declared spoken language to a Speech-to-Text BCP-47 code.
const LANGUAGE_TO_CODE = {
  English: "en-US",
  French: "fr-FR",
  Arabic: "ar-SA",
  Japanese: "ja-JP",
  Spanish: "es-ES",
  Portuguese: "pt-PT",
  German: "de-DE",
  Mandarin: "zh",
};

export async function onRequestPost({ request, env }) {
  try {
    const { audioBase64, sourceLanguage } = await request.json();

    if (!audioBase64) {
      return Response.json({ error: "No audio received." });
    }

    const apiKey = env.GOOGLE_SPEECH_API_KEY;
    if (!apiKey) {
      return Response.json({
        error: "Live captioning isn't configured yet (missing GOOGLE_SPEECH_API_KEY).",
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
          model: "latest_short",
        },
        audio: { content: audioBase64 },
      }),
    });

    const data = await res.json();

    if (data.error) {
      return Response.json({ error: data.error.message || "Speech-to-Text request failed." });
    }

    const transcript = (data.results || [])
      .map(r => r.alternatives?.[0]?.transcript || "")
      .join(" ")
      .trim();

    return Response.json({ transcript });
  } catch (err) {
    return Response.json({ error: "Something went wrong transcribing that audio chunk." }, { status: 500 });
  }
}
