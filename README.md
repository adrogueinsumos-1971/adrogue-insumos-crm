# 📱 Adrogué Insumos CRM

Aplicación móvil de gestión comercial para **Adrogué Insumos**, desarrollada con React Native + Expo y Supabase como backend.

---

## 🏗 Arquitectura del Proyecto

```
adrogue-insumos-crm/
├── app/                        # Expo Router (rutas de pantallas)
│   ├── _layout.tsx             # Layout raíz con navegación
│   ├── (tabs)/                 # Navegación por pestañas
│   │   ├── _layout.tsx         # Configuración de tabs
│   │   ├── index.tsx           # Dashboard
│   │   ├── clientes.tsx        # Lista de clientes
│   │   ├── productos.tsx       # Lista de productos
│   │   └── pedidos.tsx         # Lista de pedidos
│   ├── clientes/
│   │   ├── form.tsx            # Crear/Editar cliente
│   │   └── detail.tsx          # Detalle de cliente
│   ├── productos/
│   │   └── form.tsx            # Crear/Editar producto
│   └── pedidos/
│       ├── form.tsx            # Crear/Editar pedido
│       └── detail.tsx          # Detalle de pedido
├── src/
│   ├── components/             # Componentes reutilizables
│   │   ├── ui.tsx              # Button, Card, Badge, EmptyState, etc.
│   │   ├── Select.tsx          # Selector/Dropdown modal
│   │   ├── SearchBar.tsx       # Barra de búsqueda
│   │   └── Header.tsx          # Header con logo
│   ├── constants/
│   │   ├── index.ts            # Colores, tamaños, opciones de formularios
│   │   └── types.ts            # TypeScript interfaces
│   ├── screens/                # Pantallas principales
│   │   ├── DashboardScreen.tsx
│   │   ├── ClientesScreen.tsx
│   │   ├── ClienteFormScreen.tsx
│   │   ├── ProductosScreen.tsx
│   │   ├── ProductoFormScreen.tsx
│   │   ├── PedidosScreen.tsx
│   │   ├── PedidoFormScreen.tsx
│   │   └── PedidoDetailScreen.tsx
│   ├── services/               # Capa de acceso a datos (Supabase)
│   │   ├── supabase.ts         # Cliente Supabase
│   │   ├── clientes.ts         # CRUD clientes
│   │   ├── productos.ts        # CRUD productos
│   │   └── pedidos.ts          # CRUD pedidos + lógica de negocio
│   └── utils/
│       └── index.ts            # Formateo de moneda, fechas, CUIT, etc.
├── assets/
│   └── logo.png                # Logo Adrogué Insumos
├── supabase/
│   └── schema.sql              # Esquema completo de la base de datos
├── .env.example                # Variables de entorno (plantilla)
├── .gitignore
├── app.json                    # Configuración Expo
├── babel.config.js
├── package.json
└── tsconfig.json
```

---

