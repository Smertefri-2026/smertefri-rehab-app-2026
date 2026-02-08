"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isIos() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  // iOS
  const iosStandalone = (window.navigator as any).standalone === true;
  // other
  const mqStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
  return iosStandalone || mqStandalone;
}

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  const ios = useMemo(() => isIos(), []);
  const standalone = useMemo(() => isInStandaloneMode(), []);

  useEffect(() => {
    setInstalled(standalone);

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // viktig for å kunne trigge selv
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [standalone]);

  // Skjul hvis allerede installert
  if (installed) return null;

  // iOS: ingen beforeinstallprompt -> vis hjelpeknapp
  if (ios) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIosHelp(true)}
          className="w-full rounded-full border border-sf-border bg-white py-3 font-medium text-[#007C80] hover:bg-sf-soft transition"
        >
          Legg til som app (iPhone)
        </button>

        {showIosHelp && (
          <div className="fixed inset-0 z-[9999] bg-black/50 p-4">
            <div className="mx-auto max-w-md rounded-2xl bg-white p-5 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-slate-900">Legg til SmerteFri som app</div>
                  <div className="mt-1 text-sm text-slate-600">
                    På iPhone gjør du dette via Safari:
                  </div>
                </div>
                <button
                  className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
                  onClick={() => setShowIosHelp(false)}
                >
                  ✕
                </button>
              </div>

              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                <li>Åpne siden i <b>Safari</b> (ikke innebygd nettleser i apper).</li>
                <li>Trykk <b>Del</b>-ikonet (firkant med pil opp).</li>
                <li>Velg <b>Legg til på Hjem-skjerm</b>.</li>
                <li>Trykk <b>Legg til</b>.</li>
              </ol>

              <div className="mt-4 text-xs text-slate-500">
                Tips: Når appen er lagt til, åpnes den i “standalone” uten adresselinje.
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Chrome/Edge/Desktop/Android: vis ekte install-knapp når tilgjengelig
  if (!deferredPrompt) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await deferredPrompt.prompt();
          await deferredPrompt.userChoice; // outcome kan brukes om du vil logge
          setDeferredPrompt(null);
        } catch {
          // ignore
        }
      }}
      className="w-full rounded-full border border-sf-border bg-white py-3 font-medium text-[#007C80] hover:bg-sf-soft transition"
    >
      Installer app
    </button>
  );
}