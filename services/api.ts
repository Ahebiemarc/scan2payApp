import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Remplacez par l'URL de base de votre API.
// Utilisez votre adresse IP locale pour les tests sur appareil physique.
// `10.0.2.2` pour l'émulateur Android. `localhost` pour iOS.
const API_BASE_URL = 'http://192.168.1.126:5150/api'; // Mettez l'URL de votre API .NET ici

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête authentifiée
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;