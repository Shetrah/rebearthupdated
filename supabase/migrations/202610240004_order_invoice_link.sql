-- Link each online order to its invoice so trusted payment callbacks can
-- reconcile order, invoice and payment status reliably.
alter table public.orders add column if not exists invoice_id uuid references public.invoices(id) on delete set null;
create index if not exists orders_invoice_id_idx on public.orders(invoice_id);
