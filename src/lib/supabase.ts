import { createClient } from '@supabase/supabase-js';

// Configure with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.
// Existing public project values are retained as fallbacks for compatibility.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nlysroayhahgwmditidr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seXNyb2F5aGFoZ3dtZGl0aWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDM5MzYsImV4cCI6MjA2NTgxOTkzNn0.HGhpETS868vdGiWlIuMi51GP9-3LSctJg70bSPwNLHo';

const authStorageKey = 'rebearth-auth-session';
const authMemory = new Map<string, string>();
const fallbackAuthStorage = {
  getItem: async (key: string) => authMemory.get(key) ?? null,
  setItem: async (key: string, value: string) => { authMemory.set(key, value); },
  removeItem: async (key: string) => { authMemory.delete(key); },
};
const authStorage = (() => {
  if (typeof window === 'undefined') return fallbackAuthStorage;
  try { return window.sessionStorage; } catch { return fallbackAuthStorage; }
})();

// Move an existing Supabase login to session storage, then clear legacy browser data.
// Supabase remains the source of truth; the browser only keeps the temporary auth session.
if (typeof window !== 'undefined') {
  try {
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
    const legacyAuth = window.localStorage.getItem(`sb-${projectRef}-auth-token`);
    if (legacyAuth && !window.sessionStorage.getItem(authStorageKey)) {
      window.sessionStorage.setItem(authStorageKey, legacyAuth);
    }
  } catch {
    // A blocked storage API should not stop database-backed pages from loading.
  }
  try { window.localStorage.clear(); } catch { /* Local storage may be disabled by browser policy. */ }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: authStorage, storageKey: authStorageKey, persistSession: true },
});

export type Database = {
  public: {
    Tables: {
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          customer_address: string;
          items: any[];
          total_amount: number;
          status: 'pending' | 'paid' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          customer_address: string;
          items: any[];
          total_amount: number;
          status?: 'pending' | 'paid' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          customer_address?: string;
          items?: any[];
          total_amount?: number;
          status?: 'pending' | 'paid' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          transaction_id: string;
          mpesa_receipt_number: string;
          phone_number: string;
          amount: number;
          status: 'pending' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          transaction_id: string;
          mpesa_receipt_number?: string;
          phone_number: string;
          amount: number;
          status?: 'pending' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          transaction_id?: string;
          mpesa_receipt_number?: string;
          phone_number?: string;
          amount?: number;
          status?: 'pending' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
