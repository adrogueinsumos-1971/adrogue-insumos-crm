import { supabase } from './supabase';
import { Producto } from '../constants/types';

export const productosService = {
  async getAll(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Producto | null> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async search(query: string): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .or(`nombre.ilike.%${query}%,presentacion_tipo.ilike.%${query}%`)
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(producto: Omit<Producto, 'id' | 'created_at'>): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .insert(producto)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, producto: Partial<Producto>): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .update(producto)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async count(): Promise<number> {
    const { count, error } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  },
};
