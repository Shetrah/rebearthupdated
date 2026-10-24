import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Activity, BadgeCheck, Banknote, Box, ClipboardList, CreditCard, ImagePlus, LayoutDashboard, LogOut, Package, Plus, Search, Settings2, ShoppingCart, Trash2, Upload, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { createInvoice, downloadInvoice, emailInvoice } from '../lib/invoice';
import { initiateSTKPush } from '../lib/mpesa';

type Product = { id: string; name: string; description: string; price: number; image_url: string; category: string; stock: number; active: boolean };
type Order = { id: string; order_number?: string; customer_name: string; customer_email?: string; customer_phone?: string; items: any[]; total_amount: number; status: string; created_at: string; payment_status?: string; payment_method?: string; source?: string };
type Content = { key: string; value: string; label: string };
type PosPaymentDialog = { orderNumber: string; customerName: string; phone: string; amount: number; method: string; status: 'pending' | 'completed' | 'failed' | 'error'; details: string; invoice: any };
const readHeroUrls = (value: string) => {
  try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed.filter((url): url is string => typeof url === 'string'); } catch { /* accept one plain URL per line */ }
  return value.split(/\r?\n/).map(url => url.trim()).filter(Boolean);
};
const readContentCards = (value: string) => { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; } };
const money = (n: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(Number(n || 0));
const nav = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'pos', label: 'Point of sale', icon: CreditCard }, { id: 'products', label: 'Products', icon: Package },
  { id: 'content', label: 'Website content', icon: Settings2 },
];

