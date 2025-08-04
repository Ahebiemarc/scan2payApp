// File: app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { COLORS } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'];

          switch (route.name) {
            case 'dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'wallet':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'qr-payment':
              return (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 5,
                    height: 60,
                    width: 60,
                    borderRadius: 30,
                    backgroundColor: COLORS.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                >
                  <Ionicons name="qr-code" size={30} color={COLORS.white} />
                </View>
              );
            case 'history':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              // Fallback sécurisé si un nom de route inconnu arrive
              return <Ionicons name="help-circle-outline" size={size} color={color} />;
          }

          return iconName ? (
            <Ionicons name={iconName} size={size} color={color} />
          ) : null;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.grey,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          height: 65,
          paddingBottom: Platform.OS === 'android' ? 10 : 5, // Plus de marge sur Android
          paddingTop: 5,
          borderTopWidth: 1,
          borderTopColor: COLORS.lightGrey,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 5,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: true,
      })}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Tableau de Bord',
          headerTitle: 'Tableau de Bord',
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Portefeuille',
          headerTitle: 'Portefeuille',
        }}
      />
      <Tabs.Screen
        name="qr-payment"
        options={{
          title: '', // Bouton central sans texte
          headerTitle: 'Paiement QR',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historique',
          headerTitle: 'Historique',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          headerTitle: 'Paramètres',
        }}
      />
    </Tabs>
  );
}
