// src/types/client.ts

export type ClientStatus = {
  nextSession?: string | null;
  painLevel?: "Lav" | "Moderat" | "Høy" | null;
  testStatus?: string | null;
  nutritionStatus?: string | null;
};

export type ClientNote = {
  text: string;
  updatedAt?: string;
};

export type Client = {
  id: string;

  first_name: string;
  last_name: string;
  age?: number;
  city?: string;

  status?: ClientStatus;
  note?: ClientNote;
};