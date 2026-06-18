import { useState, useEffect, useRef } from "react";

const COLORS = {
  primary: "#00C896",
  primaryDark: "#00A87A",
  accent: "#FF6B35",
  dark: "#0A0E1A",
  darker: "#060910",
  card: "#111827",
  cardLight: "#1a2235",
  border: "#1e2d45",
  text: "#E8EDF5",
  textMuted: "#7A8BA0",
  gold: "#FFD700",
  red: "#FF4444",
  blue: "#3B82F6",
  purple: "#8B5CF6",
};

const LANGUAGES = ["English","Yoruba","Igbo","Nigerian Pidgin","Ibibio","Kiswahili","Jamaican Patois","Spanish","French","Mandarin","Arabic","Portuguese","German","Japanese","Korean","Hindi","Swahili","Hausa","Amharic","Zulu","Afrikaans","Turkish","Russian","Italian","Dutch","Polish","Bengali","Vietnamese","Thai","Tagalog"];

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "mediahub", label: "Media Hub", icon: "▶" },
  { id: "livetv", label: "Live TV", icon: "📺" },
  { id: "music", label: "Music", icon: "♪" },
  { id: "remote", label: "Remote", icon: "⊞" },
  { id: "meeting", label: "Meeting", icon: "⬡" },
  { id: "cast", label: "Cast to TV", icon: "⟵" },
  { id: "advertiser", label: "Advertiser", icon: "◈" },
  { id: "signup", label: "Sign Up", icon: "✦" },
];

const Btn = ({ onClick, children, style = {}, variant = "primary", small = false }) => {
  const base = {
    border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600,
    fontSize: small ? 13 : 15, transition: "all 0.18s", display: "inline-flex",
    alignItems: "center", gap: 6, padding: small ? "8px 16px" : "12px 24px",
  };
  const variants = {
    primary: { background: COLORS.primary, color: "#000" },
    outline: { background: "transparent", color: COLORS.primary, border: `1.5px solid ${COLORS.primary}` },
    danger: { background: COLORS.red, color: "#fff" },
    ghost: { background: "rgba(255,255,255,0.07)", color: COLORS.text },
    gold: { background: COLORS.gold, color: "#000" },
    accent: { background: COLORS.accent, color: "#fff" },
  };
  return <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "20px 22px", ...style }}>
    {children}
  </div>
);

const Tag = ({ children, color = COLORS.primary }) => (
  <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{children}</span>
);

