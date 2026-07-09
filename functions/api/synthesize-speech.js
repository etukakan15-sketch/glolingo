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

export async function onRequestPost(context) {
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
