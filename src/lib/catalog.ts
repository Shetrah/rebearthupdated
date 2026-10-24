import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Product } from '../types';

/** Loads admin-managed products while preserving the original catalogue as a fallback. */
export function useManagedProducts() {
  const [managedProducts, setManagedProducts] = useState<Product[]>([]);
  useEffect(() => {
    let alive = true;
    supabase.from('products').select('id,name,description,price,image_url,category,active').eq('active', true).order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error || !data || !alive) return;
        setManagedProducts(data.map((row: any, index: number) => ({
          id: Number.parseInt(String(row.id).replace(/-/g, '').slice(0, 8), 16) || 100000 + index,
          name: row.name,
          description: row.description || '',
          price: Number(row.price || 0),
          image: row.image_url || '',
          category: row.category || 'General',
        })));
      });
    return () => { alive = false; };
  }, []);
  return managedProducts;
}

export function mergeManagedProducts(original: Product[], managed: Product[]): Product[] {
  if (!managed.length) return original;
  const byName = new Map(managed.map(product => [product.name.trim().toLowerCase(), product]));
  const merged = original.map(product => byName.get(product.name.trim().toLowerCase()) || product);
  const names = new Set(original.map(product => product.name.trim().toLowerCase()));
  managed.forEach(product => { if (!names.has(product.name.trim().toLowerCase())) merged.push(product); });
  return merged;
}
