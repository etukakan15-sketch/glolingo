import { getGoogleAccessToken } from "../_lib/googleAuth.js";

// Keep this in sync with LANGUAGE_ENGINES in src/App.jsx.
const LANGUAGE_ENGINES = {
  English: { engine: "google", code: "en" },
  Spanish: { engine: "google", code: "es" },
  French: { engine: "google", code: "fr" },
  Mandarin: { engine: "google", code: "zh" },
  Arabic: { engine: "google", code: "ar" },
  Portuguese: { engine: "google", code: "pt" },
  German: { engine: "google", code: "de" },
  Japanese: { engine: "google", code: "ja" },
  Korean: { engine: "google", code: "ko" },
  Turkish: { engine: "google", code: "tr" },
  Russian: { engine: "google", code: "ru" },
  Italian: { engine: "google", code: "it" },
  Dutch: { engine: "google", code: "nl" },
  Polish: { engine: "google", code: "pl" },
  Vietnamese: { engine: "google", code: "vi" },
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
  Afrikaans: { engine: "google", code: "af" },
};

async function translateWithDeepL(text, targetCode, apiKey) {
  const isFreeKey = apiKey.endsWith(":fx");
  const baseUrl = isFreeKey ? "https://api-free.deepl.com" : "https://api.deepl.com";

  const response = await fetch(`${baseUrl}/v2/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [text],
      target_lang: targetCode,
    }),
  });

  const data = await response.json();
  if (data.message) {
    throw new Error(`DeepL error: ${data.message}`);
  }
  return data.translations[0].text;
}

async function translateWithGoogle(text, targetCode, serviceAccountJson) {
  const accessToken = await getGoogleAccessToken(
    serviceAccountJson,
    "https://www.googleapis.com/auth/cloud-translation"
  );

  const response = await fetch("https://translation.googleapis.com/language/translate/v2", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: text,
      target: targetCode,
      format: "text",
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Google Translate error: ${data.error.message}`);
  }
  return data.data.translations[0].translatedText;
}

export async function onRequestPost(context) {
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