export default function Admin() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [section, setSection] = useState('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [customer, setCustomer] = useState({ name: 'Walk-in customer', email: '', phone: '' });
  const [posPaymentMethod, setPosPaymentMethod] = useState('Cash');
  const [posPaymentStatus, setPosPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [posPaymentDialog, setPosPaymentDialog] = useState<PosPaymentDialog | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [o, p, c] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(250),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('site_content').select('*').order('key')
    ]);
    if (o.error) toast.error(`Orders: ${o.error.message}`); else setOrders((o.data || []) as Order[]);
    if (p.error) toast.error(`Products: ${p.error.message}`); else setProducts((p.data || []) as Product[]);
    if (c.error && !/site_content/i.test(c.error.message)) toast.error(`Website content: ${c.error.message}`); else setContent((c.data || []) as Content[]);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  if (!user) return <Navigate to="/login" state={{ from: `${location.pathname}${location.search}${location.hash}` }} replace />;
  if (user.role !== 'admin') return <div className="min-h-[70vh] flex items-center justify-center p-6"><div className="max-w-lg rounded-3xl bg-white p-8 shadow-xl text-center"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700"><BadgeCheck /></div><h1 className="text-2xl font-bold text-slate-900">Admin access required</h1><p className="mt-3 text-slate-600">This area is restricted to approved administrators. Assign your account the <code>admin</code> role in the Supabase <code>profiles</code> table after applying the included database setup.</p><button onClick={() => void logout()} className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white">Sign out</button></div></div>;

  const totalRevenue = orders.filter(o => ['paid', 'completed', 'processing', 'fulfilled'].includes(String(o.status).toLowerCase()) || String(o.payment_status).toLowerCase() === 'paid').reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => ['pending', 'new', 'processing'].includes(String(o.status).toLowerCase())).length;
  const filteredOrders = orders.filter(o => `${o.order_number || o.id} ${o.customer_name} ${o.customer_email || ''} ${o.customer_phone || ''}`.toLowerCase().includes(search.toLowerCase()));
  const filteredProducts = products.filter(p => `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase()));
  const cartTotal = cart.reduce((sum, line) => sum + Number(line.product.price) * line.qty, 0);
  const posPaymentInstructions = content.find(item => item.key === 'pos_payment_instructions') || { key: 'pos_payment_instructions', label: 'POS buyer payment instructions', value: '' };

  async function updateOrderStatus(order: Order, status: string) {
    const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', order.id);
    if (error) toast.error(error.message); else { toast.success('Order updated'); await load(); }
  }
  async function saveProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!editing) return; setSaving(true);
    const form = new FormData(e.currentTarget); let image_url = String(form.get('image_url') || '');
    const file = form.get('image_file') as File;
    if (file && file.size > 0) {
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const { error: uploadError } = await supabase.storage.from('site-media').upload(`products/${safeName}`, file, { upsert: true });
      if (uploadError) { toast.error(`Image upload: ${uploadError.message}`); setSaving(false); return; }
      const { data } = supabase.storage.from('site-media').getPublicUrl(`products/${safeName}`); image_url = data.publicUrl;
    }
    const row = { name: String(form.get('name') || '').trim(), description: String(form.get('description') || ''), price: Number(form.get('price') || 0), category: String(form.get('category') || 'General'), stock: Number(form.get('stock') || 0), active: form.get('active') === 'on', image_url };
    const result = editing.id ? await supabase.from('products').update(row).eq('id', editing.id) : await supabase.from('products').insert(row);
    setSaving(false); if (result.error) toast.error(result.error.message); else { toast.success('Product saved'); setEditing(null); await load(); }
  }
  async function createPosOrder() {
    if (!cart.length) { toast.error('Add at least one product'); return; }
    if (posPaymentMethod === 'M-Pesa' && !customer.phone.trim()) { toast.error('Enter the customer phone number to send an M-Pesa prompt'); return; }
    setSaving(true);
    const orderNumber = `POS-${Date.now().toString().slice(-8)}`;
    const effectivePaymentStatus = posPaymentMethod === 'M-Pesa' ? 'pending' : posPaymentStatus;
    const customerName = customer.name.trim() || 'Walk-in customer';
    const order = { order_number: orderNumber, customer_name: customerName, customer_email: customer.email.trim() || null, customer_phone: customer.phone.trim() || null, items: cart.map(({ product, qty }) => ({ id: product.id, name: product.name, price: Number(product.price), quantity: qty, image_url: product.image_url })), total_amount: cartTotal, status: effectivePaymentStatus === 'paid' ? 'paid' : 'pending', payment_status: effectivePaymentStatus, payment_method: posPaymentMethod, source: 'pos', created_by: user?.id ?? null };
    const { error } = await supabase.from('orders').insert(order);
    if (error) { setSaving(false); toast.error(`Could not save sale: ${error.message}`); return; }
    const invoice = { invoiceNumber: orderNumber, customerName, customerEmail: customer.email.trim(), customerPhone: customer.phone.trim(), customerAddress: 'Walk-in sale', items: cart.map(({ product, qty }) => ({ name: product.name, quantity: qty, price: Number(product.price), total: Number(product.price) * qty })), totalAmount: cartTotal, status: effectivePaymentStatus === 'paid' ? 'paid' as const : 'pending' as const };
    try {
      const invoiceRecord = await createInvoice(invoice);
      const { error: linkError } = await supabase.from('orders').update({ invoice_id: invoiceRecord.id }).eq('order_number', orderNumber);
      if (linkError) throw linkError;
    } catch (e) {
      setSaving(false);
      toast.error(e instanceof Error ? `Sale saved, but invoice setup failed: ${e.message}` : 'Sale saved, but invoice setup failed');
      await load();
      return;
    }
    if (invoice.customerEmail) {
      try { await emailInvoice(invoice, effectivePaymentStatus === 'paid' ? 'receipt' : 'invoice'); }
      catch (e) { console.error('POS document email failed:', e); toast.error(e instanceof Error ? `Email failed: ${e.message}` : 'POS document email failed'); }
    }
    if (posPaymentMethod === 'M-Pesa') {
      try {
        const result = await initiateSTKPush(customer.phone, cartTotal, orderNumber, `POS payment ${orderNumber}`);
        if (result.ResponseCode !== '0') throw new Error(result.ResponseDescription || 'PayHero did not accept the payment request');
        setPosPaymentDialog({ orderNumber, customerName, phone: customer.phone, amount: cartTotal, method: 'M-Pesa', status: 'pending', details: `An M-Pesa prompt has been sent to ${customer.phone}. Ask the buyer to check their phone and enter their PIN. Payment status will update automatically.`, invoice });
        void monitorPosPayment(result.CheckoutRequestID, invoice, orderNumber);
        toast.success('M-Pesa prompt sent. Waiting for customer payment…');
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Could not send M-Pesa prompt';
        setPosPaymentDialog({ orderNumber, customerName, phone: customer.phone, amount: cartTotal, method: 'M-Pesa', status: 'error', details: `The sale is saved as unpaid, but the M-Pesa prompt could not be sent: ${message}`, invoice });
        toast.error(message);
      }
    } else {
      const paymentDetails = posPaymentMethod === 'Cash'
        ? `Collect ${money(cartTotal)} from the buyer at the counter.`
        : posPaymentMethod === 'Card'
          ? `Charge ${money(cartTotal)} on the card terminal. Confirm the terminal approves before marking this sale paid.`
          : posPaymentMethod === 'Bank transfer'
            ? (posPaymentInstructions.value || 'Bank transfer details are not configured yet. Add the buyer instructions in the POS payment details field before accepting a transfer.')
            : (posPaymentInstructions.value || 'Follow the payment instructions agreed with the buyer, then confirm receipt here.');
      downloadInvoice(invoice, effectivePaymentStatus === 'paid' ? 'receipt' : 'invoice');
      setPosPaymentDialog({ orderNumber, customerName, phone: customer.phone, amount: cartTotal, method: posPaymentMethod, status: effectivePaymentStatus === 'paid' ? 'completed' : 'pending', details: paymentDetails, invoice });
      toast.success(effectivePaymentStatus === 'paid' ? 'Sale recorded as paid' : 'Sale saved. Confirm payment when received.');
    }
    setSaving(false); setCart([]); setCustomer({ name: 'Walk-in customer', email: '', phone: '' }); await load();
  }
  async function monitorPosPayment(transactionId: string, invoice: Parameters<typeof emailInvoice>[0], orderNumber: string) {
    for (let attempt = 0; attempt < 48; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const { data, error } = await supabase.functions.invoke('payment-status', { body: { transactionId } });
      if (error) continue;
      if (data?.status === 'completed') {
        const receipt = { ...invoice, status: 'paid' as const };
        setPosPaymentDialog(current => current?.orderNumber === orderNumber ? { ...current, status: 'completed', details: 'PayHero confirmed the payment. The order is marked paid and the receipt is ready.' } : current);
        downloadInvoice(receipt, 'receipt');
        if (receipt.customerEmail) try { await emailInvoice(receipt, 'receipt'); } catch (e) { console.error('POS receipt email failed:', e); toast.error(e instanceof Error ? `Receipt email failed: ${e.message}` : 'POS receipt email failed'); }
        toast.success('M-Pesa payment confirmed. Receipt generated.'); await load(); return;
      }
      if (data?.status === 'failed') {
        setPosPaymentDialog(current => current?.orderNumber === orderNumber ? { ...current, status: 'failed', details: 'PayHero reported that this request failed or was cancelled. The sale remains unpaid.' } : current);
        toast.error('M-Pesa payment failed or was cancelled.'); await load(); return;
      }
    }
    setPosPaymentDialog(current => current?.orderNumber === orderNumber && current.status === 'pending' ? { ...current, details: 'No confirmation has arrived yet. Check the buyer’s phone and PayHero status before sending another prompt.' } : current);
    toast('Payment is still awaiting confirmation.');
  }
  async function confirmManualPosPayment() {
    if (!posPaymentDialog || posPaymentDialog.method === 'M-Pesa' || posPaymentDialog.status !== 'pending') return;
    setSaving(true);
    const now = new Date().toISOString();
    const { error: orderError } = await supabase.from('orders').update({ status: 'paid', payment_status: 'paid', updated_at: now }).eq('order_number', posPaymentDialog.orderNumber);
    if (orderError) { setSaving(false); toast.error(`Could not mark sale paid: ${orderError.message}`); return; }
    const { error: invoiceError } = await supabase.from('invoices').update({ status: 'paid', updated_at: now }).eq('invoice_number', posPaymentDialog.orderNumber);
    if (invoiceError) console.error('Could not update POS invoice status:', invoiceError);
    const receipt = { ...posPaymentDialog.invoice, status: 'paid' as const };
    downloadInvoice(receipt, 'receipt');
    if (receipt.customerEmail) try { await emailInvoice(receipt, 'receipt'); } catch (e) { console.error('POS receipt email failed:', e); toast.error(e instanceof Error ? `Receipt email failed: ${e.message}` : 'POS receipt email failed'); }
    setPosPaymentDialog(current => current?.orderNumber === posPaymentDialog.orderNumber ? { ...current, status: 'completed', details: 'Payment received and recorded. The order is marked paid and the receipt is ready.' } : current);
    setSaving(false);
    toast.success('Payment recorded. Receipt generated.');
    await load();
  }
  async function retryPosMpesa() {
    if (!posPaymentDialog || posPaymentDialog.method !== 'M-Pesa' || !posPaymentDialog.phone) return;
    setSaving(true);
    try {
      const result = await initiateSTKPush(posPaymentDialog.phone, posPaymentDialog.amount, posPaymentDialog.orderNumber, `POS payment ${posPaymentDialog.orderNumber}`);
      if (result.ResponseCode !== '0') throw new Error(result.ResponseDescription || 'PayHero did not accept the payment request');
      setPosPaymentDialog(current => current?.orderNumber === posPaymentDialog.orderNumber ? { ...current, status: 'pending', details: `A new M-Pesa prompt has been sent to ${posPaymentDialog.phone}. Ask the buyer to check their phone and enter their PIN.` } : current);
      void monitorPosPayment(result.CheckoutRequestID, posPaymentDialog.invoice, posPaymentDialog.orderNumber);
      toast.success('New M-Pesa prompt sent.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not send M-Pesa prompt';
      setPosPaymentDialog(current => current?.orderNumber === posPaymentDialog.orderNumber ? { ...current, status: 'error', details: `The prompt could not be sent: ${message}` } : current);
      toast.error(message);
    } finally { setSaving(false); }
  }
  async function saveContent(item: Content) {
    const { error } = await supabase.from('site_content').upsert({ key: item.key, label: item.label, value: item.value, updated_at: new Date().toISOString(), updated_by: user?.id ?? null }, { onConflict: 'key' });
    if (error) toast.error(error.message); else { setContent(old => old.some(current => current.key === item.key) ? old.map(current => current.key === item.key ? item : current) : [...old, item]); toast.success('Website content saved'); }
  }
  async function uploadHeroImages(files: File[]) {
    const urls: string[] = [];
    for (const file of files) {
      const safeName = `${Date.now()}-${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const { error } = await supabase.storage.from('site-media').upload(`hero/${safeName}`, file, { upsert: true });
      if (error) { toast.error(`Could not upload ${file.name}: ${error.message}`); continue; }
      const { data } = supabase.storage.from('site-media').getPublicUrl(`hero/${safeName}`);
      urls.push(data.publicUrl);
    }
    if (!urls.length) return;
    setContent(old => old.map(item => {
      if (item.key !== 'hero_images') return item;
      const existing = readHeroUrls(item.value || '');
      return { ...item, value: [...existing, ...urls].join('\n') };
    }));
    toast.success(`${urls.length} hero image${urls.length === 1 ? '' : 's'} uploaded. Save the field to publish.`);
  }
  function removeHeroImage(item: Content, index: number) {
    const urls = readHeroUrls(item.value).filter((_, i) => i !== index);
    setContent(old => old.map(current => current.key === item.key ? { ...current, value: urls.join('\n') } : current));
  }
  function updateContentCard(item: Content, index: number, field: 'title' | 'description', value: string) {
    const cards = readContentCards(item.value);
    cards[index] = { ...cards[index], [field]: value };
    setContent(old => old.map(current => current.key === item.key ? { ...current, value: JSON.stringify(cards) } : current));
  }

  return <div className="min-h-screen bg-[#f5f7f5] text-slate-800 md:flex">
    <aside className="md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col bg-[#102c25] p-5 text-white">
      <div className="flex items-center gap-3 px-2 py-3"><img src="/WhatsApp Image 2025-06-11 at 3.06.35 PM.jpeg" alt="Rebearth logo" className="h-11 w-11 rounded-xl bg-white object-contain p-1"/><div><p className="font-bold tracking-tight">Rebearth</p><p className="text-xs text-emerald-200">Commerce Studio</p></div></div>
      <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-emerald-200">Workspace</p>
      <nav className="space-y-1">{nav.map(item => <button key={item.id} onClick={() => { setSection(item.id); setSearch(''); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${section === item.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-950/30' : 'text-emerald-50/75 hover:bg-white/10 hover:text-white'}`}><item.icon size={18}/>{item.label}</button>)}</nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-2 text-emerald-200"><Activity size={16}/><span className="text-xs font-semibold">Store status</span></div><p className="mt-2 text-sm font-semibold">Connected workspace</p><p className="mt-1 text-xs leading-5 text-white/60">Inventory, orders and site settings</p></div>
      <button onClick={() => void logout()} className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white"><LogOut size={18}/>Sign out</button>
    </aside>
    <main className="min-w-0 flex-1 p-4 sm:p-7 lg:p-9">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Administration / {nav.find(n => n.id === section)?.label}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{section === 'overview' ? 'Good day, ' + (user.name || 'Admin') : nav.find(n => n.id === section)?.label}</h1><p className="mt-1 text-sm text-slate-500">Manage your store from one clear, connected workspace.</p></div><div className="flex items-center gap-3"><button onClick={() => void load()} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-slate-50">Refresh data</button><div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-800">{(user.name || user.email || 'A').slice(0,1).toUpperCase()}</div></div></header>
      {loading ? <div className="rounded-3xl border border-slate-100 bg-white p-16 text-center text-slate-500">Loading your store data…</div> : <>
      {section === 'overview' && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: 'Total orders', value: orders.length, icon: ShoppingCart, tone: 'bg-blue-50 text-blue-700' }, { label: 'Awaiting action', value: pendingOrders, icon: ClipboardList, tone: 'bg-amber-50 text-amber-700' }, { label: 'Recorded revenue', value: money(totalRevenue), icon: Banknote, tone: 'bg-emerald-50 text-emerald-700' }, { label: 'Active products', value: products.filter(p => p.active !== false).length, icon: Box, tone: 'bg-violet-50 text-violet-700' }].map(k => <div key={k.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{k.label}</span><span className={`grid h-10 w-10 place-items-center rounded-xl ${k.tone}`}><k.icon size={19}/></span></div><p className="mt-5 text-2xl font-bold tracking-tight text-slate-900">{k.value}</p><p className="mt-1 text-xs text-slate-400">Live database summary</p></div>)}</div><div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]"><div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Recent orders</h2><p className="mt-1 text-sm text-slate-500">Latest customer and POS activity</p></div><button onClick={() => setSection('orders')} className="text-sm font-semibold text-emerald-700">View all →</button></div><div className="space-y-3">{orders.slice(0,5).map(o => <div key={o.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{o.customer_name}</p><p className="mt-1 text-xs text-slate-500">{o.order_number || o.id.slice(0,8)} · {new Date(o.created_at).toLocaleDateString()}</p></div><div className="text-right"><p className="text-sm font-bold">{money(o.total_amount)}</p><span className="text-xs capitalize text-slate-500">{o.status}</span></div></div>)}{!orders.length && <p className="py-8 text-center text-sm text-slate-400">No orders yet. New orders will appear here.</p>}</div></div><div className="rounded-2xl bg-[#123a30] p-6 text-white shadow-sm"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10"><CreditCard/></div><div><h2 className="font-bold">Quick sale</h2><p className="text-sm text-emerald-100/70">Record an in-person purchase</p></div></div><p className="mt-6 text-sm leading-6 text-emerald-50/75">Use the built-in point of sale to add products, calculate totals and save the order to your store records.</p><button onClick={() => setSection('pos')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 font-bold text-emerald-950 hover:bg-emerald-300"><Plus size={18}/>Start a sale</button><div className="mt-5 border-t border-white/10 pt-4 text-xs text-emerald-100/60">{products.length} products · {orders.length} orders synced</div></div></div></>}
      {section === 'orders' && <div className="rounded-2xl border border-slate-100 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><div><h2 className="font-bold">Order management</h2><p className="mt-1 text-sm text-slate-500">Track orders and update their status.</p></div><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…" className="rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"/></div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{['Order / Customer','Channel','Date','Items','Total','Payment','Status','Update'].map(h=><th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filteredOrders.map(o=><tr key={o.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-bold">{o.order_number || o.id.slice(0,8)}</p><p className="mt-1 text-slate-500">{o.customer_name}</p><p className="text-xs text-slate-400">{o.customer_email || o.customer_phone || ''}</p></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${o.source === 'pos' ? 'bg-violet-50 text-violet-800' : 'bg-blue-50 text-blue-800'}`}>{o.source === 'pos' ? 'Walk-in' : 'Online'}</span></td><td className="px-5 py-4 text-slate-500">{new Date(o.created_at).toLocaleDateString()}</td><td className="px-5 py-4">{Array.isArray(o.items) ? o.items.reduce((n,i)=>n+Number(i.quantity || i.qty || 1),0) : 0}</td><td className="px-5 py-4 font-bold">{money(o.total_amount)}</td><td className="px-5 py-4 text-xs"><span className="block capitalize">{o.payment_method || 'Unspecified'}</span><span className="text-slate-500">{o.payment_status || 'pending'}</span></td><td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-800">{o.status}</span></td><td className="px-5 py-4"><select value={o.status} onChange={e=>void updateOrderStatus(o,e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs"><option value="pending">Pending</option><option value="processing">Processing</option><option value="paid">Paid</option><option value="fulfilled">Fulfilled</option><option value="cancelled">Cancelled</option></select></td></tr>)}</tbody></table>{!filteredOrders.length && <p className="p-10 text-center text-sm text-slate-400">No matching orders found.</p>}</div></div>}
      {section === 'pos' && (
        <div className="grid items-start gap-6 xl:grid-cols-[1.3fr_.8fr]">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="font-bold">Product catalogue</h2><p className="mt-1 text-sm text-slate-500">Select items to add to this sale.</p></div>
              <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">{products.length} items</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.filter(product => product.active !== false).map(product => (
                <button key={product.id} onClick={() => setCart(old => {
                  const line = old.find(item => item.product.id === product.id);
                  return line ? old.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item) : [...old, { product, qty: 1 }];
                })} className="rounded-xl border border-slate-100 p-3 text-left transition hover:border-emerald-400 hover:shadow-md">
                  <div className="mb-3 grid aspect-[4/3] place-items-center overflow-hidden rounded-lg bg-slate-50">{product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover"/> : <Package className="text-slate-300" size={30}/>}</div>
                  <p className="line-clamp-1 text-sm font-semibold">{product.name}</p><p className="mt-1 text-xs text-slate-400">{product.category}</p><p className="mt-2 font-bold text-emerald-800">{money(product.price)}</p>
                </button>
              ))}
            </div>
            {!products.length && <p className="p-8 text-center text-sm text-slate-500">Add products first to use POS.</p>}
          </div>

          <div className="sticky top-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="font-bold">Current sale</h2><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs">{cart.reduce((count, item) => count + item.qty, 0)} items</span></div>
            <div className="mt-4 space-y-3">
              {cart.map(line => (
                <div key={line.product.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{line.product.name}</p><p className="text-xs text-slate-500">{money(line.product.price)} each</p></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCart(old => old.flatMap(item => item.product.id !== line.product.id ? [item] : item.qty > 1 ? [{ ...item, qty: item.qty - 1 }] : []))} className="grid h-7 w-7 place-items-center rounded-lg border">−</button>
                    <span className="w-4 text-center text-sm">{line.qty}</span>
                    <button onClick={() => setCart(old => old.map(item => item.product.id === line.product.id ? { ...item, qty: item.qty + 1 } : item))} className="grid h-7 w-7 place-items-center rounded-lg border">+</button>
                    <button onClick={() => setCart(old => old.filter(item => item.product.id !== line.product.id))} className="ml-1 text-slate-400 hover:text-red-600"><Trash2 size={15}/></button>
                  </div>
                </div>
              ))}
              {!cart.length && <p className="rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-400">Your sale is empty.</p>}
            </div>

            <div className="mt-5 border-t border-dashed border-slate-200 pt-4">
              <label className="mb-1 block text-xs font-semibold text-slate-500">Buyer details</label>
              <input value={customer.name} onChange={event => setCustomer({ ...customer, name: event.target.value })} placeholder="Customer name" className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/>
              <div className="grid grid-cols-2 gap-2">
                <input value={customer.phone} onChange={event => setCustomer({ ...customer, phone: event.target.value })} placeholder="Phone number" className="min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/>
                <input value={customer.email} onChange={event => setCustomer({ ...customer, email: event.target.value })} placeholder="Email for receipt" className="min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"/>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <label className="text-xs font-semibold text-slate-500">Payment method
                <select value={posPaymentMethod} onChange={event => { setPosPaymentMethod(event.target.value); setPosPaymentStatus('pending'); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                  <option>Cash</option><option>M-Pesa</option><option>Bank transfer</option><option>Card</option><option>Other</option>
                </select>
              </label>
              {posPaymentMethod === 'M-Pesa' ? (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900"><p className="font-bold">Automatic confirmation</p><p className="mt-1">An STK prompt will be sent to the buyer. PayHero updates the sale after payment.</p></div>
              ) : (
                <label className="text-xs font-semibold text-slate-500">Payment received?
                  <select value={posPaymentStatus} onChange={event => setPosPaymentStatus(event.target.value as 'pending' | 'paid')} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                    <option value="pending">Awaiting payment</option><option value="paid">Yes, confirmed</option>
                  </select>
                </label>
              )}
            </div>

            {posPaymentMethod === 'M-Pesa' && (
              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                <p className="font-bold">Buyer payment details</p><p className="mt-1">Amount: <strong>{money(cartTotal)}</strong></p>
                <p>Phone: <strong>{customer.phone || 'Enter buyer phone number'}</strong></p>
                <p className="mt-2 text-xs leading-5">The buyer receives a prompt on their phone and enters their M-Pesa PIN. The cashier screen will show when PayHero confirms it.</p>
              </div>
            )}

            {(posPaymentMethod === 'Bank transfer' || posPaymentMethod === 'Other') && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <label className="block text-xs font-semibold text-slate-600">Payment instructions shown to buyer</label>
                <textarea rows={3} value={posPaymentInstructions.value} onChange={event => {
                  const value = event.target.value;
                  setContent(old => old.some(item => item.key === posPaymentInstructions.key)
                    ? old.map(item => item.key === posPaymentInstructions.key ? { ...item, value } : item)
                    : [...old, { ...posPaymentInstructions, value }]);
                }} placeholder="Enter bank name, account or Paybill details and payment reference." className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm"/>
                <button onClick={() => void saveContent(posPaymentInstructions)} className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">Save payment details</button>
              </div>
            )}

            {posPaymentMethod === 'Card' && <p className="mt-4 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-900">Charge the buyer on the card terminal. This POS waits for the cashier to confirm that the terminal approved the payment.</p>}
            <div className="mt-5 flex items-center justify-between"><span className="text-sm text-slate-500">Total due</span><span className="text-2xl font-bold">{money(cartTotal)}</span></div>
            <button disabled={!cart.length || saving} onClick={() => void createPosOrder()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3.5 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"><Banknote size={18}/>{saving ? 'Processing sale…' : posPaymentMethod === 'M-Pesa' ? 'Send M-Pesa prompt' : 'Record sale & show payment details'}</button>
            <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">M-Pesa is marked paid only after PayHero confirms it. For cash, card and bank transfer, confirm receipt before marking paid.</p>
          </div>

          {posPaymentDialog && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4">
              <div role="dialog" aria-modal="true" aria-labelledby="pos-payment-title" className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-start justify-between bg-[#103b30] p-6 text-white">
                  <div><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-200">Rebearth · Point of sale</p><h2 id="pos-payment-title" className="mt-2 text-xl font-bold">Payment details for buyer</h2></div>
                  <button onClick={() => setPosPaymentDialog(null)} aria-label="Close payment details" className="rounded-lg p-2 text-white/80 hover:bg-white/10"><X size={20}/></button>
                </div>
                <div className="space-y-5 p-6">
                  <div className="rounded-2xl bg-emerald-50 p-5 text-center">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Amount due</p>
                    <p className="mt-1 text-4xl font-extrabold tracking-tight text-emerald-950">{money(posPaymentDialog.amount)}</p>
                    <span className={posPaymentDialog.status === 'completed' ? 'mt-3 inline-flex rounded-full bg-emerald-200 px-3 py-1 text-xs font-bold capitalize text-emerald-900' : posPaymentDialog.status === 'failed' || posPaymentDialog.status === 'error' ? 'mt-3 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold capitalize text-red-800' : 'mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold capitalize text-amber-900'}>{posPaymentDialog.status === 'completed' ? 'Paid' : posPaymentDialog.status === 'pending' ? 'Awaiting payment' : posPaymentDialog.status === 'failed' ? 'Payment not confirmed' : 'Prompt could not be sent'}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Payment method</p><p className="mt-1 font-bold">{posPaymentDialog.method}</p></div>
                    <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Order reference</p><p className="mt-1 break-all font-bold">{posPaymentDialog.orderNumber}</p></div>
                    <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Buyer</p><p className="mt-1 font-bold">{posPaymentDialog.customerName}</p></div>
                    {posPaymentDialog.phone && <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Phone</p><p className="mt-1 font-bold">{posPaymentDialog.phone}</p></div>}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-bold text-slate-800">What the buyer should do</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{posPaymentDialog.details}</p></div>
                  {posPaymentDialog.status === 'pending' && posPaymentDialog.method === 'M-Pesa' && <div className="flex items-center gap-2 text-sm font-medium text-emerald-800"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500"/>Checking payment automatically…</div>}
                  {posPaymentDialog.status === 'pending' && posPaymentDialog.method !== 'M-Pesa' && <button disabled={saving} onClick={() => void confirmManualPosPayment()} className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-50">{saving ? 'Recording payment…' : 'Confirm payment received & issue receipt'}</button>}
                  {(posPaymentDialog.status === 'error' || posPaymentDialog.status === 'failed') && posPaymentDialog.method === 'M-Pesa' && <button disabled={saving} onClick={() => void retryPosMpesa()} className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-50">{saving ? 'Sending prompt…' : 'Send another M-Pesa prompt'}</button>}
                  {posPaymentDialog.status === 'completed' && <button onClick={() => downloadInvoice({ ...posPaymentDialog.invoice, status: 'paid' }, 'receipt')} className="w-full rounded-xl border border-emerald-200 px-4 py-3 font-bold text-emerald-800 hover:bg-emerald-50">Download receipt again</button>}
                  <button onClick={() => setPosPaymentDialog(null)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}      {section === 'products' && <div className="rounded-2xl border border-slate-100 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><div><h2 className="font-bold">Product catalogue</h2><p className="mt-1 text-sm text-slate-500">Manage product information and images.</p></div><div className="flex gap-2"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…" className="w-40 rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm sm:w-52"/></div><button onClick={()=>setEditing({id:'',name:'',description:'',price:0,image_url:'',category:'General',stock:0,active:true})} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white"><Plus size={17}/>Add product</button></div></div><div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">{filteredProducts.map(p=><div key={p.id} className="overflow-hidden rounded-2xl border border-slate-100"><div className="grid aspect-[16/9] place-items-center bg-slate-50">{p.image_url?<img src={p.image_url} alt={p.name} className="h-full w-full object-cover"/>:<Package size={32} className="text-slate-300"/>}</div><div className="p-4"><div className="flex items-start justify-between gap-2"><div><p className="font-bold">{p.name}</p><p className="mt-1 text-xs text-slate-500">{p.category} · Stock {p.stock ?? 0}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${p.active!==false?'bg-emerald-50 text-emerald-800':'bg-slate-100 text-slate-500'}`}>{p.active!==false?'Active':'Hidden'}</span></div><p className="mt-3 line-clamp-2 text-sm text-slate-500">{p.description}</p><div className="mt-4 flex items-center justify-between"><span className="font-bold text-emerald-800">{money(p.price)}</span><button onClick={()=>setEditing(p)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50">Edit product</button></div></div></div>)}{!filteredProducts.length&&<p className="col-span-full py-12 text-center text-sm text-slate-400">No products found.</p>}</div></div>}
      {section === 'content' && <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="mb-5"><h2 className="font-bold">Website content editor</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Edit website copy with text fields. Hero images are listed individually so you can remove unwanted images.</p></div>{content.length? <div className="space-y-4">{content.map((item,i)=><div key={item.key} className="rounded-xl border border-slate-100 p-4"><label className="mb-2 block text-sm font-semibold">{item.label || item.key}</label>{item.key === 'hero_images' ? <div className="space-y-2">{readHeroUrls(item.value || '').map((url,index)=><div key={`${url}-${index}`} className="flex items-center gap-3 rounded-lg border border-slate-200 p-2"><img src={url} alt={`Hero image ${index+1}`} className="h-16 w-24 rounded object-cover"/><input aria-label={`Hero image URL ${index+1}`} value={url} onChange={e=>{const urls=readHeroUrls(item.value);urls[index]=e.target.value;setContent(old=>old.map((c,j)=>j===i?{...c,value:urls.join('\n')}:c));}} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"/><button type="button" onClick={()=>removeHeroImage(item,index)} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Remove</button></div>)}{!readHeroUrls(item.value || '').length&&<p className="text-sm text-slate-500">No hero images yet.</p>}</div> : item.key === 'home_features' || item.key === 'home_services' ? <div className="space-y-3">{readContentCards(item.value).map((card:any,index:number)=><div key={index} className="grid gap-2 rounded-lg border border-slate-200 p-3"><input aria-label={`Card ${index+1} title`} value={card.title || ''} onChange={e=>updateContentCard(item,index,'title',e.target.value)} placeholder="Title" className="rounded-lg border border-slate-200 px-3 py-2 text-sm"/><input aria-label={`Card ${index+1} description`} value={card.description || ''} onChange={e=>updateContentCard(item,index,'description',e.target.value)} placeholder="Description" className="rounded-lg border border-slate-200 px-3 py-2 text-sm"/></div>)}</div> : <input value={item.value || ''} onChange={e=>setContent(old=>old.map((c,j)=>j===i?{...c,value:e.target.value}:c))} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"/>}{item.key === 'hero_images' && <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"><ImagePlus size={17}/>Upload multiple hero images<input type="file" accept="image/*" multiple className="ml-auto max-w-48 text-xs" onChange={e=>{const files=Array.from(e.target.files || []);if(files.length)void uploadHeroImages(files);e.currentTarget.value='';}}/></label>}<div className="mt-2 flex justify-end"><button onClick={()=>void saveContent(item)} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Save field</button></div></div>)}</div>:<div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center"><Settings2 className="mx-auto text-slate-300" size={32}/><p className="mt-3 font-semibold">No editable content fields configured yet</p><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Apply the Supabase setup migration to enable editable website copy.</p></div>}</div>}
      </>}
    </main>
    {editing && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"><div className="my-6 w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold">{editing.id?'Edit product':'Add product'}</h2><p className="mt-1 text-sm text-slate-500">Product details are saved to Supabase.</p></div><button onClick={()=>setEditing(null)} className="rounded-xl p-2 hover:bg-slate-100"><X/></button></div><form onSubmit={e=>void saveProduct(e)} className="space-y-4"><div><label className="mb-1 block text-sm font-semibold">Product name</label><input name="name" required defaultValue={editing.name} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/></div><div><label className="mb-1 block text-sm font-semibold">Description</label><textarea name="description" rows={3} defaultValue={editing.description} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/></div><div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-sm font-semibold">Price (KES)</label><input name="price" type="number" min="0" step="0.01" required defaultValue={editing.price} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/></div><div><label className="mb-1 block text-sm font-semibold">Stock quantity</label><input name="stock" type="number" min="0" defaultValue={editing.stock} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/></div></div><div><label className="mb-1 block text-sm font-semibold">Category</label><input name="category" defaultValue={editing.category} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/></div><div><label className="mb-1 block text-sm font-semibold">Image URL (optional)</label><input name="image_url" defaultValue={editing.image_url} placeholder="https://…" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/></div><label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm"><Upload size={17}/><span className="flex-1">Upload product image</span><input name="image_file" type="file" accept="image/*" className="w-40 text-xs"/></label><label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={editing.active!==false} className="h-4 w-4 accent-emerald-700"/>Show this product on the website</label><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={()=>setEditing(null)} className="rounded-xl border px-4 py-2.5 font-semibold">Cancel</button><button disabled={saving} className="rounded-xl bg-emerald-700 px-5 py-2.5 font-bold text-white disabled:opacity-50">{saving?'Saving…':'Save product'}</button></div></form></div></div>}
  </div>;
}