const Input = ({ placeholder, type = "text", value, onChange, style = {} }) => (
  <input type={type} placeholder={placeholder} value={value} onChange={onChange}
    style={{ width: "100%", background: "#0d1525", border: `1px solid ${COLORS.border}`, borderRadius: 8,
      padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box", ...style }} />
);

const Select = ({ value, onChange, options, style = {} }) => (
  <select value={value} onChange={onChange}
    style={{ width: "100%", background: "#0d1525", border: `1px solid ${COLORS.border}`, borderRadius: 8,
      padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box", ...style }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ─── TV SCREEN ────────────────────────────────────────────────────────────────
const TVScreen = ({ channel, volume, isOn, subtitleLang, secondLang, showSubtitle }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const channels = {
    "CNN": { bg: "#cc0000", content: "Breaking News: World Leaders Gather for AI Summit", lang: "English" },
    "BBC": { bg: "#003087", content: "Technology Review: The Future of Translation Tech", lang: "English" },
    "France 24": { bg: "#f00000", content: "Actualités mondiales — nouvelles du jour", lang: "French" },
    "Al Jazeera": { bg: "#009639", content: "أخبار الشرق الأوسط والعالم", lang: "Arabic" },
    "NTA Nigeria": { bg: "#008751", content: "Naija News: Lagos State Governor Speaks on Economy", lang: "Nigerian Pidgin" },
  };
  const ch = channels[channel] || channels["CNN"];

  return (
    <div style={{ background: "#111", borderRadius: 16, overflow: "hidden", position: "relative", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #222" }}>
      {isOn ? (
        <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${ch.bg}dd 0%, #000 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ background: ch.bg, color: "#fff", fontSize: 13, fontWeight: 800, padding: "3px 10px", borderRadius: 4 }}>{channel}</span>
            <Tag color={COLORS.primary}>● LIVE</Tag>
          </div>
          <div style={{ position: "absolute", top: 12, right: 12, color: COLORS.textMuted, fontSize: 13 }}>
            {time.toLocaleTimeString()} | Vol: {volume}
          </div>
          <div style={{ textAlign: "center", padding: "0 20px" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{ch.content}</div>
            <Tag color={COLORS.gold}>{ch.lang} → {subtitleLang}</Tag>
          </div>
          {showSubtitle && (
            <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center" }}>
              <div style={{ background: "rgba(0,0,0,0.85)", display: "inline-block", padding: "6px 18px", borderRadius: 6, fontSize: 15, color: "#fff", marginBottom: 4 }}>
                [GloLingo AI] — Translation active in {subtitleLang}
              </div>
              {secondLang && (
                <div style={{ background: "rgba(0,200,150,0.15)", display: "inline-block", padding: "4px 14px", borderRadius: 6, fontSize: 13, color: COLORS.primary }}>
                  Dual: {secondLang}
                </div>
              )}
            </div>
          )}
          <div style={{ position: "absolute", bottom: 8, right: 12, color: COLORS.textMuted, fontSize: 11 }}>GloLingo AI Active</div>
        </div>
      ) : (
        <div style={{ color: COLORS.textMuted, fontSize: 16, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>◉</div>TV Off
        </div>
      )}
    </div>
  );
};

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
const HomePage = ({ setPage }) => (
  <div>
    <div style={{ textAlign: "center", padding: "60px 20px 40px" }}>
      <div style={{ fontSize: 13, letterSpacing: 3, color: COLORS.primary, marginBottom: 16, textTransform: "uppercase" }}>AI-Powered Universal Media Translator</div>
      <h1 style={{ fontSize: "clamp(32px,6vw,64px)", fontWeight: 900, color: COLORS.text, margin: "0 0 16px", lineHeight: 1.1 }}>
        Break Every<br /><span style={{ color: COLORS.primary }}>Language Barrier</span>
      </h1>
      <p style={{ fontSize: 18, color: COLORS.textMuted, maxWidth: 560, margin: "0 auto 32px" }}>
        Real-time audio translation, AI voice cloning, smart remote control — for 50+ languages across every screen.
      </p>
      <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <Btn onClick={() => setPage("signup")}>✦ Get Started — Free Trial</Btn>
        <Btn onClick={() => setPage("remote")} variant="outline">Try Remote</Btn>
      </div>
      <p style={{ marginTop: 20, fontSize: 14, color: COLORS.textMuted }}>Over 5,000 creators are already breaking language barriers.</p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, padding: "0 24px 40px" }}>
      {[
        { icon: "⟳", title: "Real-Time Translation", desc: "≤200ms lip-sync accuracy across all sources" },
        { icon: "♪", title: "AI Voice Cloning", desc: "Emotion, pitch & gender matching" },
        { icon: "◉", title: "50+ Languages", desc: "Including Yoruba, Igbo, Pidgin, Kiswahili" },
        { icon: "⊞", title: "Smart Remote", desc: "Control any TV, soundbar, or streaming device" },
        { icon: "⬡", title: "Live Meetings", desc: "Video meetings with live interpretation" },
        { icon: "◈", title: "Dual Subtitles", desc: "Bilingual captions for all content" },
      ].map(f => (
        <Card key={f.title} style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12, color: COLORS.primary }}>{f.icon}</div>
          <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>{f.title}</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted }}>{f.desc}</div>
        </Card>
      ))}
    </div>

    <div style={{ padding: "0 24px 40px" }}>
      <h2 style={{ color: COLORS.text, marginBottom: 20 }}>Revolutionary Features</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        {[
          { title: "Full Audio Replacement", desc: "Original audio completely overwritten — zero leakage. Instant detect → extract → translate → replace pipeline.", color: COLORS.primary },
          { title: "Language Support", desc: "Priority coverage for Nigerian Pidgin, Yoruba, Igbo, Ibibio, Kiswahili, Jamaican Patois plus 44 global languages.", color: COLORS.accent },
          { title: "Offline Mode", desc: "20 core languages available without internet. Never miss a translation anywhere in the world.", color: COLORS.gold },
        ].map(f => (
          <Card key={f.title} style={{ borderLeft: `3px solid ${f.color}` }}>
            <div style={{ fontWeight: 700, color: f.color, marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 14, color: COLORS.textMuted }}>{f.desc}</div>
          </Card>
        ))}
      </div>
    </div>

    <div style={{ padding: "0 24px 60px" }}>
      <h2 style={{ color: COLORS.text, marginBottom: 20 }}>Pricing</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
        {[
          { tier: "Free", price: "$0", features: ["Ads", "20 languages", "720p"], color: COLORS.textMuted },
          { tier: "Pro", price: "$9.99/mo", features: ["Ad-free", "50+ languages", "4K"], color: COLORS.primary, featured: true },
          { tier: "Elite", price: "$29.99/mo", features: ["Custom voice cloning", "VIP support", "API access"], color: COLORS.gold },
        ].map(p => (
          <Card key={p.tier} style={{ textAlign: "center", border: p.featured ? `2px solid ${COLORS.primary}` : undefined }}>
            {p.featured && <div style={{ background: COLORS.primary, color: "#000", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "inline-block", marginBottom: 8 }}>MOST POPULAR</div>}
            <div style={{ fontSize: 22, fontWeight: 800, color: p.color }}>{p.tier}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.text, margin: "8px 0" }}>{p.price}</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>{p.features.join(" · ")}</div>
            <Btn onClick={() => setPage("signup")} variant={p.featured ? "primary" : "outline"} small>Get Started</Btn>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

// ─── MEDIA HUB ────────────────────────────────────────────────────────────────
const MediaHub = ({ setPage }) => {
  const [activeSource, setActiveSource] = useState(null);
  const sources = [
    { id: "livetv", label: "Live TV", icon: "📺", color: COLORS.red, desc: "Global IPTV, CNN, BBC, Al Jazeera, NTA" },
    { id: "music", label: "Music", icon: "♪", color: COLORS.blue, desc: "Spotify, Apple Music, SoundCloud, iHeart" },
    { id: "social", label: "Social Media", icon: "◈", color: COLORS.purple, desc: "TikTok, Facebook Reels, Instagram, YouTube" },
    { id: "upload", label: "Upload Media", icon: "⬆", color: COLORS.gold, desc: "MP4, MP3, AVI — your local content" },
  ];
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: COLORS.text, marginBottom: 6 }}>Media Hub</h2>
      <p style={{ color: COLORS.textMuted, marginBottom: 28 }}>Choose your media source. All content is translated in real-time.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginBottom: 32 }}>
        {sources.map(s => (
          <Card key={s.id} style={{ cursor: "pointer", border: activeSource === s.id ? `2px solid ${s.color}` : undefined }}
            onClick={() => { setActiveSource(s.id); setPage(s.id === "social" || s.id === "upload" ? "mediahub" : s.id); }}>
            <div style={{ fontSize: 36, marginBottom: 10, color: s.color }}>{s.icon}</div>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 14 }}>{s.desc}</div>
            <Btn onClick={() => setPage(s.id === "livetv" ? "livetv" : s.id === "music" ? "music" : "mediahub")} small variant="outline">Open →</Btn>
          </Card>
        ))}
      </div>
      {activeSource === "social" && (
        <Card>
          <h3 style={{ color: COLORS.text, marginTop: 0 }}>Social Media Player</h3>
          <Input placeholder="Paste TikTok, YouTube, Instagram, or Facebook link..." style={{ marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Btn small>▶ Play & Translate</Btn>
            <Btn small variant="outline">⬡ Cast to TV</Btn>
          </div>
        </Card>
      )}
      {activeSource === "upload" && (
        <Card>
          <h3 style={{ color: COLORS.text, marginTop: 0 }}>Upload Local Media</h3>
          <div style={{ border: `2px dashed ${COLORS.border}`, borderRadius: 10, padding: 40, textAlign: "center", color: COLORS.textMuted, marginBottom: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⬆</div>
            <div>Drop MP4, MP3, or AVI files here</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>or click to browse</div>
          </div>
          <Btn small>Upload & Translate</Btn>
        </Card>
      )}
    </div>
  );
};

// ─── LIVE TV ─────────────────────────────────────────────────────────────────
const LiveTV = ({ setPage }) => {
  const [channel, setChannel] = useState("CNN");
  const [volume, setVolume] = useState(50);
  const [isOn, setIsOn] = useState(true);
  const [subtitleLang, setSubtitleLang] = useState("Yoruba");
  const [secondLang, setSecondLang] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(true);
  const channels = ["CNN","BBC","France 24","Al Jazeera","NTA Nigeria","DW","RT","Sky News","Euronews","CGTN"];
  const idx = channels.indexOf(channel);
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: COLORS.text, marginBottom: 6 }}>Live TV</h2>
      <p style={{ color: COLORS.textMuted, marginBottom: 20 }}>Global channels with real-time AI translation. Full audio replacement active.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <div>
          <TVScreen channel={channel} volume={volume} isOn={isOn} subtitleLang={subtitleLang} secondLang={secondLang} showSubtitle={showSubtitle} />
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <Btn small onClick={() => { const ni = (idx - 1 + channels.length) % channels.length; setChannel(channels[ni]); }}>◀ Prev</Btn>
            <Btn small onClick={() => { const ni = (idx + 1) % channels.length; setChannel(channels[ni]); }}>Next ▶</Btn>
            <Btn small variant={isOn ? "danger" : "primary"} onClick={() => setIsOn(!isOn)}>{isOn ? "⊗ Off" : "⊙ On"}</Btn>
            <Btn small variant="outline" onClick={() => setPage("cast")}>⟵ Cast</Btn>
            <Btn small variant="outline" onClick={() => setPage("remote")}>⊞ Remote</Btn>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>Channel Guide</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {channels.map(c => (
                <div key={c} onClick={() => setChannel(c)}
                  style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", background: channel === c ? `${COLORS.primary}22` : "transparent",
                    color: channel === c ? COLORS.primary : COLORS.text, border: channel === c ? `1px solid ${COLORS.primary}44` : "none", fontSize: 14, fontWeight: channel === c ? 700 : 400 }}>
                  {c}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>Translation</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Primary Language</div>
              <Select value={subtitleLang} onChange={e => setSubtitleLang(e.target.value)} options={LANGUAGES.map(l => ({ value: l, label: l }))} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Dual Subtitle (Bilingual)</div>
              <Select value={secondLang} onChange={e => setSecondLang(e.target.value)}
                options={[{ value: "", label: "None" }, ...LANGUAGES.map(l => ({ value: l, label: l }))]} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={showSubtitle} onChange={e => setShowSubtitle(e.target.checked)} id="subs" />
              <label htmlFor="subs" style={{ color: COLORS.text, fontSize: 14, cursor: "pointer" }}>Show subtitles</label>
            </div>
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>Volume — {volume}%</div>
            <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(Number(e.target.value))} style={{ width: "100%" }} />
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── MUSIC ────────────────────────────────────────────────────────────────────
const Music = () => {
  const [playing, setPlaying] = useState(false);
  const [lang, setLang] = useState("Nigerian Pidgin");
  const [karaoke, setKaraoke] = useState(true);
  const [progress, setProgress] = useState(38);
  const tracks = [
    { title: "Essence", artist: "Wizkid ft. Tems", duration: "3:47" },
    { title: "Last Last", artist: "Burna Boy", duration: "3:21" },
    { title: "Calm Down", artist: "Rema", duration: "3:33" },
    { title: "Favorite Song", artist: "Tobi Lou", duration: "2:59" },
    { title: "Hold On", artist: "Justin Bieber", duration: "3:02" },
  ];
  const [track, setTrack] = useState(0);
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: COLORS.text, marginBottom: 6 }}>Music</h2>
      <p style={{ color: COLORS.textMuted, marginBottom: 24 }}>Translate any song in real-time. Karaoke mode syncs lyrics to the beat.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: 12, background: `linear-gradient(135deg,${COLORS.primary},${COLORS.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>♪</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text }}>{tracks[track].title}</div>
                <div style={{ color: COLORS.textMuted, marginBottom: 6 }}>{tracks[track].artist}</div>
                <Tag color={COLORS.primary}>{lang}</Tag>
              </div>
            </div>
            <div style={{ background: COLORS.cardLight, borderRadius: 8, height: 6, marginBottom: 8, overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: COLORS.primary, borderRadius: 8 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>
              <span>1:{String(Math.floor(progress * 2.27)).padStart(2,"0")}</span>
              <span>{tracks[track].duration}</span>
            </div>
            {karaoke && (
              <div style={{ background: "#0d1525", borderRadius: 10, padding: 16, marginBottom: 16, textAlign: "center" }}>
                <div style={{ color: COLORS.primary, fontWeight: 700, fontSize: 16 }}>♫ Karaoke Mode Active</div>
                <div style={{ color: COLORS.text, fontSize: 14, marginTop: 6 }}>[Translated lyrics appear here in sync]</div>
                <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>— in {lang} —</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn small variant="ghost" onClick={() => setTrack(t => (t - 1 + tracks.length) % tracks.length)}>◀◀</Btn>
              <Btn small onClick={() => setPlaying(!playing)}>{playing ? "⏸" : "▶"} {playing ? "Pause" : "Play"}</Btn>
              <Btn small variant="ghost" onClick={() => setTrack(t => (t + 1) % tracks.length)}>▶▶</Btn>
            </div>
          </Card>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Translate To</div>
            <Select value={lang} onChange={e => setLang(e.target.value)} options={LANGUAGES.map(l => ({ value: l, label: l }))} />
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="kar" checked={karaoke} onChange={e => setKaraoke(e.target.checked)} />
              <label htmlFor="kar" style={{ color: COLORS.text, fontSize: 14, cursor: "pointer" }}>Karaoke Mode</label>
            </div>
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Queue</div>
            {tracks.map((t, i) => (
              <div key={i} onClick={() => setTrack(i)} style={{ padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, color: i === track ? COLORS.primary : COLORS.text, fontWeight: i === track ? 700 : 400 }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>{t.artist}</div>
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{t.duration}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── REMOTE CONTROL ───────────────────────────────────────────────────────────
const Remote = () => {
  const [volume, setVolume] = useState(50);
  const [channel, setChannel] = useState(5);
  const [isOn, setIsOn] = useState(true);
  const [input, setInput] = useState("HDMI 1");
  const [paired, setPaired] = useState("Samsung Smart TV");
  const channels = ["CNN","BBC","France 24","Al Jazeera","NTA Nigeria","DW","RT","Sky News","Euronews","CGTN"];
  const BtnR = ({ onClick, children, style = {}, color }) => (
    <button onClick={onClick} style={{ background: color || COLORS.cardLight, border: `1px solid ${COLORS.border}`, color: COLORS.text,
      borderRadius: 10, padding: "12px 16px", cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all 0.15s", width: "100%", ...style }}>
      {children}
    </button>
  );
  return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ color: COLORS.text, marginBottom: 6 }}>Smart Remote</h2>
      <p style={{ color: COLORS.textMuted, marginBottom: 20 }}>Control your TV, soundbar, and streaming devices from here.</p>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
        <div>
          <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Paired Device</div>
              <Tag color={COLORS.primary}>{paired}</Tag>
            </div>
            <BtnR color={isOn ? "#2a1212" : COLORS.cardLight} onClick={() => setIsOn(!isOn)} style={{ color: isOn ? COLORS.red : COLORS.primary }}>
              ⏻ Power {isOn ? "OFF" : "ON"}
            </BtnR>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <BtnR onClick={() => setVolume(v => Math.min(100, v + 5))} style={{ fontSize: 20 }}>+</BtnR>
              <BtnR onClick={() => setVolume(v => Math.max(0, v - 5))} style={{ fontSize: 20 }}>−</BtnR>
            </div>
            <div style={{ textAlign: "center", fontSize: 13, color: COLORS.textMuted }}>Vol: {volume}%</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <BtnR onClick={() => setChannel(c => Math.min(channels.length - 1, c + 1))}>CH ▲</BtnR>
              <BtnR onClick={() => setChannel(c => Math.max(0, c - 1))}>CH ▼</BtnR>
            </div>
            <div style={{ textAlign: "center", fontSize: 13, color: COLORS.textMuted }}>{channels[channel]}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {[1,2,3,4,5,6,7,8,9,"*",0,"#"].map(n => (
                <BtnR key={n} onClick={() => setChannel(typeof n === "number" ? n : channel)} style={{ padding: "10px 0", fontSize: 16 }}>{n}</BtnR>
              ))}
            </div>
            <BtnR style={{ background: `${COLORS.primary}22`, color: COLORS.primary }}>⌂ Home (Glo)</BtnR>
            <Select value={input} onChange={e => setInput(e.target.value)}
              options={["HDMI 1","HDMI 2","AV","USB","Optical"].map(v => ({ value: v, label: v }))} />
          </Card>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>Device Pairing</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Samsung Smart TV","LG OLED TV","Sony Bravia","Sonos Soundbar","Bose Speaker","Fire Stick","Roku","Apple TV"].map(d => (
                <div key={d} onClick={() => setPaired(d)} style={{ padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                  background: paired === d ? `${COLORS.primary}22` : "transparent", color: paired === d ? COLORS.primary : COLORS.text,
                  border: paired === d ? `1px solid ${COLORS.primary}44` : `1px solid ${COLORS.border}`, fontSize: 14 }}>
                  {d} {paired === d && "✓"}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Voice Search</div>
            <Input placeholder="🎙 Say or type: 'Play Yoruba news'..." />
            <Btn small style={{ marginTop: 10 }}>Search</Btn>
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>D-Pad Navigation</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, maxWidth: 180 }}>
              <div /><BtnR>▲</BtnR><div />
              <BtnR>◀</BtnR><BtnR style={{ background: COLORS.primary, color: "#000" }}>OK</BtnR><BtnR>▶</BtnR>
              <div /><BtnR>▼</BtnR><div />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── CAST TO TV ───────────────────────────────────────────────────────────────
const CastTV = () => {
  const [casting, setCasting] = useState(null);
  const devices = ["Samsung TV - Living Room","LG OLED - Bedroom","Chromecast - Kitchen","Fire Stick - Office","Roku - Guest Room"];
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: COLORS.text, marginBottom: 6 }}>Cast to TV</h2>
      <p style={{ color: COLORS.textMuted, marginBottom: 24 }}>Send any media to up to 3 devices simultaneously.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 24 }}>
        {devices.map(d => (
          <Card key={d} style={{ cursor: "pointer" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📺</div>
            <div style={{ fontWeight: 600, color: COLORS.text, marginBottom: 8, fontSize: 14 }}>{d}</div>
            {casting === d ? (
              <Btn small variant="danger" onClick={() => setCasting(null)}>Stop Cast</Btn>
            ) : (
              <Btn small onClick={() => setCasting(d)}>⟵ Cast Here</Btn>
            )}
          </Card>
        ))}
      </div>
      {casting && (
        <Card style={{ border: `2px solid ${COLORS.primary}` }}>
          <div style={{ fontWeight: 700, color: COLORS.primary, marginBottom: 6 }}>Now Casting to: {casting}</div>
          <div style={{ color: COLORS.textMuted, fontSize: 14 }}>Translation active • Audio fully replaced • Subtitles synced</div>
        </Card>
      )}
    </div>
  );
};

// ─── MEETING ─────────────────────────────────────────────────────────────────
const Meeting = () => {
  const [inMeeting, setInMeeting] = useState(false);
  const [myLang, setMyLang] = useState("English");
  const [roomId, setRoomId] = useState("GLO-" + Math.random().toString(36).slice(2,8).toUpperCase());
  const [participants] = useState([
    { name: "Adaeze Obi", lang: "Igbo", video: true },
    { name: "Carlos Ruiz", lang: "Spanish", video: true },
    { name: "Yuki Tanaka", lang: "Japanese", video: false },
  ]);
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: COLORS.text, marginBottom: 6 }}>Live Meeting Room</h2>
      <p style={{ color: COLORS.textMuted, marginBottom: 24 }}>Video meetings with real-time AI interpretation. Everyone hears in their own language.</p>
      {!inMeeting ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
          <Card>
            <h3 style={{ color: COLORS.text, marginTop: 0 }}>Create Meeting</h3>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Your Language</div>
              <Select value={myLang} onChange={e => setMyLang(e.target.value)} options={LANGUAGES.map(l => ({ value: l, label: l }))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>Room ID</div>
              <div style={{ background: "#0d1525", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 16, fontWeight: 700, color: COLORS.primary, letterSpacing: 2 }}>{roomId}</div>
            </div>
            <Btn onClick={() => setInMeeting(true)}>Start Meeting</Btn>
          </Card>
          <Card>
            <h3 style={{ color: COLORS.text, marginTop: 0 }}>Join Meeting</h3>
            <Input placeholder="Enter Room ID..." style={{ marginBottom: 12 }} />
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Your Language</div>
              <Select value={myLang} onChange={e => setMyLang(e.target.value)} options={LANGUAGES.map(l => ({ value: l, label: l }))} />
            </div>
            <Btn onClick={() => setInMeeting(true)}>Join</Btn>
          </Card>
        </div>
      ) : (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 16 }}>
            <div style={{ background: `linear-gradient(135deg,${COLORS.card},${COLORS.cardLight})`, borderRadius: 12, aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", border: `2px solid ${COLORS.primary}` }}>
              <div style={{ fontSize: 32 }}>👤</div>
              <div style={{ color: COLORS.text, fontWeight: 700, marginTop: 6 }}>You</div>
              <Tag color={COLORS.primary}>{myLang}</Tag>
            </div>
            {participants.map(p => (
              <div key={p.name} style={{ background: COLORS.card, borderRadius: 12, aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 32 }}>{p.video ? "🎥" : "👤"}</div>
                <div style={{ color: COLORS.text, fontWeight: 600, marginTop: 6, fontSize: 14 }}>{p.name}</div>
                <Tag color={COLORS.accent}>{p.lang}</Tag>
                <div style={{ fontSize: 11, color: COLORS.primary, marginTop: 4 }}>→ {myLang}</div>
              </div>
            ))}
          </div>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>AI Interpretation Active</div>
            <div style={{ fontSize: 14, color: COLORS.textMuted }}>All participants hear each other in their own language. Real-time translation with ≤200ms delay.</div>
          </Card>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Btn small variant="ghost">🎤 Mute</Btn>
            <Btn small variant="ghost">📷 Video Off</Btn>
            <Btn small variant="ghost">📋 Share Screen</Btn>
            <Btn small variant="danger" onClick={() => setInMeeting(false)}>Leave</Btn>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SIGN UP ─────────────────────────────────────────────────────────────────
const SignUp = ({ setPage }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [useCase, setUseCase] = useState("");
  const [langs, setLangs] = useState([]);
  const [tv, setTv] = useState("");
  const [streaming, setStreaming] = useState([]);
  const [accountType, setAccountType] = useState("free");
  const [companyName, setCompanyName] = useState("");
  const [isCompany, setIsCompany] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [adFree, setAdFree] = useState(false);
  const [payMethod, setPayMethod] = useState("card");

  const topLangs = ["Yoruba","Igbo","Nigerian Pidgin","Kiswahili","Spanish","French","Mandarin","Arabic","Portuguese","Hausa"];
  const useCases = [
    { id: "content", emoji: "🎬", label: "Content Creation" },
    { id: "media", emoji: "📺", label: "Media/Entertainment" },
    { id: "music", emoji: "🎵", label: "Music/Art" },
    { id: "edu", emoji: "🏫", label: "Education" },
    { id: "personal", emoji: "🌐", label: "Personal Use" },
    { id: "company", emoji: "🏢", label: "Company/Business" },
  ];
  const pricingOpts = [
    { id: "free", label: "Free", price: "$0", features: "Ads, 20 languages, 720p" },
    { id: "premium", label: "Premium", price: "$9.99/mo", features: "Ad-free, 50+ languages, 4K" },
    { id: "elite", label: "Elite", price: "$19.99/mo", features: "Voice cloning, API access, VIP support" },
  ];

  if (submitted) return (
    <div style={{ padding: 40, textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✦</div>
      <h2 style={{ color: COLORS.primary, marginBottom: 12 }}>You're in!</h2>
      <p style={{ color: COLORS.text, marginBottom: 8 }}>Check your email to activate your trial.</p>
      <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24 }}>Auto-download link for mobile app sent.</p>
      <Btn onClick={() => setPage("home")}>Go to GloLingo →</Btn>
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 560, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: COLORS.primary, marginBottom: 8 }}>FREE TRIAL</div>
        <h2 style={{ color: COLORS.text, margin: "0 0 6px" }}>Unlock instant translations for 50+ languages!</h2>
        <p style={{ color: COLORS.textMuted, fontSize: 14 }}>No credit card required for Free plan.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
          {[1,2,3,4].map(s => (
            <div key={s} style={{ width: 32, height: 4, borderRadius: 2, background: s <= step ? COLORS.primary : COLORS.border }} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <Card>
          <h3 style={{ color: COLORS.text, marginTop: 0 }}>Create Your Account</h3>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Account Type</div>
            <Select value={accountType} onChange={e => setAccountType(e.target.value)}
              options={pricingOpts.map(p => ({ value: p.id, label: `${p.label} — ${p.price}` }))} />
          </div>
          {(accountType === "premium" || accountType === "elite") && (
            <div style={{ background: `${COLORS.primary}11`, border: `1px solid ${COLORS.primary}33`, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 13, color: COLORS.textMuted }}>
              Payment required for {accountType} plan. Accepts credit card or Bitcoin.
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <input type="checkbox" id="company" checked={isCompany} onChange={e => setIsCompany(e.target.checked)} />
              <label htmlFor="company" style={{ color: COLORS.text, fontSize: 14, cursor: "pointer" }}>Sign up as a Company</label>
            </div>
            {isCompany && <Input placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ marginBottom: 8 }} />}
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Email*</div>
            <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Password*</div>
            <div style={{ position: "relative" }}>
              <Input type={showPass ? "text" : "password"} placeholder="Create password" value={pass} onChange={e => setPass(e.target.value)} />
              <span onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: COLORS.textMuted, fontSize: 13 }}>
                {showPass ? "Hide" : "Show"}
              </span>
            </div>
          </div>
          {accountType !== "free" && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>Payment Method</div>
              <div style={{ display: "flex", gap: 10 }}>
                {["card","bitcoin"].map(m => (
                  <div key={m} onClick={() => setPayMethod(m)} style={{ flex: 1, padding: "10px 14px", borderRadius: 8, cursor: "pointer", textAlign: "center",
                    background: payMethod === m ? `${COLORS.primary}22` : COLORS.cardLight, border: `1px solid ${payMethod === m ? COLORS.primary : COLORS.border}`,
                    color: payMethod === m ? COLORS.primary : COLORS.text, fontSize: 14, fontWeight: 600 }}>
                    {m === "card" ? "💳 Card" : "₿ Bitcoin"}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>Your free trial includes full access to all features.</div>
          <Btn onClick={() => setStep(2)}>Continue →</Btn>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h3 style={{ color: COLORS.text, marginTop: 0 }}>How will you use GloLingo?</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {useCases.map(u => (
              <div key={u.id} onClick={() => setUseCase(u.id)} style={{ padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                background: useCase === u.id ? `${COLORS.primary}22` : COLORS.cardLight,
                border: `1px solid ${useCase === u.id ? COLORS.primary : COLORS.border}`,
                color: useCase === u.id ? COLORS.primary : COLORS.text }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{u.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{u.label}</div>
              </div>
            ))}
          </div>
          {isCompany && useCase === "company" && (
            <Card style={{ marginBottom: 16, border: `1px solid ${COLORS.gold}44` }}>
              <div style={{ fontWeight: 700, color: COLORS.gold, marginBottom: 8 }}>Company Features</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted }}>✓ Upload and manage ads · ✓ API access ($5/1000 translations) · ✓ Analytics dashboard · ✓ Meeting rooms · ✓ Ad-free usage option</div>
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" id="adfree" checked={adFree} onChange={e => setAdFree(e.target.checked)} />
                <label htmlFor="adfree" style={{ color: COLORS.text, fontSize: 14, cursor: "pointer" }}>Ad-free usage (requires payment card)</label>
              </div>
            </Card>
          )}
          <Btn onClick={() => setStep(3)}>Continue →</Btn>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <h3 style={{ color: COLORS.text, marginTop: 0 }}>Which languages matter most to you?</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {topLangs.map(l => (
              <div key={l} onClick={() => setLangs(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])}
                style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13,
                  background: langs.includes(l) ? `${COLORS.primary}22` : COLORS.cardLight,
                  border: `1px solid ${langs.includes(l) ? COLORS.primary : COLORS.border}`,
                  color: langs.includes(l) ? COLORS.primary : COLORS.text }}>
                {langs.includes(l) ? "✓ " : ""}{l}
              </div>
            ))}
          </div>
          <Input placeholder="Other language..." style={{ marginBottom: 16 }} />
          <Btn onClick={() => setStep(4)}>Continue →</Btn>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <h3 style={{ color: COLORS.text, marginTop: 0 }}>Pair GloLingo with your TV? (Optional)</h3>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Smart TV Brand</div>
            <Select value={tv} onChange={e => setTv(e.target.value)}
              options={[{ value: "", label: "Select brand" }, ...["Samsung","LG","Sony","Hisense","TCL","Vizio","Philips"].map(v => ({ value: v, label: v }))]} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>Streaming Devices</div>
            {["Fire Stick","Roku","Apple TV","Chromecast","Android TV"].map(d => (
              <div key={d} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <input type="checkbox" id={d} checked={streaming.includes(d)} onChange={e => setStreaming(prev => e.target.checked ? [...prev, d] : prev.filter(x => x !== d))} />
                <label htmlFor={d} style={{ color: COLORS.text, fontSize: 14, cursor: "pointer" }}>{d}</label>
              </div>
            ))}
          </div>
          <div style={{ background: `${COLORS.primary}11`, borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 14, color: COLORS.textMuted }}>
            Over 5,000 creators are already breaking language barriers. Ready to join them?
          </div>
          <Btn onClick={() => setSubmitted(true)}>✦ Start Free Trial</Btn>
        </Card>
      )}
    </div>
  );
};

// ─── ADVERTISER PORTAL ────────────────────────────────────────────────────────
const Advertiser = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [adType, setAdType] = useState("video");
  const [submitted, setSubmitted] = useState(false);
  const ads = [
    { name: "Afrobeats Summer Campaign", impressions: 84200, completion: 72, cpm: 4.50, spend: "$420", status: "Active" },
    { name: "Yoruba Language Special", impressions: 33100, completion: 89, cpm: 5.20, spend: "$180", status: "Active" },
    { name: "Lagos Tech Promo", impressions: 12400, completion: 61, cpm: 3.80, spend: "$90", status: "Paused" },
  ];
  if (!loggedIn) return (
    <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h2 style={{ color: COLORS.text, marginBottom: 6 }}>Advertiser Login</h2>
      <p style={{ color: COLORS.textMuted, marginBottom: 24 }}>Upload, manage, and track your campaigns.</p>
      <Card>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Company Email</div>
          <Input type="email" placeholder="ads@company.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Password</div>
          <Input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} />
        </div>
        <Btn onClick={() => setLoggedIn(true)}>Sign In</Btn>
        <div style={{ marginTop: 12, fontSize: 13, color: COLORS.textMuted }}>New advertiser? <span style={{ color: COLORS.primary, cursor: "pointer" }}>Create account</span></div>
      </Card>
    </div>
  );
  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{ background: tab === id ? COLORS.primary : "transparent", color: tab === id ? "#000" : COLORS.textMuted,
      border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>{label}</button>
  );
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ color: COLORS.text, margin: 0 }}>Advertiser Portal</h2>
          <div style={{ color: COLORS.textMuted, fontSize: 14 }}>Acme Corp — Wallet: $340.00</div>
        </div>
        <Btn small variant="ghost" onClick={() => setLoggedIn(false)}>Sign Out</Btn>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, background: COLORS.card, borderRadius: 10, padding: 6, flexWrap: "wrap" }}>
        {[["dashboard","Dashboard"],["upload","Upload Ad"],["reports","Reports"],["wallet","Wallet"]].map(([id, label]) => (
          <TabBtn key={id} id={id} label={label} />
        ))}
      </div>
      {tab === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
            {[["Total Impressions","129,700",COLORS.primary],["Avg Completion","74%",COLORS.blue],["Total Spend","$690",COLORS.gold],["Wallet Balance","$340",COLORS.accent]].map(([l,v,c]) => (
              <Card key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: c }}>{v}</div>
              </Card>
            ))}
          </div>
          <h3 style={{ color: COLORS.text, marginBottom: 12 }}>Active Campaigns</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ads.map(ad => (
              <Card key={ad.name}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: COLORS.text }}>{ad.name}</div>
                    <div style={{ fontSize: 13, color: COLORS.textMuted }}>{ad.impressions.toLocaleString()} impressions · {ad.completion}% completion · CPM ${ad.cpm}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Tag color={ad.status === "Active" ? COLORS.primary : COLORS.textMuted}>{ad.status}</Tag>
                    <div style={{ fontWeight: 700, color: COLORS.gold }}>{ad.spend}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      {tab === "upload" && (
        <Card>
          {submitted ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 10, color: COLORS.primary }}>✓</div>
              <div style={{ fontWeight: 700, color: COLORS.text }}>Ad submitted for review!</div>
              <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 6 }}>You'll be notified once approved.</div>
              <Btn small style={{ marginTop: 16 }} onClick={() => { setSubmitted(false); setTab("dashboard"); }}>Back to Dashboard</Btn>
            </div>
          ) : (
            <div>
              <h3 style={{ color: COLORS.text, marginTop: 0 }}>Submit New Ad</h3>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Ad Type</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["video","audio","banner"].map(t => (
                    <div key={t} onClick={() => setAdType(t)} style={{ flex: 1, padding: "10px 0", textAlign: "center", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
                      background: adType === t ? `${COLORS.primary}22` : COLORS.cardLight, border: `1px solid ${adType === t ? COLORS.primary : COLORS.border}`,
                      color: adType === t ? COLORS.primary : COLORS.text, textTransform: "capitalize" }}>{t}</div>
                  ))}
                </div>
              </div>
              <div style={{ border: `2px dashed ${COLORS.border}`, borderRadius: 10, padding: 32, textAlign: "center", color: COLORS.textMuted, marginBottom: 14 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>⬆</div>
                <div>Upload {adType === "video" ? "15s or 30s video" : adType === "audio" ? "5s or 10s audio" : "static or animated banner"}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Target Languages</div>
                  <Select value="" onChange={() => {}} options={LANGUAGES.map(l => ({ value: l, label: l }))} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Target Region</div>
                  <Select value="" onChange={() => {}} options={["Global","Nigeria","USA","UK","Ghana","Kenya","Canada"].map(r => ({ value: r, label: r }))} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Max Daily Spend</div>
                  <Input placeholder="$50.00" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>CPM Bid</div>
                  <Input placeholder="$4.50" />
                </div>
              </div>
              <Btn onClick={() => setSubmitted(true)}>Submit for Review</Btn>
            </div>
          )}
        </Card>
      )}
      {tab === "reports" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ color: COLORS.text, marginTop: 0 }}>Weekly Performance Report</h3>
            {ads.map(ad => (
              <div key={ad.name} style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 12, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{ad.name}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <div style={{ fontSize: 13 }}><div style={{ color: COLORS.textMuted, fontSize: 11 }}>Impressions</div><div style={{ color: COLORS.text }}>{ad.impressions.toLocaleString()}</div></div>
                  <div style={{ fontSize: 13 }}><div style={{ color: COLORS.textMuted, fontSize: 11 }}>Completion</div><div style={{ color: COLORS.text }}>{ad.completion}%</div></div>
                  <div style={{ fontSize: 13 }}><div style={{ color: COLORS.textMuted, fontSize: 11 }}>Spend</div><div style={{ color: COLORS.gold }}>{ad.spend}</div></div>
                </div>
              </div>
            ))}
            <Btn small variant="outline">⬇ Download CSV</Btn>
          </Card>
        </div>
      )}
      {tab === "wallet" && (
        <Card>
          <h3 style={{ color: COLORS.text, marginTop: 0 }}>Wallet</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ background: COLORS.cardLight, borderRadius: 10, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>Balance</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.primary }}>$340.00</div>
            </div>
            <div style={{ background: COLORS.cardLight, borderRadius: 10, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>Total Spent</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.gold }}>$690.00</div>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Top Up Amount (min $100)</div>
            <Input placeholder="$100.00" style={{ marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <Btn small>💳 Pay by Card</Btn>
              <Btn small variant="outline">₿ Pay with Bitcoin</Btn>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
const AdminDashboard = ({ setPage }) => {
  const [pass, setPass] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState("overview");
  if (!loggedIn) return (
    <div style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
      <h2 style={{ color: COLORS.text, marginBottom: 6 }}>Admin Access</h2>
      <p style={{ color: COLORS.textMuted, marginBottom: 20 }}>Restricted to authorized administrators.</p>
      <Card>
        <Input type="password" placeholder="Admin password" value={pass} onChange={e => setPass(e.target.value)} style={{ marginBottom: 16 }} />
        <Btn onClick={() => setLoggedIn(true)}>Sign In</Btn>
        <div style={{ marginTop: 12, fontSize: 13, color: COLORS.textMuted }}>Owner? <span style={{ color: COLORS.primary, cursor: "pointer" }} onClick={() => setPage("owner")}>Go to Owner Portal</span></div>
      </Card>
    </div>
  );
  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{ background: tab === id ? COLORS.primary : "transparent", color: tab === id ? "#000" : COLORS.textMuted,
      border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>{label}</button>
  );
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div><h2 style={{ color: COLORS.text, margin: 0 }}>Admin Dashboard</h2><div style={{ color: COLORS.textMuted, fontSize: 14 }}>GloLingo Admin Panel</div></div>
        <Btn small variant="ghost" onClick={() => setLoggedIn(false)}>Sign Out</Btn>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, background: COLORS.card, borderRadius: 10, padding: 6, flexWrap: "wrap" }}>
        {[["overview","Overview"],["moderation","Moderation"],["ads","Ad Management"],["copyright","Copyright"]].map(([id, label]) => (
          <TabBtn key={id} id={id} label={label} />
        ))}
      </div>
      {tab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
            {[["Active Users","12,480",COLORS.primary],["Daily Streams","8,920",COLORS.blue],["Violations","3",COLORS.red],["Ad Revenue","$2,340",COLORS.gold]].map(([l,v,c]) => (
              <Card key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
              </Card>
            ))}
          </div>
          <h3 style={{ color: COLORS.text }}>Recent Activity</h3>
          {["User report: inappropriate content on Channel 34","Copyright claim filed for stream #8821","New advertiser onboarded: Lagos Records","System update completed v2.4.1"].map((a, i) => (
            <Card key={i} style={{ marginBottom: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 14, color: COLORS.text }}>{a}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>{i + 1}h ago</div>
            </Card>
          ))}
        </div>
      )}
      {tab === "moderation" && (
        <div>
          <h3 style={{ color: COLORS.text }}>Flagged Content</h3>
          {[["@user_xyz","Profanity in Yoruba stream","Pending"],["Channel 88","Misinformation flagged","Under Review"],["Stream #4421","Hate speech report","Resolved"]].map(([u,r,s]) => (
            <Card key={u} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div><div style={{ fontWeight: 700, color: COLORS.text }}>{u}</div><div style={{ fontSize: 13, color: COLORS.textMuted }}>{r}</div></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Tag color={s === "Resolved" ? COLORS.primary : s === "Pending" ? COLORS.red : COLORS.gold}>{s}</Tag>
                  <Btn small variant="danger">Blacklist</Btn>
                  <Btn small variant="outline">Dismiss</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {tab === "ads" && (
        <div>
          <h3 style={{ color: COLORS.text }}>Pending Ad Approvals</h3>
          {[["Afrobeats Summer Campaign","Video 30s","$500 budget"],["Tech Startup Promo","Banner","$200 budget"],["Language App Cross-Promo","Audio 15s","$150 budget"]].map(([n,t,b]) => (
            <Card key={n} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div><div style={{ fontWeight: 700, color: COLORS.text }}>{n}</div><div style={{ fontSize: 13, color: COLORS.textMuted }}>{t} · {b}</div></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn small>Approve</Btn>
                  <Btn small variant="danger">Reject</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {tab === "copyright" && (
        <div>
          <h3 style={{ color: COLORS.text }}>Copyright Claims</h3>
          {[["Stream #8821","Sony Music vs NTA stream","Open"],["Stream #7440","Universal Music claim","Resolved"]].map(([id,desc,status]) => (
            <Card key={id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div><div style={{ fontWeight: 700, color: COLORS.text }}>{id}</div><div style={{ fontSize: 13, color: COLORS.textMuted }}>{desc}</div></div>
                <Tag color={status === "Open" ? COLORS.red : COLORS.primary}>{status}</Tag>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── OWNER PORTAL ─────────────────────────────────────────────────────────────
const OwnerPortal = () => {
  const [loggedIn, setLoggedIn] = useState(true); // accessible without password now
  const [tab, setTab] = useState("analytics");
  const [pass, setPass] = useState("");
  const [settingPw, setSettingPw] = useState(false);
  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{ background: tab === id ? COLORS.gold : "transparent", color: tab === id ? "#000" : COLORS.textMuted,
      border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>{label}</button>
  );
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ color: COLORS.gold, margin: 0 }}>Owner Portal</h2>
          <div style={{ color: COLORS.textMuted, fontSize: 14 }}>Full system control · COPPA/GDPR Compliant</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn small variant="ghost" onClick={() => setSettingPw(!settingPw)}>Set Password</Btn>
        </div>
      </div>
      {settingPw && (
        <Card style={{ marginBottom: 20, border: `1px solid ${COLORS.gold}44` }}>
          <div style={{ fontWeight: 700, color: COLORS.gold, marginBottom: 10 }}>Set Owner Password</div>
          <Input type="password" placeholder="New password" value={pass} onChange={e => setPass(e.target.value)} style={{ marginBottom: 10 }} />
          <Btn small onClick={() => { setSettingPw(false); }}>Save Password</Btn>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 8 }}>Once set, this password will be required to access the Owner Portal.</div>
        </Card>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, background: COLORS.card, borderRadius: 10, padding: 6, flexWrap: "wrap" }}>
        {[["analytics","Analytics"],["revenue","Revenue"],["admins","Admins"],["ads","Ad Performance"],["api","API Keys"],["system","System"]].map(([id, label]) => (
          <TabBtn key={id} id={id} label={label} />
        ))}
      </div>
      {tab === "analytics" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
            {[["Total Users","48,200",COLORS.primary],["Monthly Revenue","$94,500",COLORS.gold],["Active Subscriptions","12,300",COLORS.blue],["Platform Uptime","99.8%",COLORS.accent]].map(([l,v,c]) => (
              <Card key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
              </Card>
            ))}
          </div>
          <h3 style={{ color: COLORS.text }}>User Analytics</h3>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Top Languages Used</div>
            {[["Nigerian Pidgin",34],["Yoruba",28],["Spanish",18],["French",12],["Igbo",8]].map(([l,p]) => (
              <div key={l} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: COLORS.text }}>{l}</span><span style={{ color: COLORS.textMuted }}>{p}%</span>
                </div>
                <div style={{ background: COLORS.cardLight, borderRadius: 4, height: 6 }}>
                  <div style={{ width: `${p}%`, height: "100%", background: COLORS.primary, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Device Breakdown</div>
            {[["Mobile",52,COLORS.primary],["Smart TV",28,COLORS.blue],["Desktop",14,COLORS.gold],["Tablet",6,COLORS.accent]].map(([d,p,c]) => (
              <div key={d} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.text }}>{d}</span><span style={{ color: c, fontWeight: 700 }}>{p}%</span>
              </div>
            ))}
          </Card>
        </div>
      )}
      {tab === "revenue" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
            {[["Subscription Revenue","$72,000",COLORS.primary],["Ad Revenue","$18,400",COLORS.gold],["API Revenue","$4,100",COLORS.blue],["Platform Fee (30%)","$5,520",COLORS.accent]].map(([l,v,c]) => (
              <Card key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
              </Card>
            ))}
          </div>
          <Card>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>Ad Earnings Breakdown</div>
            {[["Afrobeats Summer Campaign","$420","72%","4.50"],["Yoruba Language Special","$180","89%","5.20"],["Lagos Tech Promo","$90","61%","3.80"]].map(([n,e,c,cpm]) => (
              <div key={n} style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>{n}</div>
                <div style={{ display: "flex", gap: 16, fontSize: 13, color: COLORS.textMuted }}>
                  <span>Earnings: <span style={{ color: COLORS.gold }}>{e}</span></span>
                  <span>Completion: {c}</span>
                  <span>CPM: ${cpm}</span>
                </div>
              </div>
            ))}
            <Btn small variant="outline">Request Withdrawal</Btn>
          </Card>
        </div>
      )}
      {tab === "admins" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: COLORS.text, margin: 0 }}>Admin Management</h3>
            <Btn small>+ Add Admin</Btn>
          </div>
          {[["Sarah K.","super_admin","Active",COLORS.primary],["Marcus L.","moderator","Active",COLORS.blue],["Aisha T.","ad_manager","Inactive",COLORS.textMuted]].map(([n,r,s,c]) => (
            <Card key={n} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div><div style={{ fontWeight: 700, color: COLORS.text }}>{n}</div><div style={{ fontSize: 13, color: COLORS.textMuted }}>{r}</div></div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Tag color={c}>{s}</Tag>
                  <Btn small variant="outline">Edit</Btn>
                  <Btn small variant="danger">Remove</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {tab === "ads" && (
        <div>
          <h3 style={{ color: COLORS.text }}>Ad Performance Dashboard</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
            {[["Total Impressions","129,700"],["Platform Revenue","$5,520"],["Active Ads","3"],["Pending Approval","2"]].map(([l,v]) => (
              <Card key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.gold }}>{v}</div>
              </Card>
            ))}
          </div>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Top Ads by CTR</div>
            {[["Yoruba Language Special","4.2% CTR",COLORS.primary],["Afrobeats Summer Campaign","3.8% CTR",COLORS.blue],["Lagos Tech Promo","2.1% CTR",COLORS.textMuted]].map(([n,c,color],i) => (
              <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? `1px solid ${COLORS.border}` : "none" }}>
                <span style={{ color: COLORS.text, fontSize: 14 }}>#{i+1} {n}</span>
                <span style={{ color, fontWeight: 700 }}>{c}</span>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Owner Controls</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Btn small>Set Floor CPM</Btn>
              <Btn small variant="outline">Approve Pending</Btn>
              <Btn small variant="danger">Pause Underperforming</Btn>
            </div>
          </Card>
        </div>
      )}
      {tab === "api" && (
        <div>
          <h3 style={{ color: COLORS.text }}>API Key Management</h3>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Translation API — $5/1000 calls</div>
            {[["DeepL Integration","glolingo_dl_***8a2f","Active"],["Google Cloud TTS","glolingo_gc_***3b9e","Active"],["Partner Access","glolingo_pa_***4x1c","Inactive"]].map(([n,k,s]) => (
              <div key={n} style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div><div style={{ fontWeight: 600, color: COLORS.text }}>{n}</div><div style={{ fontFamily: "monospace", fontSize: 12, color: COLORS.textMuted }}>{k}</div></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Tag color={s === "Active" ? COLORS.primary : COLORS.textMuted}>{s}</Tag>
                    <Btn small variant="danger">Revoke</Btn>
                  </div>
                </div>
              </div>
            ))}
            <Btn small>+ Generate New Key</Btn>
          </Card>
        </div>
      )}
      {tab === "system" && (
        <div>
          <h3 style={{ color: COLORS.text }}>System Controls</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
            {[["Server Status","All systems operational",COLORS.primary,"online"],["Translation Stack","Google Cloud + DeepL",COLORS.blue,"active"],["Offline Mode","20 languages cached",COLORS.gold,"ready"],["GDPR/COPPA","Compliant",COLORS.accent,"verified"]].map(([t,d,c,s]) => (
              <Card key={t}>
                <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{t}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>{d}</div>
                <Tag color={c}>{s}</Tag>
              </Card>
            ))}
          </div>
          <Card style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>System Actions</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Btn small>Force App Update</Btn>
              <Btn small variant="outline">Clear Cache</Btn>
              <Btn small variant="ghost">Export Logs</Btn>
              <Btn small variant="danger">Maintenance Mode</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function GloLingo() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const pages = {
    home: <HomePage setPage={setPage} />,
    mediahub: <MediaHub setPage={setPage} />,
    livetv: <LiveTV setPage={setPage} />,
    music: <Music />,
    remote: <Remote />,
    meeting: <Meeting />,
    cast: <CastTV />,
    advertiser: <Advertiser />,
    signup: <SignUp setPage={setPage} />,
    admin: <AdminDashboard setPage={setPage} />,
    owner: <OwnerPortal />,
  };

  const currentNav = NAV_ITEMS.find(n => n.id === page);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.darker, color: COLORS.text, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Navbar */}
      <div style={{ background: COLORS.dark, borderBottom: `1px solid ${COLORS.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", height: 60, gap: 16 }}>
          <div onClick={() => setPage("home")} style={{ fontWeight: 900, fontSize: 22, color: COLORS.primary, cursor: "pointer", letterSpacing: -0.5, flexShrink: 0 }}>
            Glo<span style={{ color: COLORS.text }}>Lingo</span>
          </div>
          {/* Desktop nav */}
          <div style={{ display: "flex", gap: 4, flex: 1, overflowX: "auto", scrollbarWidth: "none" }}>
            {NAV_ITEMS.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)}
                style={{ background: page === n.id ? `${COLORS.primary}22` : "transparent", color: page === n.id ? COLORS.primary : COLORS.textMuted,
                  border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}>
                {n.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Btn small variant="ghost" onClick={() => setPage("admin")}>Admin</Btn>
            <Btn small variant="ghost" onClick={() => setPage("owner")} style={{ color: COLORS.gold }}>Owner</Btn>
            <Btn small onClick={() => setPage("signup")}>Sign Up</Btn>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {pages[page] || pages["home"]}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "20px 24px", textAlign: "center", color: COLORS.textMuted, fontSize: 13, marginTop: 20 }}>
        GloLingo © 2025 · <span style={{ color: COLORS.primary, cursor: "pointer" }} onClick={() => setPage("owner")}>Owner Portal</span> · <span style={{ color: COLORS.textMuted, cursor: "pointer" }} onClick={() => setPage("admin")}>Admin</span> · <span style={{ cursor: "pointer", color: COLORS.textMuted }} onClick={() => setPage("advertiser")}>Advertiser Login</span>
      </div>
    </div>
  );
}
