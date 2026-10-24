import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Product } from '../types';

/** Loads the live product catalogue from Supabase. */
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
  void original;
  return managed;
}
