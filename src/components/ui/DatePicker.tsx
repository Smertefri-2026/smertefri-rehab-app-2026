"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import * as Popover from "@radix-ui/react-popover";

type Props = {
  value?: string;
  onChange: (value: string) => void;
};

export function DatePicker({ value, onChange }: Props) {
  const [open, setOpen] = React.useState(false);

  // value forventes å være "yyyy-MM-dd" (det du allerede setter i onSelect)
  const selected = value ? new Date(value) : undefined;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm"
        >
          {selected
            ? format(selected, "dd.MM.yyyy", { locale: nb })
            : "Velg dato"}
          <Calendar size={16} className="opacity-60" />
        </button>
      </Popover.Trigger>

      <Popover.Content
        className="z-50 rounded-xl border bg-white p-3 shadow-lg"
        sideOffset={8}
        align="start"
      >
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;

            onChange(format(date, "yyyy-MM-dd"));

            // ✅ dette fikser problemet ditt:
            setOpen(false);
          }}
          fromYear={1900}
          toYear={new Date().getFullYear()}
          captionLayout="dropdown"
          locale={nb}
        />
      </Popover.Content>
    </Popover.Root>
  );
}