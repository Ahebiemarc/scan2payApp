// ============================================================
// File: app/(tabs)/settings.tsx
// Description: Settings screen with various options.
// ============================================================
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext'; // Assurez-vous que cet import est présent

type AppRoutes =
  | '/(app)/profile'
  | '/(app)/notifications'
  | '/(app)/integrations'

interface SettingsOption {
  id: string;
  title: string;
  icon: string;
  screen: AppRoutes | null; // Peut naviguer vers un écran ou déclencher une action
  action?: () => void; // Action à exécuter si screen est null
  marchandOnly?: boolean; // Indique si l'option est réservée aux marchands
}

export default function SettingsScreen() {
  const { signOut, user } = useAuth(); // Destructurer user du AuthContext
  const router = useRouter();

  // Vérifier si l'utilisateur est un marchand
  const isMarchand = user?.userType === 'Marchand';

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Déconnexion",
          onPress: () => {
            signOut();
            // La navigation vers l'écran de connexion est gérée par l'effet dans RootLayoutNav
          },
          style: "destructive"
        }
      ]
    );
  };

  const settingsOptions: SettingsOption[] = [
    { id: 'profile', title: 'Modifier le Profil', icon: 'person-circle-outline', screen: '/(app)/profile' },
    // Option Sécurité: Si vous avez un écran de sécurité dédié, utilisez-le. Sinon, gardez l'alerte.
    //{ id: 'security', title: 'Sécurité', icon: 'shield-checkmark-outline', screen: '/(app)/security' },
    { id: 'notifications', title: 'Notifications', icon: 'notifications-outline', screen: '/(app)/notifications' },
    { id: 'integrations', title: 'Intégrations', icon: 'briefcase-outline', screen: '/(app)/integrations', marchandOnly: true },
    { id: 'help', title: 'Aide & Support', icon: 'help-circle-outline', screen: null, action: () => Alert.alert("Info", "Écran d'aide à implémenter.") },
    { id: 'about', title: 'À Propos', icon: 'information-circle-outline', screen: null, action: () => Alert.alert("Info", "Scan2Pay v1.0.0 (Simulation)") },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* En-tête avec les infos utilisateur */}
      <View style={styles.userInfoHeader}>
        <Ionicons name="person-circle" size={60} color={COLORS.primary} />
        <View style={styles.userInfoText}>
          {/* Utiliser firstName et lastName pour le nom complet */}
          <Text style={styles.userName}>{`${user?.firstName || 'Utilisateur'} ${user?.lastName || ''}`.trim()}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
          {isMarchand && <Text style={styles.userTypeLabel}>Compte Marchand</Text>}
          {!isMarchand && user && <Text style={styles.userTypeLabel}>Compte Client</Text>}
        </View>
      </View>

      {/* Options de Paramètres */}
      {settingsOptions.map((option, index) => {
        // Cacher les options "marchand seulement" si l'utilisateur n'est pas un marchand
        if (option.marchandOnly && !isMarchand) {
          return null;
        }
        return (
          <Animated.View key={option.id} entering={FadeInRight.duration(500).delay(index * 100)}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                if (option.screen) {
                  router.push(option.screen); // Utiliser router.push pour la navigation
                } else if (option.action) {
                  option.action(); // Exécuter l'action si aucun écran n'est spécifié
                }
              }}
            >
              <Ionicons name={option.icon as any} size={24} color={COLORS.primary} style={styles.optionIcon} />
              <Text style={styles.optionText}>{option.title}</Text>
              <Ionicons name="chevron-forward-outline" size={20} color={COLORS.grey} />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Bouton de Déconnexion */}
      <Animated.View entering={FadeInRight.duration(500).delay(settingsOptions.length * 100)}>
        <TouchableOpacity style={[styles.optionButton, styles.logoutButton]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} style={styles.optionIcon} />
          <Text style={[styles.optionText, styles.logoutText]}>Déconnexion</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  userInfoText: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.darkGrey,
  },
  userTypeLabel: { // Nouveau style pour afficher le type d'utilisateur
    fontSize: 12,
    color: COLORS.darkGrey,
    fontStyle: 'italic',
    marginTop: 2,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    paddingHorizontal: 15,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  logoutButton: {
    marginTop: 30,
    marginBottom: 30,
    borderBottomWidth: 0, // Pas de bordure pour le bouton de déconnexion
    backgroundColor: COLORS.white,
  },
  logoutText: {
    color: COLORS.error,
  }
});