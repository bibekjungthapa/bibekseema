import songAsset from "@/assets/music.mp3";
import { createFileRoute } from "@tanstack/react-router";
import photo1 from "@/assets/photo1.jpg";
import photo2 from "@/assets/photo2.jpg";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { WEDDING_START, downloadIcs, googleCalendarUrl } from "@/lib/wedding-event";

// Plain imports (jpg, mp3) are URL strings; asset.json imports are { url } objects. This handles both.
const src = (p: string | { url: string }) => (typeof p === "string" ? p : p.url);

const SITE_URL = "https://bibekwedsseema.digital"; // <- your real domain, no trailing slash
const TITLE = "Bibek & Seema — Wedding Invitation · Dec 3, 2026";
const DESC =
  "You're invited to the wedding of Bibek Thapa and Seema Poudel, Thursday December 3, 2026, 10 AM at Ramalaya, Basbari.";
const SHORT_TITLE = "Bibek & Seema — Wedding Invitation";
const SHORT_DESC = "Thursday, December 3, 2026 · 10 AM · Ramalaya, Basbari";
const OG_IMAGE = `${SITE_URL}/photo1.jpg`; // put a 1200x630 image at public/og-image.jpg
const OG_ALT = "Bibek and Seema wedding invitation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index, follow" },

      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL + "/" },
      { property: "og:title", content: SHORT_TITLE },
      { property: "og:description", content: SHORT_DESC },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: OG_ALT },

      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SHORT_TITLE },
      { name: "twitter:description", content: SHORT_DESC },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:image:alt", content: OG_ALT },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: "Wedding of Bibek Thapa and Seema Poudel",
          description: DESC,
          startDate: "2026-12-03T10:00:00+05:45",
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          image: [OG_IMAGE],
          url: SITE_URL + "/",
          location: {
            "@type": "Place",
            name: "Ramalaya",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Basbari, Kathmandu",
              addressCountry: "NP",
            },
          },
        }),
      },
    ],
  }),
  component: Index,
});

const WEDDING = WEDDING_START.getTime();
const MAP_Q = "Ramalaya Basbari Nepal";

function Flower({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className} style={style}>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse
          key={r}
          cx="50"
          cy="28"
          rx="17"
          ry="25"
          transform={`rotate(${r} 50 50)`}
          fill="var(--envelope)"
          stroke="var(--seal)"
          strokeWidth="1.5"
          opacity=".92"
        />
      ))}
      {[36, 108, 180, 252, 324].map((r) => (
        <ellipse
          key={r}
          cx="50"
          cy="34"
          rx="11"
          ry="17"
          transform={`rotate(${r} 50 50)`}
          fill="var(--seal)"
          opacity=".55"
        />
      ))}
      <circle cx="50" cy="50" r="9" fill="var(--gold)" />
    </svg>
  );
}

function Garland({ x, len, delay }: { x: string; len: number; delay: string }) {
  return (
    <div
      aria-hidden
      className="animate-sway absolute top-0 flex flex-col items-center"
      style={{ left: x, animationDelay: delay, transformOrigin: "50% 0" }}
    >
      <span className="h-3 w-px bg-gold" />
      {Array.from({ length: len }).map((_, i) => (
        <Flower key={i} className="-my-1 w-7" />
      ))}
    </div>
  );
}

