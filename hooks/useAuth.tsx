import { createContext, useContext, useEffect, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from "@react-native-async-storage/async-storage";



// --- Authentication Context ---
type AuthContextType = {
    signIn: (role: 'client' | 'marchand') => void;
    signOut: () => void;
    user: { role: 'client' | 'marchand'; name?: string; email?: string } | null; // Add name/email
    isLoading: boolean;
  };

const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// --- Auth Provider Component ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ role: 'client' | 'marchand'; name?: string; email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check async storage for user session on mount
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
           // Simulate loading user details along with role
           const parsedUser = JSON.parse(storedUser);
           // In a real app, fetch full user details from API based on stored token/id
           setUser({
               ...parsedUser,
               name: parsedUser.role === 'marchand' ? 'Marchand Exemple' : 'Client Exemple', // Add mock name/email
               email: parsedUser.role === 'marchand' ? 'marchand@example.com' : 'client@example.com'
           });
        }
      } catch (e) {
        console.error("Failed to load user from storage", e);
      } finally {
        setIsLoading(false);
        // Hide splash screen once user state is determined
        SplashScreen.hideAsync();
      }
    };
    loadUser();
  }, []);

  const signIn = async (role: 'client' | 'marchand') => {
     // Simulate getting user details on sign in
    const newUser = {
        role,
        name: role === 'marchand' ? 'Marchand Exemple' : 'Client Exemple',
        email: role === 'marchand' ? 'marchand@example.com' : 'client@example.com'
    };
    setUser(newUser);
    // Simulate saving user session (only role for simplicity, real app saves token)
    try {
      await AsyncStorage.setItem('user', JSON.stringify({ role })); // Store only role for demo persistence
    } catch (e) {
      console.error("Failed to save user to storage", e);
    }
    // API call for login would go here, returning user details and token
  };

  const signOut = async () => {
    setUser(null);
    // Simulate removing user session
    try {
      await AsyncStorage.removeItem('user');
    } catch (e) {
      console.error("Failed to remove user from storage", e);
    }
    // API call for logout would go here
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}