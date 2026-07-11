import { onRequestPost as __api_create_checkout_session_js_onRequestPost } from "C:\\Users\\Polyphonic\\OneDrive\\Desktop\\glolingo-main\\glolingo-main\\functions\\api\\create-checkout-session.js"
import { onRequestGet as __api_live_video_id_js_onRequestGet } from "C:\\Users\\Polyphonic\\OneDrive\\Desktop\\glolingo-main\\glolingo-main\\functions\\api\\live-video-id.js"
import { onRequestPost as __api_synthesize_speech_js_onRequestPost } from "C:\\Users\\Polyphonic\\OneDrive\\Desktop\\glolingo-main\\glolingo-main\\functions\\api\\synthesize-speech.js"
import { onRequestPost as __api_transcribe_audio_js_onRequestPost } from "C:\\Users\\Polyphonic\\OneDrive\\Desktop\\glolingo-main\\glolingo-main\\functions\\api\\transcribe-audio.js"
import { onRequestPost as __api_translate_text_js_onRequestPost } from "C:\\Users\\Polyphonic\\OneDrive\\Desktop\\glolingo-main\\glolingo-main\\functions\\api\\translate-text.js"
import { onRequestPost as __api_verify_channel_js_onRequestPost } from "C:\\Users\\Polyphonic\\OneDrive\\Desktop\\glolingo-main\\glolingo-main\\functions\\api\\verify-channel.js"
import { onRequestGet as __api_verify_session_js_onRequestGet } from "C:\\Users\\Polyphonic\\OneDrive\\Desktop\\glolingo-main\\glolingo-main\\functions\\api\\verify-session.js"
import { onRequest as __api_live_transcribe_js_onRequest } from "C:\\Users\\Polyphonic\\OneDrive\\Desktop\\glolingo-main\\glolingo-main\\functions\\api\\live-transcribe.js"

export const routes = [
    {
      routePath: "/api/create-checkout-session",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_create_checkout_session_js_onRequestPost],
    },
  {
      routePath: "/api/live-video-id",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_live_video_id_js_onRequestGet],
    },
  {
      routePath: "/api/synthesize-speech",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_synthesize_speech_js_onRequestPost],
    },
  {
      routePath: "/api/transcribe-audio",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_transcribe_audio_js_onRequestPost],
    },
  {
      routePath: "/api/translate-text",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_translate_text_js_onRequestPost],
    },
  {
      routePath: "/api/verify-channel",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_verify_channel_js_onRequestPost],
    },
  {
      routePath: "/api/verify-session",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_verify_session_js_onRequestGet],
    },
  {
      routePath: "/api/live-transcribe",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_live_transcribe_js_onRequest],
    },
  ]