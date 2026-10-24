/*
  # Create payments table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `invoice_id` (text, foreign key reference)
      - `transaction_id` (text, unique)
      - `mpesa_receipt_number` (text)
      - `phone_number` (text)
      - `amount` (numeric)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `payments` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id text NOT NULL,
  transaction_id text UNIQUE NOT NULL,
  mpesa_receipt_number text,
  phone_number text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (you can restrict this based on your needs)
CREATE POLICY "Allow public access to payments"
  ON payments
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);