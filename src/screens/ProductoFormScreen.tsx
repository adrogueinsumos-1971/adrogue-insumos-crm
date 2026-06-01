import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, Text
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { InputField, Button, Divider, Card } from '../components/ui';
import { Select } from '../components/Select';
import { COLORS, SIZES, PRESENTACION_TIPO, PRESENTACION_CANTIDAD, UNIDAD_MEDIDA } from '../constants';
import { productosService } from '../services/productos';
import { Producto } from '../constants/types';
import { formatCurrency } from '../utils';

const EMPTY_FORM = {
  nombre: '',
  presentacion_tipo: 'Bidon' as Producto['presentacion_tipo'],
  presentacion_cantidad: 5 as number,
  unidad_medida: 'Lt' as Producto['unidad_medida'],
  precio_unitario: 0,
  precio_final: 0,
};

export default function ProductoFormScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!params.id;

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [precioUnitarioStr, setPrecioUnitarioStr] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      productosService.getById(params.id!).then(data => {
        if (data) {
          setForm(data);
          setPrecioUnitarioStr(String(data.precio_unitario));
        }
        setInitialLoading(false);
      });
    }
  }, [params.id]);

  // Auto-calculate precio_final
  useEffect(() => {
    const precio_final = form.precio_unitario * form.presentacion_cantidad;
    setForm(prev => ({ ...prev, precio_final }));
  }, [form.precio_unitario, form.presentacion_cantidad]);

  const setField = <K extends keyof typeof EMPTY_FORM>(key: K, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handlePrecioChange = (text: string) => {
    setPrecioUnitarioStr(text);
    const val = parseFloat(text.replace(',', '.')) || 0;
    setField('precio_unitario', val);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (form.precio_unitario <= 0) e.precio_unitario = 'El precio debe ser mayor a 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEditing) {
        await productosService.update(params.id!, form);
        Alert.alert('✅ Éxito', 'Producto actualizado correctamente');
      } else {
        await productosService.create(form);
        Alert.alert('✅ Éxito', 'Producto creado correctamente');
      }
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.container}>
        <Header title={isEditing ? 'Editar Producto' : 'Nuevo Producto'} showBack onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text style={{ color: COLORS.textSecondary }}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={isEditing ? 'Editar Producto' : 'Nuevo Producto'} showBack onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Producto */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>📦 Producto</Text>
            <InputField
              label="Nombre del Producto"
              value={form.nombre}
              onChangeText={v => setField('nombre', v)}
              required
              error={errors.nombre}
              placeholder="Ej: Deterquim MA"
            />
          </View>

          <Divider />

          {/* Presentación */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>🏷 Presentación</Text>
            <Select
              label="Tipo"
              options={PRESENTACION_TIPO}
              value={form.presentacion_tipo}
              onChange={v => setField('presentacion_tipo', v)}
              required
            />
            <Select
              label="Cantidad"
              options={PRESENTACION_CANTIDAD}
              value={form.presentacion_cantidad}
              onChange={v => setField('presentacion_cantidad', v)}
              required
            />
            <Select
              label="Unidad de Medida"
              options={UNIDAD_MEDIDA}
              value={form.unidad_medida}
              onChange={v => setField('unidad_medida', v)}
              required
            />
          </View>

          <Divider />

          {/* Precio */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>💲 Precio</Text>
            <InputField
              label={`Precio por ${form.unidad_medida} ($)`}
              value={precioUnitarioStr}
              onChangeText={handlePrecioChange}
              keyboardType="numeric"
              required
              error={errors.precio_unitario}
              placeholder="5000"
            />

            {/* Preview de cálculo */}
            <Card style={styles.previewCard}>
              <Text style={styles.previewTitle}>Vista previa del producto</Text>
              <Text style={styles.previewNombre}>{form.nombre || 'Nombre del producto'}</Text>
              <Text style={styles.previewPresentacion}>
                {form.presentacion_tipo} {form.presentacion_cantidad} {form.unidad_medida}
              </Text>
              <View style={styles.previewCalc}>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>Precio / {form.unidad_medida}</Text>
                  <Text style={styles.calcValue}>{formatCurrency(form.precio_unitario)}</Text>
                </View>
                <Text style={styles.calcSymbol}>×</Text>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>Cantidad</Text>
                  <Text style={styles.calcValue}>{form.presentacion_cantidad} {form.unidad_medida}</Text>
                </View>
                <View style={styles.calcDivider} />
                <View style={styles.calcRow}>
                  <Text style={styles.totalLabel}>PRECIO FINAL</Text>
                  <Text style={styles.totalValue}>{formatCurrency(form.precio_final)}</Text>
                </View>
              </View>
            </Card>
          </View>

          <View style={styles.actions}>
            <Button title="Cancelar" onPress={() => router.back()} variant="outline" style={{ flex: 1 }} />
            <Button
              title={isEditing ? 'Guardar Cambios' : 'Crear Producto'}
              onPress={handleSave}
              loading={loading}
              style={{ flex: 2 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  sectionLabel: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  previewCard: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginTop: 8,
  },
  previewTitle: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  previewNombre: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  previewPresentacion: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: 16 },
  previewCalc: { gap: 8 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calcLabel: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  calcValue: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  calcSymbol: { textAlign: 'center', fontSize: 18, color: COLORS.textLight, marginVertical: -4 },
  calcDivider: { height: 1, backgroundColor: COLORS.borderColor, marginVertical: 4 },
  totalLabel: { fontSize: SIZES.sm, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },
  totalValue: { fontSize: SIZES.xl, fontWeight: '900', color: COLORS.primary },
  actions: { flexDirection: 'row', gap: 12, padding: SIZES.padding, marginTop: 8 },
});
