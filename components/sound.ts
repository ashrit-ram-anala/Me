"use client";

import { useSyncExternalStore } from "react";
import type { Theme } from "./data";

type Track = {
  /** YouTube video id of the official upload; it streams from there, nothing is hosted here */
  id: string;
  /** seconds into the video where the clip starts, and where it loops back to */
  start: number;
  /** seconds where the clip loops back; without one, the whole song plays and then loops */
  end?: number;
};

/** Each row's song. A theme with no entry has no music. */
export const tracks: Partial<Record<Theme, Track>> = {
  f1: { id: "VJxppgsHjF8", start: 0 }, // Don Toliver, Lose My Mind (F1 The Album)
  anime: { id: "ynRvkrGRuV0", start: 0 }, // Susumu Hirasawa, Gats (VAP official)
  oppenheimer: { id: "4JZ-o3iAJv4", start: 0 }, // Ludwig Göransson, Can You Hear the Music
  space: { id: "uD4izuDMUQA", start: 497, end: 527 }, // melodysheep, Timelapse of the Future
  cali: { id: "f7ztKV_BJyo", start: 0 }, // The Mamas & the Papas, California Dreamin'
  pingpong: { id: "4zya9pwLJik", start: 0 }, // The Marías, Spin Me Around (official audio)
};

const VOLUME = 50;
const FADE_IN_MS = 1100;
const FADE_OUT_MS = 1300;
/** a fade runs from (or to) this level, quiet enough to read as silence */
const FLOOR_DB = -45;

/** The slice of the YouTube IFrame API used here. */
type Player = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getCurrentTime(): number;
};
type YouTube = {
  Player: new (
    el: HTMLElement,
    options: {
      host: string;
      videoId: string;
      width: number;
      height: number;
      playerVars: Record<string, number>;
      events: { onReady(e: { target: Player }): void; onStateChange(e: { data: number }): void };
    },
  ) => Player;
};
const ENDED = 0;

/* Every song is off until the visitor presses space on its row, which is also what lets the
   browser play it. A row that's been turned on plays again whenever it's hovered, until it's turned
   off. Each song picks up where it was left, even after a reload in the same tab (the place is kept
   in session storage); turning a song on still takes a key press after a reload. */
const enabled = new Set<Theme>();
const listeners = new Set<() => void>();
const players = new Map<Theme, Promise<Player>>();
const volumes = new Map<Theme, number>();
const fades = new Map<Theme, number>();
/** rows that should be heard right now (hovered and on) */
const wanted = new Set<Theme>();
/** rows whose player is playing, including while it fades out */
const running = new Set<Theme>();

const PLACES_KEY = "song-places";
/** where each song was left, in seconds into its video */
let places: Partial<Record<Theme, number>> | undefined;

function placesStore() {
  if (!places) {
    try {
      places = JSON.parse(sessionStorage.getItem(PLACES_KEY) ?? "{}") ?? {};
    } catch {
      places = {};
    }
  }
  return places!;
}

function remember(theme: Theme, seconds: number) {
  placesStore()[theme] = seconds;
  try {
    sessionStorage.setItem(PLACES_KEY, JSON.stringify(places));
  } catch {}
}

/** where to pick a song back up: its saved place, or the top of its clip */
function resumeAt(theme: Theme) {
  const track = tracks[theme]!;
  const at = placesStore()[theme];
  if (at === undefined || at < track.start || (track.end !== undefined && at >= track.end)) return track.start;
  return at;
}

/* players from an earlier copy of this module (a hot reload while developing) would play on with no
   one left to stop them, so clear them out when this copy starts */
if (typeof document !== "undefined") document.getElementById("sound-shelf")?.remove();