// onStart is called synchronously inside the tap so browsers allow audio
function Envelope({ onOpen, onStart }: { onOpen: () => void; onStart: () => void }) {
  const [stage, setStage] = useState(0);
  const open = () => {
    if (stage) return;
    onStart();
    setStage(1);
    setTimeout(() => setStage(2), 1400);
    setTimeout(onOpen, 2400);
  };
  const curtain = (side: "l" | "r") =>
    stage ? { animation: `curtain-${side} 1.4s cubic-bezier(.6,0,.2,1) forwards` } : undefined;
  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-velvet transition-opacity duration-1000 ${stage === 2 ? "opacity-0" : ""}`}
    >
      {/* stage glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3 bg-[radial-gradient(ellipse_at_50%_100%,color-mix(in_oklab,var(--gold)_35%,transparent),transparent_70%)]"
      />
      {/* side curtains */}
      <div
        aria-hidden
        className="bg-curtain absolute inset-y-0 left-0 w-[16%] rounded-br-[60%] shadow-2xl"
        style={curtain("l")}
      />
      <div
        aria-hidden
        className="bg-curtain absolute inset-y-0 right-0 w-[16%] rounded-bl-[60%] shadow-2xl"
        style={curtain("r")}
      />
      {/* top valance with scallops */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-14 bg-envelope shadow-xl [mask:radial-gradient(circle_at_50%_100%,transparent_18px,#000_19px)_0_0/44px_100%]"
      />
      <div aria-hidden className="absolute inset-x-0 top-12 h-1 bg-gold/70" />
      {/* hanging flower garlands */}
      {[
        ["8%", 9, "0s"],
        ["20%", 5, ".6s"],
        ["32%", 3, "1.2s"],
        ["66%", 3, ".9s"],
        ["78%", 5, ".3s"],
        ["90%", 9, "1.5s"],
      ].map(([x, l, d], i) => (
        <Garland key={i} x={x as string} len={l as number} delay={d as string} />
      ))}
      {/* floor flowers */}
      {[
        "-left-6 -bottom-6 w-28",
        "left-[22%] -bottom-8 w-20",
        "right-[22%] -bottom-8 w-20",
        "-right-6 -bottom-6 w-28",
      ].map((c, i) => (
        <Flower
          key={i}
          className={`animate-sway absolute ${c}`}
          style={{ animationDelay: `${i * 0.7}s` }}
        />
      ))}
      <Petals count={22} />

      <div
        className="relative flex h-full flex-col items-center justify-center px-6 text-center"
        style={stage === 2 ? { animation: "zoom-out 1s ease forwards" } : undefined}
      >
        <p className="eyebrow mb-3 text-gold">॥ श्री गणेशाय नमः ॥</p>
        <div className="relative">
          <div className="relative overflow-hidden rounded-t-full border-4 border-gold bg-seal/10 p-1.5 shadow-2xl [aspect-ratio:3/4] w-[56vw] max-w-[240px]">
            <img
              src={src(photo1)}
              alt="Bibek and Seema"
              className="h-full w-full rounded-t-full object-cover"
            />
          </div>
          <Flower className="animate-sway absolute -left-6 -top-2 w-16" />
          <Flower
            className="animate-sway absolute -right-6 -top-2 w-16"
            style={{ animationDelay: "1s" }}
          />
          <Flower
            className="animate-sway absolute -left-5 bottom-4 w-14"
            style={{ animationDelay: "2s" }}
          />
          <Flower
            className="animate-sway absolute -right-5 bottom-4 w-14"
            style={{ animationDelay: ".6s" }}
          />
        </div>
        <p className="mt-6 font-script text-5xl text-gold">
          Bibek <span className="animate-heart inline-block text-seal">♥</span> Seema
        </p>
        <p className="mt-1 text-sm tracking-[0.3em] text-seal/80 uppercase">3 · December · 2026</p>
        <button
          type="button"
          onClick={open}
          className={`mt-7 rounded-full border-2 border-gold bg-envelope px-8 py-3 text-sm tracking-[0.3em] text-seal uppercase shadow-[0_0_30px_-5px_var(--gold)] transition hover:scale-105 ${stage ? "opacity-0" : "animate-pulse"}`}
        >
          Open the Invitation
        </button>
        <p className="mt-3 text-[10px] tracking-[0.28em] text-seal/60 uppercase">
          ♪ our song plays when you open
        </p>
      </div>
    </div>
  );
}

function Petals({ count = 12 }: { count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="animate-petal absolute top-0 h-3 w-2 rounded-[60%_0] bg-gold/70"
          style={{
            left: `${(i * 37) % 100}%`,
            animationDuration: `${7 + (i % 5) * 2}s`,
            animationDelay: `${(i * 0.9) % 8}s`,
          }}
        />
      ))}
    </div>
  );
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className={`reveal mx-auto max-w-md px-6 py-14 text-center ${className}`}>
      {children}
    </section>
  );
}

function Tilt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5,
      y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
  };
  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={() => ref.current && (ref.current.style.transform = "")}
      className={`card-3d ${className}`}
    >
      {children}
    </div>
  );
}

function ScratchTile({ label, value }: { label: string; value: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    ctx.fillStyle =
      getComputedStyle(document.documentElement).getPropertyValue("--scratch") || "green";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalCompositeOperation = "destination-out";
    let down = false,
      count = 0;
    const scratch = (e: PointerEvent) => {
      if (!down) return;
      const r = c.getBoundingClientRect();
      ctx.beginPath();
      ctx.arc(e.clientX - r.left, e.clientY - r.top, 18, 0, Math.PI * 2);
      ctx.fill();
      if (++count > 25) setDone(true);
    };
    const d = (e: PointerEvent) => {
      down = true;
      scratch(e);
    };
    const u = () => {
      down = false;
    };
    c.addEventListener("pointerdown", d);
    c.addEventListener("pointermove", scratch);
    window.addEventListener("pointerup", u);
    return () => {
      c.removeEventListener("pointerdown", d);
      c.removeEventListener("pointermove", scratch);
      window.removeEventListener("pointerup", u);
    };
  }, []);
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <div className="card-3d relative flex h-28 items-center justify-center overflow-hidden">
        <span className="font-script text-3xl text-primary">{value}</span>
        <canvas
          ref={ref}
          className={`absolute inset-0 h-full w-full touch-none transition-opacity duration-700 ${done ? "opacity-0 pointer-events-none" : ""}`}
        />
      </div>
    </div>
  );
}

function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, WEDDING - (now ?? WEDDING));
  const parts = [
    ["Days", Math.floor(diff / 864e5)],
    ["Hours", Math.floor(diff / 36e5) % 24],
    ["Mins", Math.floor(diff / 6e4) % 60],
    ["Secs", Math.floor(diff / 1e3) % 60],
  ] as const;
  return (
    <div className="grid grid-cols-4 gap-3">
      {parts.map(([l, v]) => (
        <div key={l}>
          <p className="card-3d py-3 text-4xl text-foreground">
            {now === null ? "--" : String(v).padStart(2, "0")}
          </p>
          <p className="eyebrow">{l}</p>
        </div>
      ))}
    </div>
  );
}

function AddToCalendar() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="mt-8">
      <p className="eyebrow">Don't miss a moment</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            downloadIcs();
            setSaved(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2 text-sm tracking-widest text-accent-foreground uppercase transition hover:opacity-90"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="h-4 w-4 fill-none stroke-current stroke-[1.5]"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 9.5h18M8 3v4M16 3v4M12 13v4M10 15h4" />
          </svg>
          Add to calendar
        </button>
        <a
          href={googleCalendarUrl()}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-full border border-gold/60 px-6 py-2 text-sm tracking-widest text-primary uppercase transition hover:bg-gold/10"
        >
          Google Calendar
        </a>
      </div>
      <p
        className={`mt-3 text-xs tracking-wide text-muted-foreground transition-opacity duration-500 ${saved ? "opacity-100" : "opacity-0"}`}
      >
        Saved — open the file to add it to your calendar.
      </p>
    </div>
  );
}

function _Rsvp() {
  const [sent, setSent] = useState<string | null>(null);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(String(new FormData(e.currentTarget).get("name") || ""));
  };
  if (sent !== null)
    return (
      <div className="frame p-8">
        <p className="font-script text-4xl text-primary">Thank you{sent ? `, ${sent}` : ""}!</p>
        <p className="mt-2 text-muted-foreground">We can't wait to celebrate with you.</p>
      </div>
    );
  const field =
    "w-full rounded-md border border-input bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring";
  return (
    <form onSubmit={submit} className="frame space-y-5 p-6 text-left">
      <label className="block">
        <span className="eyebrow">Your full name</span>
        <input required name="name" className={`${field} mt-2`} placeholder="Enter your name" />
      </label>
      <label className="block">
        <span className="eyebrow">Phone / WhatsApp</span>
        <input name="phone" type="tel" className={`${field} mt-2`} placeholder="+977 98XXXXXXXX" />
      </label>
      <label className="block">
        <span className="eyebrow">Number of guests</span>
        <select name="guests" className={`${field} mt-2`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n}>
              {n} {n === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="eyebrow">Blessings (optional)</span>
        <textarea
          name="msg"
          rows={3}
          className={`${field} mt-2`}
          placeholder="Send your heartfelt wishes to the couple…"
        />
      </label>
      <button className="w-full rounded-md bg-primary py-3 text-lg tracking-widest text-primary-foreground uppercase transition hover:opacity-90">
        Confirm attendance
      </button>
    </form>
  );
}

function useMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.5;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, []);
  // if the browser still blocks autoplay, retry on the next tap
  const start = () => {
    const a = audioRef.current;
    if (!a) return;
    a.play().catch(() => {
      const retry = () => {
        void a.play().catch(() => {});
      };
      window.addEventListener("pointerdown", retry, { once: true });
    });
  };
  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void a.play().catch(() => {});
    else a.pause();
  };
  return { audioRef, playing, start, toggle };
}

function MusicToggle({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={playing}
      aria-label={playing ? "Pause the wedding song" : "Play the wedding song"}
      className="music-dock flex items-center gap-2.5 rounded-full border border-gold/70 bg-envelope/95 py-2.5 pr-4 pl-3 text-gold shadow-[0_0_28px_-6px_var(--gold)] backdrop-blur-md transition hover:scale-105 active:scale-95"
    >
      <span className="relative flex h-7 w-7 items-center justify-center">
        <span
          aria-hidden
          className={`absolute inset-0 rounded-full border border-dashed border-gold/50 ${playing ? "animate-disc" : ""}`}
        />
        <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5 fill-current">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
      </span>
      <span aria-hidden className="flex h-4 items-end gap-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-full w-[3px] origin-bottom rounded-full bg-gold ${playing ? "animate-eq" : ""}`}
            style={{
              animationDelay: `${i * 0.18}s`,
              transform: playing ? undefined : "scaleY(0.3)",
            }}
          />
        ))}
      </span>
      <span className="text-[10px] tracking-[0.25em] uppercase">
        {playing ? "Playing" : "Play"}
      </span>
    </button>
  );
}

