// ============================================================
// File: app/(auth)/forgot-password.tsx
// Description: Forgot Password Screen.
// ============================================================
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS } from '@/constants/Colors';


export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email.');
      return;
    }
    setLoading(true);

    // --- Simulate API Call for Password Reset ---
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Simulating password reset request for:', email);
    // --- End Simulation ---

    setLoading(false);
    Alert.alert('Succès', 'Si un compte existe pour cet email, vous recevrez des instructions pour réinitialiser votre mot de passe.');
    router.back(); // Go back to login screen
  };

  return (
    <View style={styles.container}>
      <Animated.Text entering={FadeInUp.duration(1000).delay(200)} style={styles.title}>Mot de passe oublié</Animated.Text>
      <Animated.Text entering={FadeInUp.duration(1000).delay(400)} style={styles.subtitle}>
        Entrez votre email pour recevoir les instructions de réinitialisation.
      </Animated.Text>

      <Animated.View entering={FadeInDown.duration(1000).delay(600)} style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.darkGrey}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(1000).delay(800)} style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Envoyer</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(1000).delay(1000)} style={styles.linksContainer}>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    </View>
  );
}

// Re-use styles or define separately
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
      fontSize: 16,
      color: COLORS.darkGrey,
      marginBottom: 30,
      textAlign: 'center',
      paddingHorizontal: 10, // Add some padding
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.grey,
    color: COLORS.black,
  },
  buttonContainer: {
      width: '100%',
      alignItems: 'center', // Center button horizontally
      marginBottom: 20,
  },
  button: {
    width: '90%', // Make button slightly less wide
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
    alignItems: 'center', // Center the link
    marginTop: 15,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});