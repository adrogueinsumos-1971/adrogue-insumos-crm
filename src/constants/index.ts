export const COLORS = {
  // Primarios
  primary: '#0B1F3A',       // Azul oscuro corporativo
  primaryLight: '#1A3A6B',  // Azul medio
  accent: '#C8102E',        // Rojo Adrogué (del logo)
  
  // Neutros
  white: '#FFFFFF',
  background: '#F4F6F9',
  cardBg: '#FFFFFF',
  borderColor: '#E2E8F0',
  
  // Texto
  textPrimary: '#0B1F3A',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textWhite: '#FFFFFF',

  // Estados
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',

  // Tabs
  tabActive: '#0B1F3A',
  tabInactive: '#94A3B8',

  // Estados de pedidos
  pending: '#D97706',
  delivered: '#16A34A',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Spacing
  padding: 16,
  margin: 16,
  radius: 12,
  radiusSm: 8,
  radiusLg: 20,
};

export const IVA_OPTIONS = [
  { label: 'Responsable Inscripto', value: 'RI' },
  { label: 'Consumidor Final', value: 'CF' },
  { label: 'No Responsable', value: 'NO' },
];

export const ZONA_OPTIONS = [
  { label: 'CABA', value: 'CABA' },
  { label: 'GBA Norte', value: 'GBA Norte' },
  { label: 'GBA Oeste', value: 'GBA Oeste' },
  { label: 'GBA Sur', value: 'GBA Sur' },
  { label: 'La Plata', value: 'La Plata' },
];

export const PRESENTACION_TIPO = [
  { label: 'Bidón', value: 'Bidon' },
  { label: 'Balde', value: 'Balde' },
  { label: 'Bolsa', value: 'Bolsa' },
  { label: 'Pack', value: 'Pack' },
  { label: 'Tambor', value: 'Tambor' },
];

export const PRESENTACION_CANTIDAD = [
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '12', value: 12 },
  { label: '20', value: 20 },
  { label: '30', value: 30 },
  { label: '205', value: 205 },
];

export const UNIDAD_MEDIDA = [
  { label: 'Lt', value: 'Lt' },
  { label: 'Kg', value: 'Kg' },
  { label: 'Un', value: 'Un' },
];

export const ESTADO_PEDIDO = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'Entregado', value: 'Entregado' },
];

export const MAX_PRODUCTOS_POR_PEDIDO = 6;
