import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { Button, Card, Badge, Divider } from '../components/ui';
import { COLORS, SIZES } from '../constants';
import { pedidosService } from '../services/pedidos';
import { Pedido } from '../constants/types';
import { formatCurrency, formatDate, getEstadoColor } from '../utils';

export default function PedidoDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingEstado, setUpdatingEstado] = useState(false);

  useEffect(() => {
    pedidosService.getById(params.id).then(data => {
      setPedido(data);
      setLoading(false);
    });
  }, [params.id]);

  const handleToggleEstado = async () => {
    if (!pedido) return;
    const nuevoEstado = pedido.estado === 'Pendiente' ? 'Entregado' : 'Pendiente';
    Alert.alert(
      'Cambiar estado',
      `¿Marcar como "${nuevoEstado}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setUpdatingEstado(true);
            try {
              await pedidosService.updateEstado(pedido.id!, nuevoEstado);
              setPedido(prev => prev ? { ...prev, estado: nuevoEstado } : null);
            } catch {
              Alert.alert('Error', 'No se pudo actualizar el estado');
            } finally {
              setUpdatingEstado(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !pedido) {
    return (
      <View style={styles.container}>
        <Header title="Detalle de Pedido" showBack onBack={() => router.back()} />
        <View style={styles.loading}>
          <Text style={{ color: COLORS.textSecondary }}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={`Pedido ${pedido.numero_pedido}`}
        showBack
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity onPress={() => router.push({ pathname: '/pedidos/form', params: { id: pedido.id } })}>
            <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '700' }}>Editar</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Estado Header */}
        <View style={[styles.estadoHeader, { backgroundColor: getEstadoColor(pedido.estado) }]}>
          <Text style={styles.estadoIcon}>{pedido.estado === 'Pendiente' ? '⏳' : '✅'}</Text>
          <View>
            <Text style={styles.estadoLabel}>Estado del pedido</Text>
            <Text style={styles.estadoValue}>{pedido.estado}</Text>
          </View>
          <Button
            title={pedido.estado === 'Pendiente' ? 'Marcar Entregado' : 'Marcar Pendiente'}
            onPress={handleToggleEstado}
            loading={updatingEstado}
            variant="outline"
            size="sm"
            style={{ borderColor: COLORS.white, marginLeft: 'auto' }}
          />
        </View>

        {/* Info del pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Información del Pedido</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Número</Text>
            <Text style={styles.infoValue}>#{pedido.numero_pedido}</Text>
          </View>
          <Divider />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoValue}>{pedido.fecha ? formatDate(pedido.fecha) : '—'}</Text>
          </View>
        </View>

        {/* Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 Cliente</Text>
          <Text style={styles.clienteNombre}>{pedido.cliente?.nombre}</Text>
          <Text style={styles.clienteInfo}>CUIT: {pedido.cliente?.cuit}</Text>
          <Text style={styles.clienteInfo}>
            {pedido.cliente?.calle} {pedido.cliente?.altura}, {pedido.cliente?.localidad}
          </Text>
          <Text style={styles.clienteInfo}>Zona: {pedido.cliente?.zona}</Text>
          {pedido.cliente?.contacto_nombre && (
            <Text style={styles.clienteInfo}>Contacto: {pedido.cliente.contacto_nombre}</Text>
          )}
          {pedido.cliente?.whatsapp && (
            <Text style={styles.clienteInfo}>📱 {pedido.cliente.whatsapp}</Text>
          )}
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Productos ({pedido.items?.length || 0})</Text>
          {(pedido.items || []).map((item, index) => (
            <View key={item.id} style={[styles.itemRow, index > 0 && { borderTopWidth: 1, borderTopColor: COLORS.borderColor }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemNombre}>{item.producto?.nombre}</Text>
                <Text style={styles.itemPresentacion}>
                  {item.producto?.presentacion_tipo} {item.producto?.presentacion_cantidad} {item.producto?.unidad_medida}
                </Text>
                <Text style={styles.itemPrecioU}>
                  {formatCurrency(item.precio_unitario)} × {item.cantidad} unidades
                </Text>
              </View>
              <Text style={styles.itemSubtotal}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{formatCurrency(pedido.total)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  estadoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: SIZES.padding,
    margin: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  estadoIcon: { fontSize: 32 },
  estadoLabel: { fontSize: SIZES.xs, color: COLORS.white, opacity: 0.8, fontWeight: '600' },
  estadoValue: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.white },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { fontSize: SIZES.md, color: COLORS.textSecondary },
  infoValue: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  clienteNombre: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.primary, marginBottom: 8 },
  clienteInfo: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: 4 },
  itemRow: { paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemNombre: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  itemPresentacion: { fontSize: SIZES.xs, color: COLORS.textSecondary },
  itemPrecioU: { fontSize: SIZES.xs, color: COLORS.primary, marginTop: 2 },
  itemSubtotal: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.primary },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 2, borderTopColor: COLORS.primary,
  },
  totalLabel: { fontSize: SIZES.sm, fontWeight: '800', color: COLORS.primary, letterSpacing: 1 },
  totalValue: { fontSize: SIZES.xxl, fontWeight: '900', color: COLORS.primary },
});
