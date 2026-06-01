import { supabase } from './supabase';
import { Cliente } from '../constants/types';

export const clientesService = {
  async getAll(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async search(query: string): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .or(`nombre.ilike.%${query}%,cuit.ilike.%${query}%,localidad.ilike.%${query}%`)
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(cliente: Omit<Cliente, 'id' | 'created_at'>): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async count(): Promise<number> {
    const { count, error } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  },
};
