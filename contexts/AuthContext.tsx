// Description: Provider pour gérer l'état d'authentification et les services de profil.
// ============================================================
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  AuthResponseDto,
  LoginUserDto,
  RegisterUserDto,
  UpdateUserProfileDto,
  ChangePasswordDto,
} from '../types/dto';
import { authService } from '../services/auth.service';
import api from '../services/api';
import { AxiosError } from 'axios';

type AuthContextType = {
  isAuthenticated: boolean; // Indique si un utilisateur est actuellement connecté

  signIn: (loginData: LoginUserDto) => Promise<void>;
  signOut: () => Promise<void>;
  register: (registerData: RegisterUserDto) => Promise<AuthResponseDto>;
  updateProfile: (profileData: UpdateUserProfileDto) => Promise<void>;
  changePassword: (passwordData: ChangePasswordDto) => Promise<void>;
  user: UserProfile | null;
  isLoading: boolean;
  token: string | null;
  refreshUserProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configuration de l'intercepteur Axios
  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      async (config) => {
        const currentToken = await AsyncStorage.getItem('userToken');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, []); // Exécute une seule fois à l'initialisation

  // Fonctions enveloppées dans useCallback pour mémorisation

  const signOut = useCallback(async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('userToken');
    api.defaults.headers.common['Authorization'] = '';
  }, []);

  const refreshUserProfile = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const { data: profile } = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error("Failed to refresh user profile.", error);
      if (error instanceof AxiosError && error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.warn("Token expired or invalid during profile refresh, forcing sign out.");
        await signOut();
      }
    }
  }, [token, signOut]); // Dépend de `token` et `signOut`

  // Charger la session utilisateur au démarrage de l'application
  useEffect(() => {
    async function loadUserFromStorage() {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          await refreshUserProfile();
        }
      } catch (e) {
        console.error("Failed to load user session from storage.", e);
        await signOut();
      } finally {
        setIsLoading(false);
      }
    }
    loadUserFromStorage();
  }, [refreshUserProfile, signOut]);

  // --- Fonctions d'authentification et de gestion de profil avec useCallback ---

  const signIn = useCallback(async (loginData: LoginUserDto) => {
    setIsLoading(true);
    try {
      const { data: authResponse } = await authService.login(loginData);
      setToken(authResponse.token);
      await AsyncStorage.setItem('userToken', authResponse.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${authResponse.token}`;
      await refreshUserProfile();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUserProfile, signOut]); // Dépend de `refreshUserProfile` et `signOut`

  const register = useCallback(async (registerData: RegisterUserDto) => {
    setIsLoading(true);
    try {
      const { data: authResponse } = await authService.register(registerData);
      if (authResponse.token) {
        setToken(authResponse.token);
        await AsyncStorage.setItem('userToken', authResponse.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${authResponse.token}`;
        await refreshUserProfile();
      }
      return authResponse;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUserProfile, signOut]); // Dépend de `refreshUserProfile` et `signOut`

  const updateProfile = useCallback(async (profileData: UpdateUserProfileDto) => {
    setIsLoading(true);
    try {
      await authService.updateProfile(profileData);
      await refreshUserProfile();
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUserProfile]); // Dépend de `refreshUserProfile`

  const changePassword = useCallback(async (passwordData: ChangePasswordDto) => {
    setIsLoading(true);
    try {
      await authService.changePassword(passwordData);
    } catch (error) {
      console.error("Change password failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []); // Pas de dépendances internes à l'AuthContext

   const isAuthenticated = !!user && !!token;


  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        signIn,
        signOut,
        register,
        updateProfile,
        changePassword,
        user,
        isLoading,
        token,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};