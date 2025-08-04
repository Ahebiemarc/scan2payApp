// ============================================================
// File: app/(auth)/signup.tsx
// Description: Sign Up Screen with Client/Marchand choice.
// ============================================================
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Checkbox from 'expo-checkbox'; // Import Checkbox
import { useAuth } from '@/contexts/AuthContext'; // Correct path to useAuth
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS } from '@/constants/Colors';
import { AxiosError } from 'axios'; // Import AxiosError for robust error handling

export default function SignUpScreen() {
  // We need to split 'name' into firstName and lastName for RegisterUserDto
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // Changed from 'phone' to 'phoneNumber' to match DTO
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isMarchand, setIsMarchand] = useState(false); // State for checkbox, determines userType
  const [loading, setLoading] = useState(false);

  // Get the 'register' function from AuthContext
  const { register } = useAuth();
  const router = useRouter(); // Router for potential explicit navigation, though RootLayoutNav handles most

  const handleSignUp = async () => {
    // Determine userType based on checkbox
    const userType = isMarchand ? 'Marchand' : 'Client';

    // --- Input Validation ---
    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Alert.alert('Erreur', 'Veuillez entrer une adresse email valide.');
        return;
    }
    // Basic password strength (e.g., min length)
    if (password.length < 6) { // Adjust as per your backend's minimum password length
        Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
        return;
    }

    setLoading(true);

    try {
      // Call the register function from useAuth context
      // Pass the data conforming to RegisterUserDto
      await register({
        firstName,
        lastName,
        email,
        phoneNumber, // Make sure phoneNumber is sent if required by your DTO
        password,
        confirmPassword,
        userType,
      });

      // If registration and automatic sign-in are successful,
      // AuthContext will handle setting the token and user.
      // RootLayoutNav (or similar) will then handle navigation.
      Alert.alert('Succès', `Votre compte ${userType} a été créé avec succès et vous êtes maintenant connecté !`);
      // No explicit router.replace here as RootLayoutNav should handle it.

    } catch (error) {
      setLoading(false); // Stop loading on error
      console.error("Error during registration:", error);

      let errorMessage = "Échec de l'inscription. Veuillez réessayer.";
      if (error instanceof AxiosError) {
        if (error.response) {
          // Server responded with an error (e.g., 400, 409 Conflict for existing user)
          if (error.response.status === 409) {
            errorMessage = "Cette adresse email est déjà enregistrée. Veuillez vous connecter ou utiliser une autre adresse.";
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message; // Use message from API if available
          } else {
            errorMessage = `Erreur du serveur : ${error.response.status}`;
          }
        } else if (error.request) {
          // Request was made but no response received (network error)
          errorMessage = "Impossible de se connecter au serveur. Vérifiez votre connexion internet.";
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = `Erreur inattendue : ${error.message}`;
        }
      }
      Alert.alert('Erreur d\'inscription', errorMessage);
    } finally {
      setLoading(false); // Ensure loading stops in all cases
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Animated.Text entering={FadeInUp.duration(1000).delay(200)} style={styles.title}>Créer un compte</Animated.Text>

        <Animated.View entering={FadeInDown.duration(1000).delay(400)} style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Prénom" // Split 'name' into 'firstName'
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor={COLORS.darkGrey}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Nom" // Split 'name' into 'lastName'
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor={COLORS.darkGrey}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={COLORS.darkGrey}
          />
          <TextInput
            style={styles.input}
            placeholder="Numéro de téléphone"
            value={phoneNumber} // Use phoneNumber as per DTO
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.darkGrey}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={COLORS.darkGrey}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor={COLORS.darkGrey}
          />
        </Animated.View>

        {/* Checkbox for Account Type */}
        <Animated.View entering={FadeInDown.duration(1000).delay(600)} style={styles.checkboxContainer}>
          <Checkbox
            style={styles.checkbox}
            value={isMarchand}
            onValueChange={setIsMarchand}
            color={isMarchand ? COLORS.primary : undefined}
          />
          <Text style={styles.checkboxLabel}>Je suis un Marchand</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(1000).delay(800)} style={styles.buttonContainer}>
          <TouchableOpacity
          activeOpacity={0.8}
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(1000).delay(1000)} style={styles.linksContainer}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.replace('/(auth)/login')} >
              <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
            </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.grey,
    color: COLORS.black,
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-start',
    paddingLeft: 5,
  },
  checkbox: {
    marginRight: 10,
    width: 20,
    height: 20,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.black,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    width: '90%',
    height: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: COLORS.grey,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linksContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});