## ⚙️ Requisitos Previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18.x o superior |
| npm | 9.x o superior |
| Expo CLI | `npm install -g expo-cli` |
| EAS CLI | `npm install -g eas-cli` (para build en iPhone) |
| Xcode | 14+ (solo para compilar en iOS) |
| Cuenta Supabase | [supabase.com](https://supabase.com) |
| Cuenta Expo | [expo.dev](https://expo.dev) |

---

## 🚀 Instalación Paso a Paso

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/adrogue-insumos-crm.git
cd adrogue-insumos-crm
```

### Paso 2 — Instalar dependencias

```bash
npm install
```

### Paso 3 — Configurar Supabase

#### 3.1 Crear el proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear una cuenta
2. Crear un nuevo proyecto (elegir la región más cercana, ej: **South America - São Paulo**)
3. Esperar que el proyecto inicialice (~2 minutos)

#### 3.2 Ejecutar el esquema SQL

1. En el dashboard de Supabase, ir a **SQL Editor**
2. Crear una nueva consulta
3. Pegar el contenido de `supabase/schema.sql`
4. Ejecutar con el botón **Run** (o `Ctrl + Enter`)

#### 3.3 Obtener las credenciales

1. Ir a **Settings → API** en el dashboard de Supabase
2. Copiar:
   - **Project URL** → `https://xxxxxxxxxx.supabase.co`
   - **anon public key** → `eyJ...`

### Paso 4 — Variables de entorno

Copiar el archivo de ejemplo y completar con tus credenciales reales:

```bash
cp .env.example .env
```

Editar `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_AQUI
```

> ⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` a GitHub. Está en `.gitignore`.

### Paso 5 — Configurar autenticación en Supabase

1. En Supabase ir a **Authentication → Settings**
2. Habilitar **Email/Password** como proveedor
3. (Opcional) Deshabilitar la confirmación por email para desarrollo:
   - **Authentication → Settings → Email → Disable email confirmations** ✓

4. Crear el primer usuario en **Authentication → Users → Add user**

### Paso 6 — Ejecutar en modo desarrollo

```bash
npx expo start
```

Esto abre el QR code. Escanear con la app **Expo Go** en el iPhone.

---

## 📱 Compilar para iPhone (IPA / TestFlight)

### Usando EAS Build (recomendado)

```bash
# Login en Expo
eas login

# Configurar EAS (solo la primera vez)
eas build:configure

# Build para iOS (simulador)
eas build --platform ios --profile preview

# Build para TestFlight / App Store
eas build --platform ios --profile production
```

### Usando Xcode localmente

```bash
# Generar el proyecto nativo
npx expo run:ios

# O abrir directamente en Xcode
cd ios && open Adrogue\ Insumos\ CRM.xcworkspace
```

---

## 🔐 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas de Supabase
- Solo usuarios autenticados pueden acceder a los datos
- Las credenciales de Supabase solo se exponen como `EXPO_PUBLIC_*` (anon key, segura para el cliente)
- La `SERVICE_ROLE_KEY` nunca debe estar en el código del cliente
- Todas las operaciones de base de datos pasan por las políticas de RLS

---

## 🔄 Control de Versiones con GitHub

### Inicializar el repositorio

```bash
git init
git add .
git commit -m "feat: initial commit - Adrogué Insumos CRM"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/adrogue-insumos-crm.git
git push -u origin main
```

### Flujo de trabajo recomendado

```bash
# Nueva feature
git checkout -b feat/nombre-feature
git add .
git commit -m "feat: descripción del cambio"
git push origin feat/nombre-feature
# Crear Pull Request en GitHub
```

---

## 📋 Funcionalidades Implementadas

### ✅ Dashboard
- Tarjetas con estadísticas en tiempo real
- Clientes registrados, productos, pedidos pendientes/entregados
- Ventas totales del mes actual
- Accesos rápidos a todas las secciones

### ✅ Módulo Clientes
- Listar, buscar, crear, editar y eliminar clientes
- Búsqueda por nombre, CUIT o localidad
- Confirmación antes de eliminar
- Campos: datos fiscales (CUIT, IVA), domicilio (calle, altura, localidad, zona), contacto (nombre, WhatsApp, email)
- Toque en WhatsApp abre directamente la app

### ✅ Módulo Productos
- Listar, buscar, crear, editar y eliminar productos
- Cálculo automático de precio final: `Precio = $Un × Cantidad`
- Vista previa del cálculo en tiempo real al crear/editar
- Campos: nombre, presentación (tipo, cantidad, unidad), precio

### ✅ Módulo Pedidos
- Listar, filtrar, crear, editar y eliminar pedidos
- Numeración automática: formato `AAMMDD-XX` con contador diario
- Selección de cliente con búsqueda
- Selector de productos con buscador
- Hasta 6 productos por pedido
- Control de cantidad por ítem (botones +/-)
- Cálculo automático de subtotales y total
- Estados: Pendiente / Entregado (cambio con un toque)
- Filtros por estado (Todos / Pendientes / Entregados)
- Vista detalle completa del pedido

---

## 🗺 Roadmap — Futuras Funcionalidades

| Módulo | Descripción |
|---|---|
| 💰 Cotizaciones | Generar y enviar presupuestos por WhatsApp/PDF |
| 🧾 Facturación | Integración con AFIP / factura electrónica |
| 💳 Cobranzas | Seguimiento de pagos y deudas por cliente |
| 📊 Reportes | Gráficos de ventas por zona, producto, período |
| 👥 Multi-usuario | Roles: admin, vendedor, solo-lectura |
| 🔔 Notificaciones | Alertas de pedidos pendientes y vencimientos |
| 📷 Fotos de productos | Galería de imágenes por producto |
| 🗺 Mapa de clientes | Visualización geográfica por zona |

---

## 🐛 Solución de Problemas Comunes

**Error: "supabaseUrl is required"**
→ Verificar que el archivo `.env` existe y tiene los valores correctos

**Error: "Network request failed"**
→ Verificar conexión a internet y que la URL de Supabase es correcta

**Error: "JWT expired"**
→ El token de sesión venció. Cerrar sesión y volver a ingresar

**La app no carga en Expo Go**
→ Asegurarse de estar en la misma red WiFi que la computadora

---

## 📬 Soporte

Para consultas sobre el desarrollo, contactar al equipo de desarrollo.

---

*Adrogué Insumos CRM — Versión 1.0.0*
