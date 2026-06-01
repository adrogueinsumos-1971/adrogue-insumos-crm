import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Header } from '../components/Header';
import { Card } from '../components/ui';
import { COLORS, SIZES } from '../constants';
import { clientesService } from '../services/clientes';
import { productosService } from '../services/productos';
import { pedidosService } from '../services/pedidos';
import { formatCurrency } from '../utils';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, onPress }) => (
  <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress} activeOpacity={0.85}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.quickActionIcon}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({
    clientes: 0,
    productos: 0,
    pendientes: 0,
    entregados: 0,
    ventasMes: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const [clientes, productos, pedidoStats] = await Promise.all([
        clientesService.count(),
        productosService.count(),
        pedidosService.getStats(),
      ]);
      setStats({
        clientes,
        productos,
        pendientes: pedidoStats.pendientes,
        entregados: pedidoStats.entregados,
        ventasMes: pedidoStats.ventasMes,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Buenos días' : now.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';
  const monthName = now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      <Header showLogo />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 16 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.greetingSubtitle}>Panel de control · {now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>

        {/* Ventas del Mes - hero card */}
        <Card style={styles.heroCard}>
          <Text style={styles.heroLabel}>💰 Ventas del mes de {monthName}</Text>
          <Text style={styles.heroValue}>{formatCurrency(stats.ventasMes)}</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>
              {stats.pendientes + stats.entregados} pedidos en total
            </Text>
          </View>
        </Card>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="👥"
            label="Clientes"
            value={loading ? '—' : stats.clientes}
            color={COLORS.primaryLight}
            onPress={() => router.push('/(tabs)/clientes')}
          />
          <StatCard
            icon="📦"
            label="Productos"
            value={loading ? '—' : stats.productos}
            color="#7C3AED"
            onPress={() => router.push('/(tabs)/productos')}
          />
          <StatCard
            icon="⏳"
            label="Pendientes"
            value={loading ? '—' : stats.pendientes}
            color={COLORS.warning}
            onPress={() => router.push('/(tabs)/pedidos')}
          />
          <StatCard
            icon="✅"
            label="Entregados"
            value={loading ? '—' : stats.entregados}
            color={COLORS.success}
            onPress={() => router.push('/(tabs)/pedidos')}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            icon="➕"
            label="Nuevo Cliente"
            onPress={() => router.push('/clientes/form')}
          />
          <QuickAction
            icon="📦"
            label="Nuevo Producto"
            onPress={() => router.push('/productos/form')}
          />
          <QuickAction
            icon="🛒"
            label="Nuevo Pedido"
            onPress={() => router.push('/pedidos/form')}
          />
          <QuickAction
            icon="📋"
            label="Ver Pedidos"
            onPress={() => router.push('/(tabs)/pedidos')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SIZES.padding },
  greetingSection: { marginBottom: 20 },
  greeting: {
    fontSize: SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    marginBottom: 24,
    borderRadius: SIZES.radiusLg,
    padding: 24,
  },
  heroLabel: {
    fontSize: SIZES.sm,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  heroValue: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -1,
    marginBottom: 12,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  heroBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    width: '47%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionLabel: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});
