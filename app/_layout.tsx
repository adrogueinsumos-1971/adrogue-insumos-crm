import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="clientes/form" options={{ presentation: 'card' }} />
          <Stack.Screen name="clientes/detail" options={{ presentation: 'card' }} />
          <Stack.Screen name="productos/form" options={{ presentation: 'card' }} />
          <Stack.Screen name="pedidos/form" options={{ presentation: 'card' }} />
          <Stack.Screen name="pedidos/detail" options={{ presentation: 'card' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
