import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { Button, Card, Badge, EmptyState } from '../components/ui';
import { COLORS, SIZES } from '../constants';
import { clientesService } from '../services/clientes';
import { Cliente } from '../constants/types';
import { getIVALabel } from '../utils';

export default function ClientesScreen() {
  const insets = useSafeAreaInsets();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadClientes = useCallback(async (q = query) => {
    try {
      const data = q ? await clientesService.search(q) : await clientesService.getAll();
      setClientes(data);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { loadClientes(); }, []);

  useEffect(() => {
    const debounce = setTimeout(() => loadClientes(query), 350);
    return () => clearTimeout(debounce);
  }, [query]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadClientes();
    setRefreshing(false);
  }, [loadClientes]);

  const handleDelete = (cliente: Cliente) => {
    Alert.alert(
      'Eliminar cliente',
      `¿Estás seguro que deseas eliminar a ${cliente.nombre}?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await clientesService.delete(cliente.id!);
              setClientes(prev => prev.filter(c => c.id !== cliente.id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el cliente');
            }
          },
        },
      ]
    );
  };

  const renderCliente = ({ item }: { item: Cliente }) => (
    <Card style={styles.clienteCard} onPress={() => router.push({ pathname: '/clientes/detail', params: { id: item.id } })}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.nombre.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.clienteName} numberOfLines={1}>{item.nombre}</Text>
          <Text style={styles.clienteCUIT}>CUIT: {item.cuit}</Text>
        </View>
        <Badge
          label={item.iva}
          bgColor={item.iva === 'RI' ? COLORS.primary : item.iva === 'CF' ? '#7C3AED' : '#64748B'}
        />
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.infoRow}>📍 {item.calle} {item.altura}, {item.localidad} · {item.zona}</Text>
        {item.contacto_nombre && (
          <Text style={styles.infoRow}>👤 {item.contacto_nombre}</Text>
        )}
        {item.whatsapp && (
          <Text style={styles.infoRow}>📱 {item.whatsapp}</Text>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push({ pathname: '/clientes/form', params: { id: item.id } })}
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
        title="Clientes"
        rightAction={
          <TouchableOpacity onPress={() => router.push('/clientes/form')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.addBtn}>＋</Text>
          </TouchableOpacity>
        }
      />
      <View style={[styles.content, { paddingBottom: insets.bottom }]}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nombre, CUIT o localidad..."
        />

        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
          </Text>
          <Button
            title="Nuevo Cliente"
            onPress={() => router.push('/clientes/form')}
            size="sm"
            style={{ paddingHorizontal: 14 }}
          />
        </View>

        <FlatList
          data={clientes}
          keyExtractor={item => item.id!}
          renderItem={renderCliente}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            loading ? null : (
              <EmptyState
                icon="👥"
                title={query ? 'Sin resultados' : 'Sin clientes'}
                subtitle={query ? `No se encontraron clientes para "${query}"` : 'Agregá tu primer cliente para comenzar'}
                action={
                  !query && (
                    <Button
                      title="Agregar Cliente"
                      onPress={() => router.push('/clientes/form')}
                      style={{ marginTop: 16 }}
                    />
                  )
                }
              />
            )
          }
          contentContainerStyle={clientes.length === 0 ? { flex: 1 } : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SIZES.padding },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  addBtn: {
    fontSize: 26,
    color: COLORS.white,
    fontWeight: '300',
    lineHeight: 30,
  },
  clienteCard: { marginBottom: 12 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: '800',
  },
  cardInfo: { flex: 1 },
  clienteName: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  clienteCUIT: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  cardBody: { gap: 4, marginBottom: 12 },
  infoRow: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    paddingTop: 12,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.background,
  },
  actionBtnDanger: {
    backgroundColor: '#FEF2F2',
  },
  actionBtnText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
