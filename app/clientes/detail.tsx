import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../src/components/Header';
import { Card, Badge, Divider, Button } from '../../src/components/ui';
import { COLORS, SIZES } from '../../src/constants';
import { clientesService } from '../../src/services/clientes';
import { Cliente } from '../../src/constants/types';
import { getIVALabel, formatWhatsApp } from '../../src/utils';

export default function ClienteDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientesService.getById(params.id).then(data => {
      setCliente(data);
      setLoading(false);
    });
  }, [params.id]);

  const handleDelete = () => {
    if (!cliente) return;
    Alert.alert(
      'Eliminar cliente',
      `¿Eliminar a ${cliente.nombre}?\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await clientesService.delete(cliente.id!);
              router.back();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el cliente');
            }
          },
        },
      ]
    );
  };

  if (loading || !cliente) {
    return (
      <View style={styles.container}>
        <Header title="Detalle de Cliente" showBack onBack={() => router.back()} />
        <View style={styles.loading}><Text style={{ color: COLORS.textSecondary }}>Cargando...</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Detalle de Cliente"
        showBack
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity onPress={() => router.push({ pathname: '/clientes/form', params: { id: cliente.id } })}>
            <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '700' }}>Editar</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={{ padding: SIZES.padding, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Header */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{cliente.nombre.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.nombre}>{cliente.nombre}</Text>
          <Badge
            label={getIVALabel(cliente.iva)}
            bgColor={cliente.iva === 'RI' ? COLORS.primary : cliente.iva === 'CF' ? '#7C3AED' : '#64748B'}
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Datos Fiscales */}
        <Card>
          <Text style={styles.sectionTitle}>🏢 Datos Fiscales</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>CUIT</Text><Text style={styles.infoValue}>{cliente.cuit}</Text></View>
          <Divider />
          <View style={styles.infoRow}><Text style={styles.infoLabel}>IVA</Text><Text style={styles.infoValue}>{getIVALabel(cliente.iva)}</Text></View>
        </Card>

        {/* Domicilio */}
        <Card>
          <Text style={styles.sectionTitle}>📍 Domicilio</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Calle</Text><Text style={styles.infoValue}>{cliente.calle} {cliente.altura}</Text></View>
          <Divider />
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Localidad</Text><Text style={styles.infoValue}>{cliente.localidad}</Text></View>
          <Divider />
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Zona</Text><Text style={styles.infoValue}>{cliente.zona}</Text></View>
        </Card>

        {/* Contacto */}
        <Card>
          <Text style={styles.sectionTitle}>👤 Contacto</Text>
          {cliente.contacto_nombre ? (
            <>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Nombre</Text><Text style={styles.infoValue}>{cliente.contacto_nombre}</Text></View>
              <Divider />
            </>
          ) : null}
          {cliente.whatsapp ? (
            <>
              <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(formatWhatsApp(cliente.whatsapp))}>
                <Text style={styles.infoLabel}>WhatsApp</Text>
                <Text style={[styles.infoValue, { color: '#25D366' }]}>📱 {cliente.whatsapp}</Text>
              </TouchableOpacity>
              <Divider />
            </>
          ) : null}
          {cliente.email ? (
            <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`mailto:${cliente.email}`)}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={[styles.infoValue, { color: COLORS.primary }]}>{cliente.email}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ color: COLORS.textLight, fontSize: SIZES.sm }}>Sin datos de contacto</Text>
          )}
        </Card>

        {/* Acciones */}
        <View style={styles.actions}>
          <Button
            title="✏️ Editar"
            onPress={() => router.push({ pathname: '/clientes/form', params: { id: cliente.id } })}
            variant="secondary"
            style={{ flex: 1 }}
          />
          <Button
            title="🗑 Eliminar"
            onPress={handleDelete}
            variant="danger"
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: { color: COLORS.white, fontSize: 36, fontWeight: '900' },
  nombre: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  sectionTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  infoLabel: { fontSize: SIZES.md, color: COLORS.textSecondary },
  infoValue: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right', flex: 1, marginLeft: 16 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
