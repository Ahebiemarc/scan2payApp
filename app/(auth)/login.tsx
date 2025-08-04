// ============================================================
// File: app/(auth)/login.tsx
// Description: Login Screen.
// ============================================================
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { AxiosError } from 'axios'; // Importez AxiosError pour une meilleure gestion des erreurs d'API

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth(); // Récupérez la fonction signIn du contexte
  const router = useRouter(); // router est importé mais n'est pas utilisé directement pour la navigation post-connexion car c'est géré par RootLayoutNav



  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      // Appel à la fonction signIn du AuthContext avec l'email et le mot de passe
      await signIn({ email, password });
      // La navigation est gérée par l'effet dans RootLayoutNav basé sur l'état d'authentification
    } catch (error) {
      setLoading(false); // Arrête le loader même en cas d'erreur
      console.error("Login attempt failed:", error);
      let errorMessage = "Échec de la connexion. Veuillez réessayer.";

      if (error instanceof AxiosError) {
        // Gérer les erreurs spécifiques de l'API
        if (error.response) {
          // L'API a répondu avec un statut d'erreur (ex: 400, 401, 404)
          if (error.response.status === 400) {
            errorMessage = "Email ou mot de passe incorrect.";
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message; // Message d'erreur personnalisé de l'API
          } else {
            errorMessage = `Erreur du serveur : ${error.response.status}`;
          }
        } else if (error.request) {
          // La requête a été faite mais aucune réponse n'a été reçue (ex: réseau non disponible)
          errorMessage = "Impossible de se connecter au serveur. Vérifiez votre connexion internet.";
        } else {
          // Autre chose s'est passé lors de la configuration de la requête
          errorMessage = `Erreur inattendue : ${error.message}`;
        }
      }

      Alert.alert('Erreur de connexion', errorMessage);
    } finally {
      setLoading(false); // Assurez-vous que le loader s'arrête dans tous les cas
    }
  };

  return (
    <View style={styles.container}>
       <Animated.Image
         entering={FadeInUp.duration(1000).delay(200)}
         source={require('@/assets/images/logo.png')} // Replace with your logo
         style={styles.logo}
         resizeMode="contain"
       />
      <Animated.Text entering={FadeInDown.duration(1000).delay(400)} style={styles.title}>Connexion</Animated.Text>

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
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={COLORS.darkGrey}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(1000).delay(800)} style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(1000).delay(1000)} style={styles.linksContainer}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.replace('/(auth)/forgot-password')} >
            <Text style={styles.linkText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.replace('/(auth)/signup')} >
            <Text style={styles.linkText}>Pas de compte ? S'inscrire</Text>
          </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  logo: {
      width: 120,
      height: 120,
      marginBottom: 30,
      borderRadius: 60, // Make it circular if desired
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 30,
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
    marginBottom: 15,
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
    shadowColor: "#000", // Add shadow for depth
    shadowOffset: {
        width: 0,
        height: 2,
    },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});