function Index() {
  const [open, setOpen] = useState(false);
  const music = useMusic();
  return (
    <main className="relative min-h-screen bg-background">
      <audio ref={music.audioRef} src={src(songAsset)} loop preload="auto" className="hidden" />
      <div aria-hidden className="pointer-events-none fixed inset-0 opacity-60">
        <Petals count={8} />
      </div>
      <MusicToggle playing={music.playing} onToggle={music.toggle} />
      {!open && <Envelope onStart={music.start} onOpen={() => setOpen(true)} />}
      {open && (
        <>
          <Section className="pt-20">
            <Tilt className="relative px-6 py-12">
              <span
                aria-hidden
                className="animate-heart-float pointer-events-none absolute left-6 top-10 text-lg text-envelope/30"
              >
                ♥
              </span>
              <span
                aria-hidden
                className="animate-heart-float pointer-events-none absolute right-8 top-16 text-sm text-gold/50"
                style={{ animationDelay: "2s" }}
              >
                ♥
              </span>
              <span
                aria-hidden
                className="animate-heart-float pointer-events-none absolute left-1/2 top-24 text-base text-envelope/25"
                style={{ animationDelay: "4s" }}
              >
                ♥
              </span>
              <p className="text-2xl text-accent">॥ श्री गणेशाय नमः ॥</p>
              <p className="font-script-alt mt-6 text-4xl leading-tight text-gold">
                Two souls, one journey
              </p>
              <span aria-hidden className="animate-heart my-2 inline-block text-2xl text-envelope">
                ♥
              </span>
              {/* <p className="eyebrow mt-10">Together with their families</p> */}
              <h1 className="mt-4 font-script text-6xl text-gold drop-shadow-sm">Bibek Thapa</h1>
              <p className="my-3 flex items-center justify-center gap-3">
                <span aria-hidden className="flourish" />
                <span className="animate-heart font-script text-4xl text-accent">&amp;</span>
                <span aria-hidden className="flourish" />
              </p>
              <h1 className="font-script text-6xl text-gold drop-shadow-sm">Seema Poudel</h1>
              <p className="text-lg italic text-muted-foreground">
                bound by love and blessed by our families.
              </p>

              <p className="eyebrow mt-10 animate-bounce">Scroll to reveal ↓</p>
            </Tilt>
          </Section>

          <Section>
            <p className="eyebrow">Our story</p>
            <h2 className="font-script text-6xl text-primary">Us Two</h2>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[photo1, photo2].map((p, i) => (
                <Tilt
                  key={i}
                  className={`overflow-hidden p-2 ${i ? "mt-10 rotate-2" : "-rotate-2"}`}
                >
                  <img
                    src={src(p)}
                    alt="Bibek and Seema"
                    loading="lazy"
                    className="aspect-[3/4] w-full rounded-xl object-cover"
                  />
                </Tilt>
              ))}
            </div>
            <p className="mt-6 italic text-muted-foreground">
              Every love story is beautiful, but ours is our favourite.
            </p>
          </Section>

          <Section>
            <p className="eyebrow">The date</p>
            <h2 className="font-script text-6xl text-primary">Save the Date</h2>
            <p className="mt-2 text-muted-foreground">Scratch below to reveal our wedding day</p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              <ScratchTile label="Month" value="Dec" />
              <ScratchTile label="Day" value="03" />
              <ScratchTile label="Year" value="2026" />
            </div>
          </Section>

          <Section>
            <Tilt className="px-6 py-10">
              <p className="italic text-muted-foreground">
                A lifetime of togetherness begins with one sacred step
              </p>
              <h2 className="my-4 font-script text-5xl text-primary">Wedding</h2>
              <Countdown />
            </Tilt>
          </Section>

          <Section>
            <p className="eyebrow">When &amp; where</p>
            <h2 className="font-script text-6xl text-primary">The Wedding</h2>
            <Tilt className="mt-8 overflow-hidden">
              <div className="px-6 py-8">
                <p className="eyebrow">Thursday</p>
                <p className="text-3xl text-foreground">December 3, 2026</p>
                <p className="mt-1 text-xl text-accent">10:00 AM onwards</p>
                <p className="mt-6 font-script text-4xl text-primary">Ramalaya</p>
                <p className="text-muted-foreground">Basbari</p>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_Q)}`}
                  className="mt-6 inline-block rounded-full bg-primary px-6 py-2 text-sm tracking-widest text-primary-foreground uppercase"
                >
                  Get directions
                </a>
                <AddToCalendar />
              </div>
              <iframe
                title="Venue map"
                className="h-56 w-full border-0"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(MAP_Q)}&output=embed`}
              />
            </Tilt>
          </Section>

          <Section>
            <p className="eyebrow">With love &amp; blessings</p>
            <h2 className="font-script text-6xl text-primary">Forever Begins</h2>
            <div className="relative mx-auto mt-10 h-64 w-64 [perspective:900px]">
              <div className="absolute inset-0 preserve-3d animate-spin3d">
                {[0, 60, 120].map((r) => (
                  <div
                    key={r}
                    className="ring-gold absolute inset-0 rounded-full"
                    style={{ transform: `rotateY(${r}deg)` }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-breathe">
                <span className="font-script text-5xl text-gold">Bibek</span>
                <span aria-label="loves" className="my-1 text-3xl text-envelope animate-heart">
                  ♥
                </span>
                <span className="font-script text-5xl text-gold">Seema</span>
              </div>
            </div>
            <p className="mt-8 italic text-muted-foreground">
              Your presence is the greatest gift. We look forward to celebrating with you.
            </p>
          </Section>
        </>
      )}
    </main>
  );
}