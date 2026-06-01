import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity,
  KeyboardAvoidingView, Platform, FlatList, Modal, TextInput
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { Button, Card, Divider } from '../components/ui';
import { Select } from '../components/Select';
import { COLORS, SIZES, MAX_PRODUCTOS_POR_PEDIDO } from '../constants';
import { clientesService } from '../services/clientes';
import { productosService } from '../services/productos';
import { pedidosService } from '../services/pedidos';
import { Cliente, Producto, PedidoItem } from '../constants/types';
import { formatCurrency } from '../utils';

interface ItemForm extends Omit<PedidoItem, 'id' | 'pedido_id'> {
  producto: Producto;
}

export default function PedidoFormScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!params.id;

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [items, setItems] = useState<ItemForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Product picker modal
  const [modalVisible, setModalVisible] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(productSearch.toLowerCase())
  );

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const clienteOptions = clientes.map(c => ({ label: c.nombre, value: c.id! }));

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cs, ps] = await Promise.all([
          clientesService.getAll(),
          productosService.getAll(),
        ]);
        setClientes(cs);
        setProductos(ps);

        if (isEditing) {
          const pedido = await pedidosService.getById(params.id!);
          if (pedido) {
            setClienteId(pedido.cliente_id);
            const loadedItems: ItemForm[] = (pedido.items || []).map(item => ({
              producto_id: item.producto_id,
              producto: item.producto!,
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario,
              subtotal: item.subtotal,
            }));
            setItems(loadedItems);
          }
        }
      } catch (err) {
        Alert.alert('Error', 'No se pudieron cargar los datos');
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, []);

  const addProducto = (producto: Producto) => {
    if (items.length >= MAX_PRODUCTOS_POR_PEDIDO) {
      Alert.alert('Límite alcanzado', `Un pedido puede contener hasta ${MAX_PRODUCTOS_POR_PEDIDO} productos diferentes.`);
      return;
    }
    if (items.find(i => i.producto_id === producto.id)) {
      Alert.alert('Producto duplicado', 'Este producto ya fue agregado al pedido.');
      return;
    }
    const newItem: ItemForm = {
      producto_id: producto.id!,
      producto,
      cantidad: 1,
      precio_unitario: producto.precio_final,
      subtotal: producto.precio_final,
    };
    setItems(prev => [...prev, newItem]);
    setModalVisible(false);
    setProductSearch('');
  };

  const updateCantidad = (index: number, cantidadStr: string) => {
    const cantidad = parseInt(cantidadStr) || 1;
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      return { ...item, cantidad, subtotal: cantidad * item.precio_unitario };
    }));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    if (!clienteId) { Alert.alert('Validación', 'Seleccioná un cliente'); return false; }
    if (items.length === 0) { Alert.alert('Validación', 'Agregá al menos un producto al pedido'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const pedidoData = { cliente_id: clienteId, estado: 'Pendiente' as const, total };
      const itemsData = items.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal,
      }));

      if (isEditing) {
        await pedidosService.update(params.id!, { total }, itemsData);
        Alert.alert('✅ Éxito', 'Pedido actualizado correctamente');
      } else {
        await pedidosService.create(pedidoData, itemsData);
        Alert.alert('✅ Éxito', 'Pedido creado correctamente');
      }
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.container}>
        <Header title={isEditing ? 'Editar Pedido' : 'Nuevo Pedido'} showBack onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text style={{ color: COLORS.textSecondary }}>Cargando datos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={isEditing ? 'Editar Pedido' : 'Nuevo Pedido'} showBack onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Paso 1: Cliente */}
          <View style={styles.section}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}><Text style={styles.stepNumber}>1</Text></View>
              <Text style={styles.sectionLabel}>Seleccionar Cliente</Text>
            </View>
            <Select
              label="Cliente"
              options={clienteOptions}
              value={clienteId}
              onChange={setClienteId}
              required
              searchable
              placeholder="Buscar y seleccionar cliente..."
            />
            {clienteId && clientes.find(c => c.id === clienteId) && (
              <View style={styles.clientePreview}>
                <Text style={styles.clientePreviewNombre}>{clientes.find(c => c.id === clienteId)?.nombre}</Text>
                <Text style={styles.clientePreviewInfo}>
                  {clientes.find(c => c.id === clienteId)?.localidad} · {clientes.find(c => c.id === clienteId)?.zona}
                </Text>
              </View>
            )}
          </View>

          <Divider />

          {/* Paso 2 & 3: Productos */}
          <View style={styles.section}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}><Text style={styles.stepNumber}>2</Text></View>
              <Text style={styles.sectionLabel}>Agregar Productos</Text>
              <Text style={styles.itemCount}>{items.length}/{MAX_PRODUCTOS_POR_PEDIDO}</Text>
            </View>

            {items.length === 0 ? (
              <View style={styles.emptyItems}>
                <Text style={{ fontSize: 32 }}>📦</Text>
                <Text style={styles.emptyItemsText}>Sin productos agregados</Text>
              </View>
            ) : (
              items.map((item, index) => (
                <View key={item.producto_id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemNombre} numberOfLines={2}>{item.producto.nombre}</Text>
                    <Text style={styles.itemPresentacion}>
                      {item.producto.presentacion_tipo} {item.producto.presentacion_cantidad} {item.producto.unidad_medida}
                    </Text>
                    <Text style={styles.itemPrecio}>{formatCurrency(item.precio_unitario)} c/u</Text>
                  </View>

                  <View style={styles.itemCantidad}>
                    <TouchableOpacity
                      style={styles.cantBtn}
                      onPress={() => updateCantidad(index, String(Math.max(1, item.cantidad - 1)))}
                    >
                      <Text style={styles.cantBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.cantValue}>{item.cantidad}</Text>
                    <TouchableOpacity
                      style={styles.cantBtn}
                      onPress={() => updateCantidad(index, String(item.cantidad + 1))}
                    >
                      <Text style={styles.cantBtnText}>＋</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemSubtotal}>
                    <Text style={styles.subtotalValue}>{formatCurrency(item.subtotal)}</Text>
                    <TouchableOpacity onPress={() => removeItem(index)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Text style={styles.removeBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {items.length < MAX_PRODUCTOS_POR_PEDIDO && (
              <TouchableOpacity style={styles.addProductoBtn} onPress={() => setModalVisible(true)}>
                <Text style={styles.addProductoBtnText}>＋ Agregar producto</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Total */}
          {items.length > 0 && (
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total del pedido</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <Button title="Cancelar" onPress={() => router.back()} variant="outline" style={{ flex: 1 }} />
            <Button
              title={isEditing ? 'Guardar Cambios' : 'Crear Pedido'}
              onPress={handleSave}
              loading={loading}
              style={{ flex: 2 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Product Picker Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Producto</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setProductSearch(''); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearch}>
              <TextInput
                value={productSearch}
                onChangeText={setProductSearch}
                placeholder="Buscar producto..."
                placeholderTextColor={COLORS.textLight}
                style={styles.modalSearchInput}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredProductos}
              keyExtractor={item => item.id!}
              renderItem={({ item }) => {
                const alreadyAdded = items.some(i => i.producto_id === item.id);
                return (
                  <TouchableOpacity
                    style={[styles.productOption, alreadyAdded && styles.productOptionDisabled]}
                    onPress={() => !alreadyAdded && addProducto(item)}
                    disabled={alreadyAdded}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.productOptionNombre, alreadyAdded && { color: COLORS.textLight }]}>
                        {item.nombre}
                      </Text>
                      <Text style={styles.productOptionInfo}>
                        {item.presentacion_tipo} {item.presentacion_cantidad} {item.unidad_medida}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.productOptionPrecio}>{formatCurrency(item.precio_final)}</Text>
                      {alreadyAdded && <Text style={styles.alreadyAdded}>Agregado</Text>}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyModal}>
                  <Text style={{ color: COLORS.textSecondary }}>No se encontraron productos</Text>
                </View>
              }
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  stepBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  stepNumber: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: '800' },
  sectionLabel: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  itemCount: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.textSecondary },
  clientePreview: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusSm,
    padding: 12,
    marginTop: 4,
  },
  clientePreviewNombre: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.primary },
  clientePreviewInfo: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  emptyItems: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyItemsText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    gap: 12,
  },
  itemInfo: { flex: 1 },
  itemNombre: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  itemPresentacion: { fontSize: SIZES.xs, color: COLORS.textSecondary },
  itemPrecio: { fontSize: SIZES.xs, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  itemCantidad: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: SIZES.radiusSm,
    overflow: 'hidden',
  },
  cantBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.borderColor },
  cantBtnText: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 22 },
  cantValue: { width: 32, textAlign: 'center', fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  itemSubtotal: { alignItems: 'flex-end', gap: 6 },
  subtotalValue: { fontSize: SIZES.md, fontWeight: '800', color: COLORS.primary },
  removeBtn: { fontSize: 14, color: COLORS.danger, fontWeight: '700' },
  addProductoBtn: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: SIZES.radiusSm,
    padding: 14,
    alignItems: 'center',
  },
  addProductoBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: SIZES.md },
  totalCard: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: SIZES.sm, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  totalValue: { fontSize: SIZES.xxl, fontWeight: '900', color: COLORS.white },
  actions: { flexDirection: 'row', gap: 12, padding: SIZES.padding, marginTop: 8 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  modalTitle: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.textPrimary },
  modalClose: { fontSize: 18, color: COLORS.textSecondary, fontWeight: '600' },
  modalSearch: { padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  modalSearchInput: {
    backgroundColor: COLORS.background, borderRadius: SIZES.radiusSm,
    padding: 12, fontSize: SIZES.md, color: COLORS.textPrimary,
  },
  modalList: { flex: 1 },
  productOption: {
    flexDirection: 'row', alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  productOptionDisabled: { opacity: 0.5 },
  productOptionNombre: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  productOptionInfo: { fontSize: SIZES.xs, color: COLORS.textSecondary },
  productOptionPrecio: { fontSize: SIZES.md, fontWeight: '800', color: COLORS.primary },
  alreadyAdded: { fontSize: SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  emptyModal: { padding: 32, alignItems: 'center' },
});
