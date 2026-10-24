-- Guest invoice capability token allows a guest to pay only their own invoice.
alter table public.invoices add column if not exists guest_token text;
alter table public.orders add column if not exists guest_token text;
create index if not exists invoices_guest_token_idx on public.invoices(guest_token) where guest_token is not null;
create index if not exists orders_guest_token_idx on public.orders(guest_token) where guest_token is not null;
