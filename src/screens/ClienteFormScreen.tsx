import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, Text
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { InputField, Button, Divider } from '../components/ui';
import { Select } from '../components/Select';
import { COLORS, SIZES, IVA_OPTIONS, ZONA_OPTIONS } from '../constants';
import { clientesService } from '../services/clientes';
import { Cliente } from '../constants/types';

const EMPTY_FORM: Omit<Cliente, 'id' | 'created_at'> = {
  nombre: '',
  cuit: '',
  iva: 'RI',
  calle: '',
  altura: '',
  localidad: '',
  zona: 'GBA Sur',
  contacto_nombre: '',
  whatsapp: '',
  email: '',
};

export default function ClienteFormScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!params.id;

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof Cliente, string>>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      clientesService.getById(params.id!).then(data => {
        if (data) setForm(data);
        setInitialLoading(false);
      });
    }
  }, [params.id]);

  const setField = <K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!form.cuit.trim()) newErrors.cuit = 'El CUIT es requerido';
    if (!form.calle.trim()) newErrors.calle = 'La calle es requerida';
    if (!form.altura.trim()) newErrors.altura = 'La altura es requerida';
    if (!form.localidad.trim()) newErrors.localidad = 'La localidad es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEditing) {
        await clientesService.update(params.id!, form);
        Alert.alert('✅ Éxito', 'Cliente actualizado correctamente');
      } else {
        await clientesService.create(form);
        Alert.alert('✅ Éxito', 'Cliente creado correctamente');
      }
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.container}>
        <Header title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'} showBack onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text style={{ color: COLORS.textSecondary }}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
        showBack
        onBack={() => router.back()}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Datos Fiscales */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>🏢 Datos Fiscales</Text>
            <InputField
              label="Nombre / Razón Social"
              value={form.nombre}
              onChangeText={v => setField('nombre', v)}
              required
              error={errors.nombre}
            />
            <InputField
              label="CUIT"
              value={form.cuit}
              onChangeText={v => setField('cuit', v)}
              keyboardType="numeric"
              placeholder="20-12345678-9"
              required
              error={errors.cuit}
            />
            <Select
              label="Condición IVA"
              options={IVA_OPTIONS}
              value={form.iva}
              onChange={v => setField('iva', v)}
              required
            />
          </View>

          <Divider />

          {/* Domicilio */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>📍 Domicilio</Text>
            <InputField
              label="Calle"
              value={form.calle}
              onChangeText={v => setField('calle', v)}
              required
              error={errors.calle}
            />
            <InputField
              label="Altura / Número"
              value={form.altura}
              onChangeText={v => setField('altura', v)}
              keyboardType="numeric"
              required
              error={errors.altura}
            />
            <InputField
              label="Localidad"
              value={form.localidad}
              onChangeText={v => setField('localidad', v)}
              required
              error={errors.localidad}
            />
            <Select
              label="Zona"
              options={ZONA_OPTIONS}
              value={form.zona}
              onChange={v => setField('zona', v)}
              required
            />
          </View>

          <Divider />

          {/* Contacto */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>👤 Contacto</Text>
            <InputField
              label="Nombre de contacto"
              value={form.contacto_nombre}
              onChangeText={v => setField('contacto_nombre', v)}
            />
            <InputField
              label="WhatsApp"
              value={form.whatsapp}
              onChangeText={v => setField('whatsapp', v)}
              keyboardType="phone-pad"
              placeholder="1112345678"
            />
            <InputField
              label="Email"
              value={form.email}
              onChangeText={v => setField('email', v)}
              keyboardType="email-address"
              placeholder="contacto@empresa.com"
            />
          </View>

          {/* Acciones */}
          <View style={styles.actions}>
            <Button
              title="Cancelar"
              onPress={() => router.back()}
              variant="outline"
              style={{ flex: 1 }}
            />
            <Button
              title={isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
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
  sectionLabel: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: SIZES.padding,
    marginTop: 8,
  },
});
