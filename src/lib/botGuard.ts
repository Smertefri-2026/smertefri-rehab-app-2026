// Enkle, avhengighetsfrie bot-sjekker for offentlige registreringsskjemaer —
// et supplement til Turnstile, ikke en erstatning. Virker helt uavhengig av
// captcha-konfigurasjon, så de gir beskyttelse med én gang, mens Turnstile/
// Supabase-siden fortsatt verifiseres manuelt.
//
// To uavhengige signaler, begge klassiske og velprøvde mot enkle/skriptede
// botter (ikke mot en motivert, målrettet angriper — det er Turnstiles jobb):
//   1. Honeypot-felt: usynlig for mennesker (fjernet fra tab-rekkefølge og
//      skjermlesere), men botter som blindt fyller ut alle felt fanger den.
//   2. Minste utfyllingstid: et menneske bruker mer enn ~1,5 sek på å lese
//      skjemaet og skrive inn e-post/passord; en skriptet POST gjør det momentant.
import { useEffect, useRef, type RefObject } from "react";

export const HONEYPOT_FIELD_NAME = "sf_website";
const MIN_FILL_TIME_MS = 1500;

/** Setter tidspunktet i en effekt, ikke under selve rendringen — Date.now()
 *  er en uren funksjon og hører ikke hjemme i render-stien. */
export function useBotGuardMountTime(): RefObject<number> {
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);
  return mountedAt;
}

export function isLikelyBot(honeypotValue: string, mountedAtMs: number): boolean {
  if (honeypotValue.trim() !== "") return true;
  if (Date.now() - mountedAtMs < MIN_FILL_TIME_MS) return true;
  return false;
}

/** Usynlig for mennesker (posisjonert utenfor skjermen, ikke display:none —
 *  enkelte botter hopper over display:none), fjernet fra tab-rekkefølge og
 *  skjult for skjermlesere. */
export const honeypotWrapperStyle: React.CSSProperties = {
  position: "absolute",
  left: "-9999px",
  top: 0,
  width: 1,
  height: 1,
  overflow: "hidden",
};
