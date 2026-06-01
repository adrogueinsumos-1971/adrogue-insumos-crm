import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert, TouchableOpacity,
  RefreshControl, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { Button, Card, Badge, EmptyState } from '../components/ui';
import { COLORS, SIZES } from '../constants';
import { pedidosService } from '../services/pedidos';
import { Pedido } from '../constants/types';
import { formatCurrency, formatDate, getEstadoColor } from '../utils';

const ESTADOS = [
  { label: 'Todos', value: '' },
  { label: '⏳ Pendientes', value: 'Pendiente' },
  { label: '✅ Entregados', value: 'Entregado' },
];

export default function PedidosScreen() {
  const insets = useSafeAreaInsets();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [query, setQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPedidos = useCallback(async () => {
    try {
      const data = await pedidosService.getAll({ estado: estadoFilter || undefined, query });
      setPedidos(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  }, [estadoFilter, query]);

  useEffect(() => { loadPedidos(); }, [estadoFilter]);

  useEffect(() => {
    const t = setTimeout(() => loadPedidos(), 350);
    return () => clearTimeout(t);
  }, [query]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPedidos();
    setRefreshing(false);
  }, [loadPedidos]);

  const handleDelete = (pedido: Pedido) => {
    Alert.alert(
      'Eliminar pedido',
      `¿Eliminar el pedido ${pedido.numero_pedido}?\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await pedidosService.delete(pedido.id!);
              setPedidos(prev => prev.filter(p => p.id !== pedido.id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el pedido');
            }
          },
        },
      ]
    );
  };

  const handleToggleEstado = async (pedido: Pedido) => {
    const nuevoEstado = pedido.estado === 'Pendiente' ? 'Entregado' : 'Pendiente';
    Alert.alert(
      'Cambiar estado',
      `¿Marcar el pedido ${pedido.numero_pedido} como "${nuevoEstado}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await pedidosService.updateEstado(pedido.id!, nuevoEstado);
              setPedidos(prev => prev.map(p => p.id === pedido.id ? { ...p, estado: nuevoEstado } : p));
            } catch {
              Alert.alert('Error', 'No se pudo actualizar el estado');
            }
          },
        },
      ]
    );
  };

  const renderPedido = ({ item }: { item: Pedido }) => (
    <Card style={styles.card} onPress={() => router.push({ pathname: '/pedidos/detail', params: { id: item.id } })}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.numeroPedido}>#{item.numero_pedido}</Text>
          <Text style={styles.fecha}>{item.fecha ? formatDate(item.fecha) : ''}</Text>
        </View>
        <TouchableOpacity
          style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) + '20', borderColor: getEstadoColor(item.estado) }]}
          onPress={() => handleToggleEstado(item)}
        >
          <Text style={[styles.estadoText, { color: getEstadoColor(item.estado) }]}>
            {item.estado === 'Pendiente' ? '⏳' : '✅'} {item.estado}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.clienteRow}>
        <Text style={styles.clienteIcon}>🏢</Text>
        <Text style={styles.clienteNombre} numberOfLines={1}>
          {item.cliente?.nombre || 'Cliente'}
        </Text>
      </View>

      {item.cliente?.zona && (
        <Text style={styles.zona}>📍 {item.cliente.localidad} · {item.cliente.zona}</Text>
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total del pedido</Text>
        <Text style={styles.totalValue}>{formatCurrency(item.total)}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push({ pathname: '/pedidos/form', params: { id: item.id } })}
        >
          <Text style={styles.actionBtnText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={() => handleDelete(item)}>
          <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>🗑 Eliminar</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Pedidos"
        rightAction={
          <TouchableOpacity onPress={() => router.push('/pedidos/form')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ fontSize: 26, color: COLORS.white, fontWeight: '300', lineHeight: 30 }}>＋</Text>
          </TouchableOpacity>
        }
      />
      <View style={[styles.content, { paddingBottom: insets.bottom }]}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar por número o cliente..." />

        {/* Estado filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
          {ESTADOS.map(e => (
            <TouchableOpacity
              key={e.value}
              style={[styles.filterChip, estadoFilter === e.value && styles.filterChipActive]}
              onPress={() => setEstadoFilter(e.value)}
            >
              <Text style={[styles.filterChipText, estadoFilter === e.value && styles.filterChipTextActive]}>
                {e.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.statsRow}>
          <Text style={styles.statsText}>{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}</Text>
          <Button title="Nuevo Pedido" onPress={() => router.push('/pedidos/form')} size="sm" style={{ paddingHorizontal: 14 }} />
        </View>

        <FlatList
          data={pedidos}
          keyExtractor={item => item.id!}
          renderItem={renderPedido}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            loading ? null : (
              <EmptyState
                icon="🛒"
                title={query ? 'Sin resultados' : 'Sin pedidos'}
                subtitle={query ? `No se encontraron pedidos para "${query}"` : 'Creá tu primer pedido'}
                action={!query && <Button title="Nuevo Pedido" onPress={() => router.push('/pedidos/form')} style={{ marginTop: 16 }} />}
              />
            )
          }
          contentContainerStyle={pedidos.length === 0 ? { flex: 1 } : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SIZES.padding },
  filterRow: { marginBottom: 12, marginLeft: -4 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: COLORS.borderColor, backgroundColor: COLORS.white,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  filterChipTextActive: { color: COLORS.white },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statsText: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  numeroPedido: { fontSize: SIZES.base, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 0.5 },
  fecha: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  estadoBadge: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1.5,
  },
  estadoText: { fontSize: SIZES.xs, fontWeight: '700' },
  clienteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  clienteIcon: { fontSize: 14 },
  clienteNombre: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  zona: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginBottom: 12 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: SIZES.radiusSm,
    padding: 12, marginBottom: 12,
  },
  totalLabel: { fontSize: SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  totalValue: { fontSize: SIZES.lg, fontWeight: '900', color: COLORS.primary },
  cardActions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: COLORS.borderColor, paddingTop: 12 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: SIZES.radiusSm, backgroundColor: COLORS.background },
  actionBtnDanger: { backgroundColor: '#FEF2F2' },
  actionBtnText: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },
});
