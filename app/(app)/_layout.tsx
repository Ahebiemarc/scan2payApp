// ============================================================
// File: app/(app)/_layout.tsx - UPDATED STRUCTURE
// Description: Layout for the main application stack, including Tabs and other screens.
// ============================================================
import React from 'react';
import { Stack, Tabs } from 'expo-router'; // Import Stack
import { COLORS } from '@/constants/Colors';

// --- Tabs Layout Component ---
// This component defines the structure of the tabs themselves.
// It's nested inside the main Stack navigator.



// --- Main App Stack Layout ---
// This Stack navigator wraps the Tabs and defines other screens.
export default function AppStackLayout() {
  return (
    <Stack>
        {/* The Tabs navigator is nested inside this Stack 
        <Stack.Screen
            name="(tabs)" // This refers to the directory
            options={{ headerShown: false }} // Hide Stack header for Tabs screen
        />*/}

        {/* Define other screens accessible within the app group */}
        <Stack.Screen
            name="profile" // Corresponds to app/(app)/profile.tsx
            options={{
              headerTitle: 'Modifier le Profil',
              headerShown: true, // Show Stack header for this screen
              headerStyle: { backgroundColor: COLORS.primary }, // Apply header style
              headerTintColor: COLORS.white,
              headerTitleStyle: { fontWeight: 'bold' },
            }}
        />
        <Stack.Screen
            name="notifications" // Corresponds to app/(app)/notifications.tsx
            options={{
              title:"Notifications",
              headerTitle: 'Notifications',
              headerShown: true,
               headerStyle: { backgroundColor: COLORS.primary },
               headerTintColor: COLORS.white,
               headerTitleStyle: { fontWeight: 'bold' },
            }}
        />
        <Stack.Screen
            name="refund" // Corresponds to app/(app)/refund.tsx
            options={{
              headerTitle: 'Demande de Remboursement',
              headerShown: true,
               headerStyle: { backgroundColor: COLORS.primary },
               headerTintColor: COLORS.white,
               headerTitleStyle: { fontWeight: 'bold' },
            }}
        />
        <Stack.Screen
            name="integrations" // Corresponds to app/(app)/integrations.tsx
            options={{
              headerTitle: 'Intégrations',
              headerShown: true,
               headerStyle: { backgroundColor: COLORS.primary },
               headerTintColor: COLORS.white,
               headerTitleStyle: { fontWeight: 'bold' },
            }}
        />
        <Stack.Screen
            name="topup" // Corresponds to app/(app)/topup.tsx
            options={{
              headerTitle: 'Recharger le Compte',
              headerShown: true,
               headerStyle: { backgroundColor: COLORS.primary },
               headerTintColor: COLORS.white,
               headerTitleStyle: { fontWeight: 'bold' },
            }}
        />
        <Stack.Screen
            name="withdraw" // Corresponds to app/(app)/withdraw.tsx
            options={{
              headerTitle: 'Retirer des Fonds',
              headerShown: true,
               headerStyle: { backgroundColor: COLORS.primary },
               headerTintColor: COLORS.white,
               headerTitleStyle: { fontWeight: 'bold' },
            }}
        />
        <Stack.Screen
            name="transaction-detail" // Corresponds to app/(app)/transaction-detail.tsx
            options={{
              headerTitle: 'Détails Transaction',
              headerShown: false, // Modal has its own header/close mechanism
              presentation: 'modal', // Keep as modal
            }}
        />
    </Stack>
  );
}