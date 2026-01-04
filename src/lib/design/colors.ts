// src/lib/design/colors.ts

export const colors = {
  brand: {
    primary: '#007C80',     // SmerteFri grønn
    primaryDark: '#004F59',
    primarySoft: '#E6F3F6',
  },

  text: {
    primary: '#0F172A',     // slate-900
    secondary: '#475569',   // slate-600
    muted: '#94A3B8',       // slate-400
    inverse: '#FFFFFF',
  },

  background: {
    page: '#F8FAFC',        // slate-50
    card: '#FFFFFF',
    subtle: '#F1F5F9',      // slate-100
  },

  border: {
    default: '#E2E8F0',     // slate-200
    strong: '#CBD5E1',
  },

  state: {
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#2563EB',
  },

  calendar: {
    available: '#DCFCE7',   // grønn
    booked: '#2563EB',      // blå
    unavailable: '#E5E7EB', // grå
  },
} as const;