let api: Promise<YouTube> | undefined;
function youtube() {
  api ??= new Promise((resolve) => {
    const w = window as unknown as { YT?: YouTube; onYouTubeIframeAPIReady?: () => void };
    w.onYouTubeIframeAPIReady = () => resolve(w.YT!);
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return api;
}

/** the players live off screen; only their sound is used */
function shelf() {
  let el = document.getElementById("sound-shelf");
  if (!el) {
    el = document.createElement("div");
    el.id = "sound-shelf";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
  }
  return el;
}

function player(theme: Theme) {
  let p = players.get(theme);
  if (!p) {
    const track = tracks[theme]!;
    p = youtube().then(
      (YT) =>
        new Promise<Player>((resolve) => {
          const el = document.createElement("div");
          shelf().appendChild(el);
          const yt = new YT.Player(el, {
            host: "https://www.youtube-nocookie.com",
            videoId: track.id,
            width: 2,
            height: 2,
            playerVars: { start: Math.floor(resumeAt(theme)), controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
            events: {
              onReady: (e) => resolve(e.target),
              onStateChange: (e) => {
                if (e.data !== ENDED || !running.has(theme)) return;
                yt.seekTo(track.start, true);
                yt.playVideo();
              },
            },
          });
        }),
    );
    players.set(theme, p);
  }
  return p;
}

/** Loads a row's player ahead of time (on hover), so pressing space starts it at once. */
export function warm(theme: Theme) {
  if (tracks[theme]) player(theme);
}

const toDb = (v: number) => (v <= 0 ? FLOOR_DB : Math.max(FLOOR_DB, 20 * Math.log10(v / VOLUME)));
const fromDb = (db: number) => VOLUME * 10 ** (db / 20);

/* Ears hear loudness in decibels, so a straight volume ramp seems to jump at the start of a fade
   in and drop away at the end of a fade out. This ramps in decibels on an eased curve instead. */
function fade(theme: Theme, p: Player, to: number, ms: number, done?: () => void) {
  cancelAnimationFrame(fades.get(theme) ?? 0);
  const from = toDb(volumes.get(theme) ?? 0);
  const target = toDb(to);
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, Math.max(0, (now - start) / ms));
    const e = t * t * (3 - 2 * t);
    const v = t === 1 ? to : fromDb(from + (target - from) * e);
    volumes.set(theme, v);
    p.setVolume(v);
    if (t < 1) fades.set(theme, requestAnimationFrame(step));
    else done?.();
  };
  fades.set(theme, requestAnimationFrame(step));
}

/* clips with an end point loop back to their start; every playing song's place is noted as it goes,
   so a reload mid-song still picks it back up */
let watching: ReturnType<typeof setInterval> | undefined;
function watch() {
  watching ??= setInterval(() => {
    for (const theme of running) {
      const track = tracks[theme]!;
      players.get(theme)?.then((p) => {
        const at = p.getCurrentTime();
        if (track.end !== undefined && at >= track.end) p.seekTo(track.start, true);
        else remember(theme, at);
      });
    }
  }, 250);
}

/** Fades a row's song in, from where it was left if it had fully stopped. */
export function play(theme: Theme) {
  if (!enabled.has(theme) || !tracks[theme]) return;
  wanted.add(theme);
  player(theme).then((p) => {
    if (!wanted.has(theme)) return;
    if (!running.has(theme)) {
      p.seekTo(resumeAt(theme), true);
      volumes.set(theme, 0);
      p.setVolume(0);
    }
    running.add(theme);
    p.playVideo();
    watch();
    fade(theme, p, VOLUME, FADE_IN_MS);
  });
}

/** Fades a row's song out, then pauses it. */
export function stop(theme: Theme) {
  wanted.delete(theme);
  if (!running.has(theme)) return;
  players.get(theme)?.then((p) => {
    fade(theme, p, 0, FADE_OUT_MS, () => {
      p.pauseVideo();
      running.delete(theme);
      remember(theme, p.getCurrentTime());
    });
  });
}

/** Turns one row's song on or off; called from the key press, so the browser lets it play. */
export function setSound(theme: Theme, on: boolean) {
  if (on) {
    enabled.add(theme);
    play(theme);
  } else {
    enabled.delete(theme);
    stop(theme);
  }
  listeners.forEach((l) => l());
}

export function useSound(theme: Theme) {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => enabled.has(theme),
    () => false,
  );
}
