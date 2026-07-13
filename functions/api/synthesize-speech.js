// Keep the keys here in sync with LANGUAGE_ENGINES in translate-text.js / src/App.jsx.
// Each entry maps a language name to Google Cloud TTS language + voice names.
// Voice names are Neural2 where available; WaveNet as a fallback for languages
// without a Neural2 voice yet. Add more languages here as you expand coverage.
const VOICE_MAP = {
  English: {
    languageCode: "en-US",
    male: "en-US-Neural2-D",
    female: "en-US-Neural2-F",
  },
  Spanish: {
    languageCode: "es-US",
    male: "es-US-Neural2-B",
    female: "es-US-Neural2-A",
  },
  French: {
    languageCode: "fr-FR",
    male: "fr-FR-Neural2-B",
    female: "fr-FR-Neural2-A",
  },
  German: {
    languageCode: "de-DE",
    male: "de-DE-Neural2-B",
    female: "de-DE-Neural2-A",
  },
  Portuguese: {
    languageCode: "pt-PT",
    male: "pt-PT-Wavenet-B",
    female: "pt-PT-Wavenet-A",
  },
  Italian: {
    languageCode: "it-IT",
    male: "it-IT-Neural2-C",
    female: "it-IT-Neural2-A",
  },
  Japanese: {
    languageCode: "ja-JP",
    male: "ja-JP-Neural2-C",
    female: "ja-JP-Neural2-B",
  },
  Korean: {
    languageCode: "ko-KR",
    male: "ko-KR-Neural2-C",
    female: "ko-KR-Neural2-A",
  },
  Mandarin: {
    languageCode: "cmn-CN",
    male: "cmn-CN-Wavenet-B",
    female: "cmn-CN-Wavenet-A",
  },
  Arabic: {
    languageCode: "ar-XA",
    male: "ar-XA-Wavenet-B",
    female: "ar-XA-Wavenet-A",
  },
  Russian: {
    languageCode: "ru-RU",
    male: "ru-RU-Wavenet-B",
    female: "ru-RU-Wavenet-A",
  },
  Dutch: {
    languageCode: "nl-NL",
    male: "nl-NL-Wavenet-B",
    female: "nl-NL-Wavenet-A",
  },
  Hindi: {
    languageCode: "hi-IN",
    male: "hi-IN-Neural2-B",
    female: "hi-IN-Neural2-A",
  },
};

// YarnGPT covers Nigerian languages Google Cloud TTS does not support at all
// (Yoruba, Igbo, Hausa). These voices were confirmed by manual testing —
// see functions/api/synthesize-speech.js history for details.
const YARNGPT_VOICE_MAP = {
  Yoruba: "Idera",
  Igbo: "Chinenye",
  Hausa: "Umar",
};
// Below this pitch (Hz), treat the detected voice as male; above, female.
// Anything in between falls back to the language's default (male).
const PITCH_MALE_MAX_HZ = 165;
const PITCH_FEMALE_MIN_HZ = 180;

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

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSSML(text, sourcePitchHz) {
  let pitchShift = "0st";
  if (typeof sourcePitchHz === "number") {
    if (sourcePitchHz <= PITCH_MALE_MAX_HZ) pitchShift = "-2st";
    else if (sourcePitchHz >= PITCH_FEMALE_MIN_HZ) pitchShift = "+2st";
  }
  return `<speak><prosody pitch="${pitchShift}">${escapeXml(text)}</prosody></speak>`;
}

// YarnGPT returns raw MP3 bytes directly (not JSON), so we base64-encode
// it ourselves to match the shape our existing Google TTS response uses.
async function synthesizeWithYarnGPT(text, voiceName, apiKey) {
  const response = await fetch("https://yarngpt.ai/api/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, voice: voiceName, response_format: "mp3" }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(`YarnGPT error (${response.status}): ${errBody || "request failed"}`);
  }

  const audioBuffer = await response.arrayBuffer();
  // btoa needs a binary string, not raw bytes — build it in chunks to avoid
  // blowing the call stack on longer audio clips.
  const bytes = new Uint8Array(audioBuffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
export async function onRequestPost(context) {
  try {
    const { text, targetLanguage, sourcePitchHz, sourceGender } = await context.request.json();

    if (!text || !targetLanguage) {
      return Response.json({ error: "Missing text or targetLanguage" }, { status: 400 });
    }

    // Route Nigerian languages Google TTS doesn't support to YarnGPT instead.
if (YARNGPT_VOICE_MAP[targetLanguage]) {
  try {
    const yarnVoice = YARNGPT_VOICE_MAP[targetLanguage];
    const yarnApiKey = context.env.YARNGPT_API_KEY;
    const audioContent = await synthesizeWithYarnGPT(text, yarnVoice, yarnApiKey);
    return Response.json({ audioContent, voiceUsed: yarnVoice });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
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
          audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 },
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      throw new Error(`Google TTS error: ${data.error.message}`);
    }

    // audioContent is base64-encoded MP3 audio, ready to decode client-side.
    return Response.json({ audioContent: data.audioContent, voiceUsed: voice.voiceName });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
