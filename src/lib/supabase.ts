import { createClient } from '@supabase/supabase-js';

// Configure with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.
// Existing public project values are retained as fallbacks for compatibility.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nlysroayhahgwmditidr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seXNyb2F5aGFoZ3dtZGl0aWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDM5MzYsImV4cCI6MjA2NTgxOTkzNn0.HGhpETS868vdGiWlIuMi51GP9-3LSctJg70bSPwNLHo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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