// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { QrCodeProvider } from '@/contexts/QrCodeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { PaymentMethodProvider } from '@/contexts/PaymentMethodContext'; // Vérifiez le chemin
import { PaymentProvider } from '@/contexts/PaymentContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth(); // Hook 1
  const segments = useSegments(); // Hook 2
  const router = useRouter();     // Hook 3

  // --- DÉPLACEZ CE useEffect ICI, AVANT LE RETURN CONDITIONNEL ---
  useEffect(() => { // Hook 4 (maintenant toujours appelé)
    if (!isLoading) {
      SplashScreen.hideAsync();
      console.log("SplashScreen caché.");
    }
  }, [isLoading]);

  // --- DÉPLACEZ CE useEffect ICI, AVANT LE RETURN CONDITIONNEL ---
  useEffect(() => { // Hook 5 (maintenant toujours appelé)
    if (isLoading) {
      console.log("AuthContext isLoading: true. Attente de la fin du chargement.");
      return;
    }

    const currentSegment = segments[0];
    const inAuthGroup = currentSegment === '(auth)';
    console.log("Current Segment:", currentSegment, "isAuthenticated:", isAuthenticated, "inAuthGroup:", inAuthGroup);

    if (!isAuthenticated && !inAuthGroup) {
      console.log("Utilisateur non authentifié, redirection vers /login");
      // Utilisez router.replace pour remplacer l'historique et empêcher le retour
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      console.log("Utilisateur authentifié et dans groupe auth, redirection vers /dashboard");
      router.replace('/(app)/(tabs)/dashboard');
    }
  }, [isAuthenticated, isLoading, segments, router]); // Dépendances importantes

  // --- MAINTENANT LE RETURN CONDITIONNEL EST ICI ---
  if (isLoading) {
    console.log("Affichage de l'indicateur de chargement initial.");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // --- LE JSX PRINCIPAL EST ICI ---
  return (
    <Stack screenOptions={{ headerShown: false }} >
      <Stack.Screen name="(tabs)"  />
      <Stack.Screen name="(app)"/>
      <Stack.Screen name="(auth)"/>
    </Stack>
  );
}

// ... (Le reste de votre fichier _layout.tsx reste inchangé)

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WalletProvider>
      <QrCodeProvider>
        <NotificationProvider>
          <PaymentMethodProvider>
            <PaymentProvider>{children}</PaymentProvider>
          </PaymentMethodProvider>
        </NotificationProvider>
      </QrCodeProvider>
    </WalletProvider>
  );
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProviders>
          <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(500)}>
            <RootLayoutNav />
          </Animated.View>
        </AppProviders>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});