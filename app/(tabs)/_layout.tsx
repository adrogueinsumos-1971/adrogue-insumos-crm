import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../src/constants';

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

const TabIcon = ({ emoji, label, focused }: TabIconProps) => (
  <View style={[styles.tabItem, focused && styles.tabItemActive]}>
    <Text style={styles.tabEmoji}>{emoji}</Text>
    <Text style={[styles.tabLabel, { color: focused ? COLORS.primary : COLORS.tabInactive }]}>
      {label}
    </Text>
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Inicio" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👥" label="Clientes" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="productos"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📦" label="Productos" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🛒" label="Pedidos" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    height: 72,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    width: 72,
  },
  tabItemActive: {},
  tabEmoji: { fontSize: 22, marginBottom: 3 },
  tabLabel: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
