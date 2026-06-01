import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  StyleSheet, TextInput,
} from 'react-native';
import { COLORS, SIZES } from '../constants';

interface Option {
  label: string;
  value: any;
}

interface SelectProps {
  label: string;
  options: Option[];
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label, options, value, onChange, placeholder, required, searchable, error
}) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOption = options.find(o => o.value === value);
  const filtered = searchable
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}{required && <Text style={{ color: COLORS.danger }}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.selector, error && { borderColor: COLORS.danger }]}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={selectedOption ? styles.selectedText : styles.placeholderText}>
          {selectedOption ? selectedOption.label : (placeholder || 'Seleccionar...')}
        </Text>
        <Text style={styles.arrow}>▾</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => { setVisible(false); setSearch(''); }}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>{label}</Text>

            {searchable && (
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar..."
                placeholderTextColor={COLORS.textLight}
                style={styles.searchInput}
                autoFocus
              />
            )}

            <FlatList
              data={filtered}
              keyExtractor={(item, i) => String(item.value ?? i)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                    setSearch('');
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    item.value === value && styles.optionTextSelected,
                  ]}>
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.borderColor,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  selectedText: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  placeholderText: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    flex: 1,
  },
  arrow: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: SIZES.xs,
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    maxHeight: 420,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  searchInput: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  optionSelected: {
    backgroundColor: '#EEF2FF',
  },
  optionText: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  checkmark: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: SIZES.md,
  },
});
