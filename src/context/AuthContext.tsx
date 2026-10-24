import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role?: 'customer' | 'admin';
}
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'role'> & { password: string }) => Promise<{ success: boolean; requiresEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

async function hydrateUser(authUser: any): Promise<User> {
  const meta = authUser.user_metadata || {};
  let profile: any = {};
  const { data } = await supabase.from('profiles').select('full_name,phone,address,role').eq('id', authUser.id).maybeSingle();
  if (data) profile = data;
  return { id: authUser.id, email: authUser.email || '', name: profile.full_name || meta.name || '', phone: profile.phone || meta.phone || '', address: profile.address || meta.address || '', role: profile.role === 'admin' ? 'admin' : 'customer' };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) { const u = await hydrateUser(data.session.user); if (alive) setUser(u); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) { setUser(null); return; }
      // Defer profile query to avoid running Supabase queries inside the auth callback.
      setTimeout(async () => { const u = await hydrateUser(session.user); if (alive) setUser(u); }, 0);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) return false;
    setUser(await hydrateUser(data.user));
    return true;
  };
  const register = async (userData: Omit<User, 'id' | 'role'> & { password: string }) => {
    const { data, error } = await supabase.auth.signUp({ email: userData.email.trim(), password: userData.password, options: { data: { name: userData.name, phone: userData.phone, address: userData.address } } });
    if (error) throw error;
    if (!data.user) throw new Error('Supabase did not return a new user. Check the project signup settings and try again.');

    // With email confirmation enabled, Supabase returns a user but no session.
    // Its security behavior can also return an obfuscated user for duplicate
    // emails, so only report confirmation when an identity was created.
    const wasCreated = (data.user.identities?.length ?? 0) > 0;
    if (!wasCreated) {
      throw new Error('An account may already exist for this email. Try signing in or use a different email address.');
    }
    // A profile write requires an authenticated session under the profiles RLS
    // policy. Keep signup limited to auth metadata when confirmation is pending.
    if (data.session) {
      const profile = { id: data.user.id, full_name: userData.name, phone: userData.phone, address: userData.address, role: 'customer' };
      const { error: profileError } = await supabase.from('profiles').upsert(profile);
      if (profileError) console.error('Could not save profile:', profileError.message);
      setUser({ id: data.user.id, name: userData.name, email: userData.email, phone: userData.phone, address: userData.address, role: 'customer' });
    }
    return { success: true, requiresEmailConfirmation: !data.session };
  };
  const logout = async () => { await supabase.auth.signOut(); setUser(null); };
  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...userData };
    setUser(updated);
    const { error } = await supabase.from('profiles').upsert({ id: user.id, full_name: updated.name, phone: updated.phone, address: updated.address });
    if (error) throw error;
  };
  const resetPassword = async (email: string) => {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) throw error;
  };
  return <AuthContext.Provider value={{ user, login, register, logout, updateProfile, resetPassword, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
};
