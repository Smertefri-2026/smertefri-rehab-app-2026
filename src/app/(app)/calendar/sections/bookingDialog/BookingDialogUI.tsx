// src/app/(app)/calendar/sections/bookingDialog/BookingDialogUI.tsx
"use client";

import { Booking, BookingDuration, BookingRepeat } from "@/types/booking";
import type { WeeklyAvailability } from "../Section6TrainerAvailability";
import type { Role } from "./useBookingDialogState";

type Props = {
  mode: "create" | "edit" | null;
  booking?: Booking | null;
  role: Role;
  availability: WeeklyAvailability | null;

  isCreate: boolean;
  isEdit: boolean;

  // computed
  effectiveStart: Date | null;
  passes24h: boolean;
  withinAvailability: boolean;
  conflicts: boolean;
  clientEditLocked: boolean;

  // state + setters
  duration: BookingDuration;
  setDuration: (v: BookingDuration) => void;

  pickedDate: string;
  setPickedDate: (v: string) => void;

  pickedTime: string | null;
  setPickedTime: (v: string | null) => void;

  note: string;
  setNote: (v: string) => void;

  repeat: BookingRepeat;
  setRepeat: (v: BookingRepeat) => void;

  repeatMonths: 3 | 6 | 12;
  setRepeatMonths: (v: 3 | 6 | 12) => void;

  plannedFirst: Date | null;
  plannedLast: Date | null;

  slotButtons: string[];

  // trainer/admin client picker
  trainerClients: { id: string; first_name: string | null; last_name: string | null }[];
  pickedClientId: string | null;
  setPickedClientId: (v: string | null) => void;

  // error/saving
  saving: boolean;
  error: string | null;

  // handlers
  onClose: () => void;
  onCreate: () => void;
  onUpdate: () => void;
  onCancel: () => void;

  createDisabled: boolean;
  updateDisabled: boolean;
};

