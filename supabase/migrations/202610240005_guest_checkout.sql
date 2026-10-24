-- Guest checkout can create pending online orders and invoices, but cannot
-- read or update customer/order/payment records through PostgREST.
drop policy if exists "guest website order create" on public.orders;
create policy "guest website order create" on public.orders for insert to anon
with check (user_id is null and source = 'website' and status = 'pending' and payment_status = 'pending' and total_amount > 0);

drop policy if exists "guest invoice create" on public.invoices;
create policy "guest invoice create" on public.invoices for insert to anon
with check (user_id is null and status = 'pending' and total_amount > 0);

drop policy if exists "guest payment create" on public.payments;
create policy "guest payment create" on public.payments for insert to anon
with check (user_id is null and status = 'pending' and amount > 0 and transaction_id <> '');
