export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const generateNumeroPedido = (fecha: Date, secuencial: number): string => {
  const yy = String(fecha.getFullYear()).slice(2);
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  const xx = String(secuencial).padStart(2, '0');
  return `${yy}${mm}${dd}-${xx}`;
};

export const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const formatCUIT = (cuit: string): string => {
  const cleaned = cuit.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
  }
  return cuit;
};

export const formatWhatsApp = (number: string): string => {
  return `https://wa.me/54${number.replace(/\D/g, '')}`;
};

export const getIVALabel = (iva: string): string => {
  const labels: Record<string, string> = {
    RI: 'Resp. Inscripto',
    CF: 'Cons. Final',
    NO: 'No Responsable',
  };
  return labels[iva] || iva;
};

export const getEstadoColor = (estado: string): string => {
  return estado === 'Entregado' ? '#16A34A' : '#D97706';
};
