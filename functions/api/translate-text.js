import { getGoogleAccessToken } from "../_lib/googleAuth.js";

// Keep this in sync with LANGUAGE_ENGINES in src/App.jsx.
const LANGUAGE_ENGINES = {
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
