// ============================================================
// File: app/index.tsx
// Description: Entry point, usually redirects based on auth state.
// ============================================================
import React from 'react';
// No longer need Redirect as RootLayout handles it
// import { Redirect } from 'expo-router';

export default function StartPage() {
  // The RootLayout will handle redirection logic based on auth state.
  // Returning null allows RootLayout's useEffect to manage the initial route.
  return null;
}