-- ============================================================
-- ADROGUÉ INSUMOS CRM - Esquema de Base de Datos Supabase
-- Ejecutar en el SQL Editor de Supabase en orden
-- ============================================================

-- ── Extensiones ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Tabla: clientes ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clientes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre        TEXT NOT NULL,
  cuit          TEXT NOT NULL,
  iva           TEXT NOT NULL CHECK (iva IN ('RI', 'CF', 'NO')),
  calle         TEXT NOT NULL,
  altura        TEXT NOT NULL,
  localidad     TEXT NOT NULL,
  zona          TEXT NOT NULL CHECK (zona IN ('CABA', 'GBA Norte', 'GBA Oeste', 'GBA Sur', 'La Plata')),
  contacto_nombre TEXT,
  whatsapp      TEXT,
  email         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla: productos ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.productos (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre                TEXT NOT NULL,
  presentacion_tipo     TEXT NOT NULL CHECK (presentacion_tipo IN ('Bidon', 'Balde', 'Bolsa', 'Pack', 'Tambor')),
  presentacion_cantidad INTEGER NOT NULL CHECK (presentacion_cantidad IN (5, 6, 12, 20, 30, 205)),
  unidad_medida         TEXT NOT NULL CHECK (unidad_medida IN ('Lt', 'Kg', 'Un')),
  precio_unitario       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  precio_final          NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla: pedidos ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pedidos (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_pedido  TEXT NOT NULL UNIQUE,
  cliente_id     UUID NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  fecha          DATE NOT NULL DEFAULT CURRENT_DATE,
  estado         TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Entregado')),
  total          NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla: pedido_items ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pedido_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id       UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  producto_id     UUID NOT NULL REFERENCES public.productos(id) ON DELETE RESTRICT,
  cantidad        INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  precio_unitario NUMERIC(12, 2) NOT NULL,
  subtotal        NUMERIC(12, 2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Máximo 6 productos por pedido (controlado en la app)
  UNIQUE(pedido_id, producto_id)
);

-- ── Índices ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_clientes_nombre     ON public.clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_cuit       ON public.clientes(cuit);
CREATE INDEX IF NOT EXISTS idx_clientes_zona       ON public.clientes(zona);
CREATE INDEX IF NOT EXISTS idx_productos_nombre    ON public.productos(nombre);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente     ON public.pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado      ON public.pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha       ON public.pedidos(fecha);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON public.pedido_items(pedido_id);

-- ── Row Level Security (RLS) ─────────────────────────────────
-- Habilitar RLS en todas las tablas
ALTER TABLE public.clientes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;

-- Políticas: acceso completo para usuarios autenticados
-- (ajustar según roles si se necesita multi-usuario)

CREATE POLICY "Usuarios autenticados pueden ver clientes"
  ON public.clientes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar clientes"
  ON public.clientes FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar clientes"
  ON public.clientes FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar clientes"
  ON public.clientes FOR DELETE
  TO authenticated USING (true);

-- Productos
CREATE POLICY "Usuarios autenticados pueden ver productos"
  ON public.productos FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar productos"
  ON public.productos FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar productos"
  ON public.productos FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar productos"
  ON public.productos FOR DELETE
  TO authenticated USING (true);

-- Pedidos
CREATE POLICY "Usuarios autenticados pueden ver pedidos"
  ON public.pedidos FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar pedidos"
  ON public.pedidos FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar pedidos"
  ON public.pedidos FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar pedidos"
  ON public.pedidos FOR DELETE
  TO authenticated USING (true);

-- Pedido Items
CREATE POLICY "Usuarios autenticados pueden ver pedido_items"
  ON public.pedido_items FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar pedido_items"
  ON public.pedido_items FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar pedido_items"
  ON public.pedido_items FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar pedido_items"
  ON public.pedido_items FOR DELETE
  TO authenticated USING (true);

-- ── Datos de ejemplo (opcional, comentar si no se desea) ─────
/*
INSERT INTO public.clientes (nombre, cuit, iva, calle, altura, localidad, zona, contacto_nombre, whatsapp, email)
VALUES
  ('Distribuidora El Sol S.A.', '30-71234567-8', 'RI', 'Av. Rivadavia', '4521', 'Lomas de Zamora', 'GBA Sur', 'Carlos Pérez', '1145678901', 'ventas@elsol.com.ar'),
  ('Supermercado Don Juan', '20-25678901-3', 'RI', 'Belgrano', '890', 'Adrogué', 'GBA Sur', 'Juan Martínez', '1156789012', 'compras@donjuan.com.ar'),
  ('María García', '27-30123456-7', 'CF', 'Las Flores', '234', 'Monte Grande', 'GBA Sur', 'María García', '1167890123', '');

INSERT INTO public.productos (nombre, presentacion_tipo, presentacion_cantidad, unidad_medida, precio_unitario, precio_final)
VALUES
  ('Deterquim MA', 'Bidon', 5, 'Lt', 5000, 25000),
  ('Lavandina Concentrada', 'Balde', 20, 'Lt', 1200, 24000),
  ('Desengrasante Industrial', 'Tambor', 205, 'Lt', 800, 164000),
  ('Jabón Líquido Premium', 'Bidon', 5, 'Lt', 3500, 17500),
  ('Detergente Multiuso', 'Pack', 6, 'Un', 2800, 16800);
*/

-- ============================================================
-- FIN DEL ESQUEMA
-- ============================================================
