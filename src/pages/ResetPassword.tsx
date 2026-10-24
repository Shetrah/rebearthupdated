import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (password.length < 8) { setError('Use at least 8 characters for your new password.'); return; }
    if (password !== confirm) { setError('The passwords do not match.'); return; }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) { setError(updateError.message); return; }
    setDone(true); toast.success('Password updated successfully.');
    window.setTimeout(() => navigate('/login'), 1600);
  }
  return <div className="flex min-h-[75vh] items-center justify-center bg-gray-50 px-4 py-12"><div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl"><div className="mb-6 text-center"><img src="/WhatsApp%20Image%202025-06-11%20at%203.06.35%20PM.jpeg" alt="Rebearth Solutions" className="mx-auto mb-4 h-16 w-16 rounded-xl object-contain"/><h1 className="text-2xl font-bold text-slate-900">Set a new password</h1><p className="mt-2 text-sm text-slate-500">Choose a new password for your Rebearth account.</p></div>{done?<div className="rounded-xl bg-emerald-50 p-4 text-center text-emerald-800"><CheckCircle2 className="mx-auto mb-2"/><p className="font-semibold">Password updated</p><p className="mt-1 text-sm">Taking you to sign in…</p></div>:<form onSubmit={submit} className="space-y-4">{error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<label className="block text-sm font-semibold text-slate-700">New password<div className="relative mt-1.5"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-emerald-600"/></div></label><label className="block text-sm font-semibold text-slate-700">Confirm new password<div className="relative mt-1.5"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input required type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Enter password again" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-emerald-600"/></div></label><button disabled={busy} className="w-full rounded-xl bg-green-700 py-3 font-bold text-white transition hover:bg-green-800 disabled:opacity-50">{busy?'Updating password…':'Update password'}</button></form>}<p className="mt-6 text-center text-sm text-slate-500"><Link to="/login" className="font-semibold text-green-700 hover:underline">Back to sign in</Link></p></div></div>;
}
