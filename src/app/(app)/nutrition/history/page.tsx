"use client";

import Link from "next/link";
import AppPage from "@/components/layout/AppPage";
import { listDays, sumMeals } from "@/modules/nutrition/storage";

export default function NutritionHistoryPage() {
  const days = typeof window !== "undefined" ? listDays(90) : [];

  return (
    <div className="bg-[#F4FBFA]">
      <AppPage>
        <div className="space-y-6">
          <div>
            <Link
              href="/nutrition"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-sf-border px-6 py-3 text-sm font-medium text-sf-text hover:bg-sf-soft"
            >
              ← Tilbake
            </Link>
          </div>

          <section className="rounded-2xl border border-sf-border bg-white p-6 shadow-sm space-y-4">
            <h1 className="text-base font-semibold text-sf-text">Historikk</h1>

            {days.length === 0 ? (
              <p className="text-sm text-sf-muted">Ingen dager logget enda.</p>
            ) : (
              <div className="divide-y divide-sf-border">
                {days.map((d) => {
                  const s = sumMeals(d.meals || []);
                  return (
                    <div key={d.date} className="py-3 flex items-center justify-between text-sm">
                      <span>{d.date}</span>
                      <span className="font-medium">{s.calories_kcal} kcal</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </AppPage>
    </div>
  );
}