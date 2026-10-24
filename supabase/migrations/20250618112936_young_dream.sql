/*
  # Create invoices table

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `invoice_number` (text, unique)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `customer_address` (text)
      - `items` (jsonb)
      - `total_amount` (numeric)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `invoices` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (you can restrict this based on your needs)
CREATE POLICY "Allow public access to invoices"
  ON invoices
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);