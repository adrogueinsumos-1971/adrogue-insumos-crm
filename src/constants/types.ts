export interface Cliente {
  id?: string;
  nombre: string;
  cuit: string;
  iva: 'RI' | 'CF' | 'NO';
  calle: string;
  altura: string;
  localidad: string;
  zona: 'CABA' | 'GBA Norte' | 'GBA Oeste' | 'GBA Sur' | 'La Plata';
  contacto_nombre: string;
  whatsapp: string;
  email: string;
  created_at?: string;
}

export interface Producto {
  id?: string;
  nombre: string;
  presentacion_tipo: 'Bidon' | 'Balde' | 'Bolsa' | 'Pack' | 'Tambor';
  presentacion_cantidad: number;
  unidad_medida: 'Lt' | 'Kg' | 'Un';
  precio_unitario: number;
  precio_final: number;
  created_at?: string;
}

export interface PedidoItem {
  id?: string;
  pedido_id?: string;
  producto_id: string;
  producto?: Producto;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Pedido {
  id?: string;
  numero_pedido?: string;
  cliente_id: string;
  cliente?: Cliente;
  fecha?: string;
  estado: 'Pendiente' | 'Entregado';
  total: number;
  items?: PedidoItem[];
  created_at?: string;
}

export interface DashboardStats {
  totalClientes: number;
  totalProductos: number;
  pedidosPendientes: number;
  pedidosEntregados: number;
  ventasMes: number;
}

export type RootStackParamList = {
  index: undefined;
  clientes: undefined;
  'clientes/form': { cliente?: Cliente };
  'clientes/detail': { id: string };
  productos: undefined;
  'productos/form': { producto?: Producto };
  pedidos: undefined;
  'pedidos/form': { pedido?: Pedido };
  'pedidos/detail': { id: string };
};
