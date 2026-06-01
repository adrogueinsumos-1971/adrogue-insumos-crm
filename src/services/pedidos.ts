import { supabase } from './supabase';
import { Pedido, PedidoItem } from '../constants/types';
import { generateNumeroPedido, getTodayString } from '../utils';

export const pedidosService = {
  async getNextSecuencial(): Promise<number> {
    const today = getTodayString();
    const { count, error } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .gte('fecha', today)
      .lt('fecha', new Date(new Date(today).getTime() + 86400000).toISOString().split('T')[0]);
    if (error) throw error;
    return (count || 0) + 1;
  },

  async getAll(filters?: {
    clienteId?: string;
    estado?: string;
    fecha?: string;
    query?: string;
  }): Promise<Pedido[]> {
    let query = supabase
      .from('pedidos')
      .select(`
        *,
        cliente:clientes(id, nombre, localidad, zona)
      `)
      .order('created_at', { ascending: false });

    if (filters?.clienteId) {
      query = query.eq('cliente_id', filters.clienteId);
    }
    if (filters?.estado) {
      query = query.eq('estado', filters.estado);
    }
    if (filters?.fecha) {
      query = query.gte('fecha', filters.fecha).lt('fecha', 
        new Date(new Date(filters.fecha).getTime() + 86400000).toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;

    let result = data || [];
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(p =>
        p.numero_pedido?.toLowerCase().includes(q) ||
        p.cliente?.nombre?.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getById(id: string): Promise<Pedido | null> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        cliente:clientes(*),
        items:pedido_items(
          *,
          producto:productos(*)
        )
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(
    pedido: Omit<Pedido, 'id' | 'created_at' | 'numero_pedido' | 'fecha'>,
    items: Omit<PedidoItem, 'id' | 'pedido_id'>[]
  ): Promise<Pedido> {
    const fecha = new Date();
    const secuencial = await this.getNextSecuencial();
    const numero_pedido = generateNumeroPedido(fecha, secuencial);

    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        ...pedido,
        numero_pedido,
        fecha: fecha.toISOString().split('T')[0],
        estado: 'Pendiente',
      })
      .select()
      .single();
    if (pedidoError) throw pedidoError;

    const itemsToInsert = items.map(item => ({
      ...item,
      pedido_id: pedidoData.id,
    }));

    const { error: itemsError } = await supabase
      .from('pedido_items')
      .insert(itemsToInsert);
    if (itemsError) throw itemsError;

    return pedidoData;
  },

  async updateEstado(id: string, estado: 'Pendiente' | 'Entregado'): Promise<void> {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado })
      .eq('id', id);
    if (error) throw error;
  },

  async update(
    id: string,
    pedido: Partial<Pedido>,
    items?: Omit<PedidoItem, 'id' | 'pedido_id'>[]
  ): Promise<void> {
    const { error } = await supabase
      .from('pedidos')
      .update(pedido)
      .eq('id', id);
    if (error) throw error;

    if (items) {
      await supabase.from('pedido_items').delete().eq('pedido_id', id);
      const itemsToInsert = items.map(item => ({ ...item, pedido_id: id }));
      const { error: itemsError } = await supabase.from('pedido_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
    }
  },

  async delete(id: string): Promise<void> {
    await supabase.from('pedido_items').delete().eq('pedido_id', id);
    const { error } = await supabase.from('pedidos').delete().eq('id', id);
    if (error) throw error;
  },

  async getStats(): Promise<{
    pendientes: number;
    entregados: number;
    ventasMes: number;
  }> {
    const now = new Date();
    const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDiaMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('pedidos')
      .select('estado, total, fecha');
    if (error) throw error;

    const pendientes = data?.filter(p => p.estado === 'Pendiente').length || 0;
    const entregados = data?.filter(p => p.estado === 'Entregado').length || 0;
    const ventasMes = data
      ?.filter(p => p.fecha >= primerDiaMes && p.fecha <= ultimoDiaMes)
      .reduce((sum, p) => sum + (p.total || 0), 0) || 0;

    return { pendientes, entregados, ventasMes };
  },
};
