import React, { useState } from 'react';
import { Check, Circle, PackageCheck, Search, Truck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type TrackedOrder = {
  order_number: string;
  invoice_number?: string | null;
  created_at: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method?: string | null;
  source?: string | null;
  items: Array<{ name?: string; quantity?: number; qty?: number }>;
  tracking_number?: string | null;
  delivery_note?: string | null;
};

const money = (amount: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount || 0);

const TrackOrder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(() => searchParams.get('reference') || '');
  const [contact, setContact] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const track = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('track-order', { body: { reference, contact } });
      if (invokeError) {
        let message = invokeError.message || 'Could not track this order.';
        try {
          const response = (invokeError as typeof invokeError & { context?: Response }).context;
          const payload = response ? await response.clone().json() : null;
          if (typeof payload?.error === 'string') message = payload.error;
        } catch { /* retain the Supabase error message */ }
        throw new Error(message);
      }
      if (!data?.order) throw new Error(data?.error || 'No matching order was found.');
      setOrder(data.order as TrackedOrder);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not track this order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const status = (order?.status || '').toLowerCase();
  const paymentStatus = (order?.payment_status || '').toLowerCase();
  const cancelled = status === 'cancelled';
  const paid = ['paid', 'completed'].includes(paymentStatus) || ['paid', 'processing', 'fulfilled', 'completed'].includes(status);
  const processing = ['processing', 'fulfilled', 'completed'].includes(status);
  const delivered = ['fulfilled', 'completed'].includes(status);
  const steps = [
    { label: 'Order placed', detail: order ? new Date(order.created_at).toLocaleString() : '', done: true, Icon: PackageCheck },
    { label: 'Payment confirmed', detail: paid ? `${order?.payment_method || 'Payment'} received` : 'Waiting for payment confirmation', done: paid, Icon: Check },
    { label: 'Preparing your order', detail: processing ? 'Your order is being prepared or has shipped' : 'The store will update this when preparation starts', done: processing, Icon: PackageCheck },
    { label: 'Delivered', detail: delivered ? 'Order marked as fulfilled' : 'Delivery is not yet complete', done: delivered, Icon: Truck },
  ];

  return <main className="min-h-screen bg-slate-50 px-4 pb-20 pt-28 sm:px-6">
    <div className="mx-auto max-w-3xl">
      <header className="mb-8 text-center">
        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">Order updates</span>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">Track your order</h1>
        <p className="mx-auto mt-3 max-w-xl leading-6 text-slate-600">Enter your order number or invoice number and the email address or phone number used when purchasing.</p>
      </header>

      <form onSubmit={track} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">Order or invoice number
            <input required autoComplete="off" value={reference} onChange={event => setReference(event.target.value)} placeholder="e.g. RB123456789" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Email or phone used at checkout
            <input required autoComplete="email" value={contact} onChange={event => setContact(event.target.value)} placeholder="you@example.com or 07…" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
          </label>
        </div>
        <button disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">
          <Search size={18}/>{loading ? 'Looking up order…' : 'Track order'}
        </button>
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      </form>

      {order && <section aria-live="polite" className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[#103b30] p-5 text-white sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-200">{order.source === 'pos' ? 'Walk-in purchase' : 'Online purchase'}</p><h2 className="mt-2 text-xl font-extrabold">{order.order_number}</h2><p className="mt-1 text-sm text-white/70">Placed {new Date(order.created_at).toLocaleDateString()}</p></div>
            <div className="text-left sm:text-right"><p className="text-sm text-white/70">Total</p><p className="text-2xl font-extrabold">{money(order.total_amount)}</p></div>
          </div>
          {order.invoice_number && <p className="mt-4 text-sm text-white/80">Invoice <span className="font-bold text-white">{order.invoice_number}</span></p>}
        </div>

        <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <h3 className="font-bold text-slate-900">Delivery progress</h3>
            {cancelled ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">This order has been cancelled. Contact Rebearth if you need help.</p> : <ol className="mt-5 space-y-5">
              {steps.map(({ label, detail, done, Icon }, index) => <li key={label} className="relative flex gap-3">
                {index < steps.length - 1 && <span className={`absolute left-[15px] top-9 h-8 w-px ${steps[index + 1].done ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                <span className={`z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ${done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>{done ? <Icon size={16}/> : <Circle size={15}/>}</span>
                <div><p className={`font-semibold ${done ? 'text-slate-900' : 'text-slate-500'}`}>{label}</p><p className="mt-1 text-sm text-slate-500">{detail}</p></div>
              </li>)}
            </ol>}
            {order.tracking_number && <div className="mt-6 rounded-xl bg-emerald-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Delivery reference</p><p className="mt-1 break-all font-bold text-emerald-950">{order.tracking_number}</p></div>}
            {order.delivery_note && <div className="mt-3 rounded-xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Latest delivery update</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{order.delivery_note}</p></div>}
          </div>
          <div className="rounded-xl bg-slate-50 p-4 sm:p-5">
            <h3 className="font-bold text-slate-900">Items in this order</h3>
            <ul className="mt-4 divide-y divide-slate-200">{order.items.map((item, index) => <li key={`${item.name || 'item'}-${index}`} className="flex justify-between gap-3 py-3 text-sm"><span className="text-slate-700">{item.name || 'Product'} <span className="text-slate-500">× {item.quantity || item.qty || 1}</span></span></li>)}</ul>
            <p className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">Payment: <span className="font-semibold capitalize text-slate-900">{order.payment_status || 'pending'}</span></p>
          </div>
        </div>
      </section>}
      <p className="mt-6 text-center text-xs leading-5 text-slate-500">For privacy, order details are shown only when the reference and matching checkout contact are both provided.</p>
    </div>
  </main>;
};

export default TrackOrder;
