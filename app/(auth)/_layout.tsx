// ============================================================
// File: app/(auth)/_layout.tsx
// Description: Layout for the authentication stack (Login, Sign Up, Forgot Password).
// ============================================================
import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}