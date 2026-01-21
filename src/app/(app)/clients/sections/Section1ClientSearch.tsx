"use client";

import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function Section1ClientSearch({ value, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-sf-border bg-white p-4 shadow-sm">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-sf-muted"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Søk etter kunde (navn, sted)"
          aria-label="Søk etter kunde"
          autoComplete="off"
          className="
            w-full rounded-full
            border border-sf-border bg-sf-soft
            py-2.5 pl-11 pr-4 text-sm
            outline-none
            focus:ring-2 focus:ring-sf-primary/40
          "
        />
      </div>
    </section>
  );
}