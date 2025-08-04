
// ============================================================
// Placeholder Screens - UPDATED
// ============================================================

// File: app/(app)/profile.tsx - UPDATED
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS } from '@/constants/Colors'; // Adjust path
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth(); // Get user details
  const router = useRouter();
  const [name, setName] = useState(user?.firstName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(''); // Add phone state if needed
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle profile update
  const handleUpdateProfile = async () => {
      if (!name || !email) {
          Alert.alert("Erreur", "Le nom et l'email sont requis.");
          return;
      }
      setLoading(true);
      // --- Simulate API Call for Profile Update ---
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Simulating profile update:", { name, email, phone });
      // Update user context if API call is successful (in real app)
      // Example: updateUserContext({ name, email });
      setLoading(false);
      Alert.alert("Succès", "Profil mis à jour.");
      // Optionally navigate back or stay
      // router.back();
  };

  // Handle password change
  const handleChangePassword = async () => {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
          Alert.alert("Erreur", "Veuillez remplir tous les champs de mot de passe.");
          return;
      }
      if (newPassword !== confirmNewPassword) {
          Alert.alert("Erreur", "Les nouveaux mots de passe ne correspondent pas.");
          return;
      }
      if (newPassword.length < 6) { // Example validation
           Alert.alert("Erreur", "Le nouveau mot de passe doit contenir au moins 6 caractères.");
           return;
      }
       setLoading(true);
      // --- Simulate API Call for Password Change ---
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Simulating password change...");
      // Check if currentPassword is correct via API
      setLoading(false);
      Alert.alert("Succès", "Mot de passe modifié.");
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInUp.duration(500)}>

            {/* Profile Information Section */}
            <Text style={styles.sectionTitle}>Informations Personnelles</Text>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom complet</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Votre nom complet"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor={COLORS.darkGrey}
                    autoComplete='name'
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Votre adresse email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={COLORS.darkGrey}
                    autoComplete='email'
                    editable={false} // Typically email is not editable directly
                />
                 <Text style={styles.readOnlyInfo}>(Non modifiable)</Text>
            </View>
             <View style={styles.inputGroup}>
                <Text style={styles.label}>Numéro de téléphone (Optionnel)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Votre numéro de téléphone"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor={COLORS.darkGrey}
                    autoComplete='tel'
                />
            </View>
            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleUpdateProfile}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Mettre à jour le profil</Text>}
            </TouchableOpacity>

            {/* Change Password Section */}
            <Text style={styles.sectionTitle}>Changer le Mot de Passe</Text>
             <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe actuel</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Entrez votre mot de passe actuel"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                    placeholderTextColor={COLORS.darkGrey}
                    autoComplete='password'
                />
            </View>
             <View style={styles.inputGroup}>
                <Text style={styles.label}>Nouveau mot de passe</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Entrez votre nouveau mot de passe"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholderTextColor={COLORS.darkGrey}
                     autoComplete='password-new'
                />
            </View>
             <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Confirmez votre nouveau mot de passe"
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    secureTextEntry
                    placeholderTextColor={COLORS.darkGrey}
                />
            </View>
             <TouchableOpacity
                style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]}
                onPress={handleChangePassword}
                disabled={loading}
            >
                 {loading ? <ActivityIndicator color={COLORS.primary} /> : <Text style={[styles.buttonText, styles.secondaryButtonText]}>Changer le mot de passe</Text>}
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
    contentContainer: {
        padding: 20,
        paddingBottom: 40, // Extra padding at bottom
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginTop: 25,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGrey,
        paddingBottom: 5,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: COLORS.darkGrey,
        marginBottom: 5,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: COLORS.white, // White background for inputs
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.grey,
        color: COLORS.black,
    },
     readOnlyInfo: {
        fontSize: 12,
        color: COLORS.darkGrey,
        marginTop: 3,
        fontStyle: 'italic',
        marginLeft: 5,
    },
    button: {
        width: '100%', // Full width button
        height: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 10, // Margin top for spacing
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    secondaryButton: {
        backgroundColor: COLORS.white, // White background
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    buttonDisabled: {
        backgroundColor: COLORS.grey,
        borderColor: COLORS.grey, // Also change border color when disabled
        elevation: 0, // Remove shadow when disabled
        shadowOpacity: 0,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButtonText: {
        color: COLORS.primary, // Primary color text
    },
});