// src/lib/clients.ts

import { Client } from "@/types/client";

export async function getClients(): Promise<Client[]> {
  // DUMMY – erstattes med Supabase senere
  return [
    {
      id: "1",
      first_name: "Ola",
      last_name: "Nordmann",
      age: 42,
      city: "Drammen",
      status: {
        nextSession: "I morgen kl. 14:00",
        painLevel: "Moderat",
        testStatus: "Stabil fremgang",
        nutritionStatus: "Logget i dag",
      },
      note: {
        text: "Fokus på rygg og hofte. God fremgang siste 4 uker.",
      },
    },
  ];
}