export function BookingDialogUI({
  mode,
  booking,
  role,
  availability,

  isCreate,
  isEdit,

  effectiveStart,
  passes24h,
  withinAvailability,
  conflicts,
  clientEditLocked,

  duration,
  setDuration,

  pickedDate,
  setPickedDate,

  pickedTime,
  setPickedTime,

  note,
  setNote,

  repeat,
  setRepeat,

  repeatMonths,
  setRepeatMonths,

  plannedFirst,
  plannedLast,

  slotButtons,

  trainerClients,
  pickedClientId,
  setPickedClientId,

  saving,
  error,

  onClose,
  onCreate,
  onUpdate,
  onCancel,

  createDisabled,
  updateDisabled,
}: Props) {
  if (!mode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl flex flex-col max-h-[85vh]">
        {/* HEADER */}
        <div className="p-6 pb-3">
          <h3 className="text-base font-semibold">{isCreate ? "Ny time" : "Rediger time"}</h3>

          <div className="mt-2 text-sm text-sf-muted space-y-1">
            <div>
              Valgt tidspunkt:{" "}
              <strong>{effectiveStart ? effectiveStart.toLocaleString("nb-NO") : "—"}</strong>
            </div>

            <div className="text-xs">
              {role === "client" ? (
                !passes24h ? (
                  <span className="text-red-600">❌ Må være mer enn 24t frem</span>
                ) : conflicts ? (
                  <span className="text-red-600">❌ Allerede booket</span>
                ) : withinAvailability ? (
                  <span className="text-green-700">✅ Innenfor tilgjengelighet</span>
                ) : (
                  <span className="text-red-600">❌ Utenfor tilgjengelighet</span>
                )
              ) : conflicts ? (
                <span className="text-red-600">❌ Allerede booket</span>
              ) : availability && effectiveStart && !withinAvailability ? (
                <span className="text-amber-700">⚠️ Utenfor tilgjengelighet (trener/admin kan overstyre)</span>
              ) : (
                <span className="text-green-700">✅ Klar</span>
              )}
            </div>

            {isEdit && role === "client" && clientEditLocked ? (
              <div className="text-xs text-red-600">
                Du kan ikke endre/avlyse mindre enn 24 timer før timen.
              </div>
            ) : null}
          </div>
        </div>

        {/* BODY */}
        <div className="px-6 pb-4 overflow-y-auto space-y-3">
          {/* Kundevalg for trainer/admin (create) */}
          {isCreate && (role === "trainer" || role === "admin") && (
            <div className="rounded-xl border border-sf-border p-3 space-y-2">
              <div className="text-sm font-medium">Kunde</div>
              <select
                value={pickedClientId ?? ""}
                onChange={(e) => setPickedClientId(e.target.value)}
                className="w-full rounded-lg border border-sf-border px-3 py-2 text-sm"
              >
                {trainerClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {`${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "Kunde"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Varighet */}
          <div className="rounded-xl border border-sf-border p-3 space-y-2">
            <div className="text-sm font-medium">Varighet</div>
            <div className="flex gap-2">
              {[15, 25, 50].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDuration(m as BookingDuration)}
                  className={`rounded-full px-4 py-2 text-sm border ${
                    duration === m
                      ? "bg-[#007C80] text-white border-transparent"
                      : "bg-white border-sf-border text-sf-text"
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>

          {/* Dato/tid */}
          <div className="rounded-xl border border-sf-border p-3 space-y-3">
            <div className="text-sm font-medium">Dato</div>
            <input
              type="date"
              value={pickedDate}
              onChange={(e) => {
                setPickedDate(e.target.value);
                setPickedTime(null);
              }}
              className="w-full rounded-lg border border-sf-border px-3 py-2 text-sm"
              disabled={role === "client" && isEdit && clientEditLocked}
            />

            <div className="text-sm font-medium">Tidspunkt</div>
            {slotButtons.length ? (
              <div className="grid grid-cols-4 gap-2">
                {slotButtons.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPickedTime(t)}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      pickedTime === t
                        ? "bg-[#007C80] text-white border-transparent"
                        : "bg-white border-sf-border"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-sf-muted">Ingen ledige tidspunkter denne dagen.</p>
            )}
          </div>

          {/* Gjentak (create) */}
          {isCreate && (
            <div className="rounded-xl border border-sf-border p-3 space-y-3">
              <div className="text-sm font-medium">Gjentak</div>
              <div className="flex gap-2">
                {[
                  { key: "none", label: "Ingen" },
                  { key: "weekly", label: "Ukentlig" },
                  { key: "biweekly", label: "Annenhver uke" },
                ].map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRepeat(r.key as BookingRepeat)}
                    className={`rounded-full px-4 py-2 text-sm border ${
                      repeat === r.key
                        ? "bg-[#007C80] text-white border-transparent"
                        : "bg-white border-sf-border text-sf-text"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {repeat !== "none" && (
                <div className="space-y-2">
                  <div className="text-xs text-sf-muted">
                    Hvor lenge? (fra valgt dag – trykk endrer)
                  </div>
                  <div className="flex gap-2">
                    {[3, 6, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setRepeatMonths(m as 3 | 6 | 12)}
                        className={`rounded-full px-4 py-2 text-sm border ${
                          repeatMonths === m
                            ? "bg-[#007C80] text-white border-transparent"
                            : "bg-white border-sf-border text-sf-text"
                        }`}
                      >
                        + {m} mnd
                      </button>
                    ))}
                  </div>

                  {plannedFirst && (
                    <div className="text-xs text-sf-muted pt-1">
                      Første: <strong>{plannedFirst.toLocaleString("nb-NO")}</strong>
                      {plannedLast ? (
                        <>
                          {" "}• Siste: <strong>{plannedLast.toLocaleString("nb-NO")}</strong>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notat – skjul på mobil */}
          <div className="hidden md:block rounded-xl border border-sf-border p-3 space-y-2">
            <div className="text-sm font-medium">Notat (valgfritt)</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-sf-border px-3 py-2 text-sm outline-none"
              placeholder="F.eks. fokus: rygg / hofte, smerter, mål…"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-sf-border bg-white flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            Avbryt
          </button>

          {isEdit ? (
            <>
              <button
                onClick={onCancel}
                disabled={saving || !booking || booking.status === "cancelled" || (role === "client" && clientEditLocked)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {saving ? "Jobber…" : "Slett / avlys"}
              </button>

              <button
                onClick={onUpdate}
                disabled={updateDisabled}
                className="rounded-lg bg-sf-primary px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {saving ? "Lagrer…" : "Lagre endring"}
              </button>
            </>
          ) : (
            <button
              onClick={onCreate}
              disabled={createDisabled}
              className="rounded-lg bg-sf-primary px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? "Lagrer…" : "Lagre booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}