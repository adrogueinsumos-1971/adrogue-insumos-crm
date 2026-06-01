import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { Button, Card, EmptyState } from '../components/ui';
import { COLORS, SIZES } from '../constants';
import { productosService } from '../services/productos';
import { Producto } from '../constants/types';
import { formatCurrency } from '../utils';

export default function ProductosScreen() {
  const insets = useSafeAreaInsets();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProductos = useCallback(async (q = query) => {
    try {
      const data = q ? await productosService.search(q) : await productosService.getAll();
      setProductos(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { loadProductos(); }, []);

  useEffect(() => {
    const t = setTimeout(() => loadProductos(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProductos();
    setRefreshing(false);
  }, [loadProductos]);

  const handleDelete = (producto: Producto) => {
    Alert.alert(
      'Eliminar producto',
      `¿Eliminar "${producto.nombre}"?\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await productosService.delete(producto.id!);
              setProductos(prev => prev.filter(p => p.id !== producto.id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ]
    );
  };

  const renderProducto = ({ item }: { item: Producto }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Text style={{ fontSize: 26 }}>
            {item.presentacion_tipo === 'Bidon' ? '🥤' :
             item.presentacion_tipo === 'Balde' ? '🪣' :
             item.presentacion_tipo === 'Bolsa' ? '🛍' :
             item.presentacion_tipo === 'Tambor' ? '🛢' : '📦'}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.nombre} numberOfLines={2}>{item.nombre}</Text>
          <Text style={styles.presentacion}>
            {item.presentacion_tipo} · {item.presentacion_cantidad} {item.unidad_medida}
          </Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Precio unitario</Text>
          <Text style={styles.priceValue}>{formatCurrency(item.precio_unitario)}/{item.unidad_medida}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Precio final</Text>
          <Text style={[styles.priceValue, styles.priceFinal]}>{formatCurrency(item.precio_final)}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push({ pathname: '/productos/form', params: { id: item.id } })}
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
        title="Productos"
        rightAction={
          <TouchableOpacity onPress={() => router.push('/productos/form')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ fontSize: 26, color: COLORS.white, fontWeight: '300', lineHeight: 30 }}>＋</Text>
          </TouchableOpacity>
        }
      />
      <View style={[styles.content, { paddingBottom: insets.bottom }]}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar por nombre o presentación..." />

        <View style={styles.statsRow}>
          <Text style={styles.statsText}>{productos.length} producto{productos.length !== 1 ? 's' : ''}</Text>
          <Button title="Nuevo Producto" onPress={() => router.push('/productos/form')} size="sm" style={{ paddingHorizontal: 14 }} />
        </View>

        <FlatList
          data={productos}
          keyExtractor={item => item.id!}
          renderItem={renderProducto}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            loading ? null : (
              <EmptyState
                icon="📦"
                title={query ? 'Sin resultados' : 'Sin productos'}
                subtitle={query ? `No se encontraron productos para "${query}"` : 'Agregá tu primer producto para comenzar'}
                action={!query && <Button title="Agregar Producto" onPress={() => router.push('/productos/form')} style={{ marginTop: 16 }} />}
              />
            )
          }
          contentContainerStyle={productos.length === 0 ? { flex: 1 } : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SIZES.padding },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statsText: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  iconContainer: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  nombre: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  presentacion: { fontSize: SIZES.sm, color: COLORS.textSecondary, fontWeight: '500' },
  priceRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusSm,
    padding: 12,
    marginBottom: 12,
  },
  priceItem: { flex: 1, alignItems: 'center' },
  priceDivider: { width: 1, backgroundColor: COLORS.borderColor },
  priceLabel: { fontSize: SIZES.xs, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
  priceValue: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  priceFinal: { color: COLORS.primary, fontSize: SIZES.lg },
  cardActions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: COLORS.borderColor, paddingTop: 12 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: SIZES.radiusSm, backgroundColor: COLORS.background },
  actionBtnDanger: { backgroundColor: '#FEF2F2' },
  actionBtnText: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },
});
