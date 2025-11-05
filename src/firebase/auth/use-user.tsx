'use client';

import { useState, useEffect } from 'react';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';

export interface UserAuthHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/**
 * Custom hook to get the current authenticated user from Firebase.
 * It sets up a listener for authentication state changes.
 *
 * @param {Auth | null} auth - The Firebase Auth instance.
 * @returns {UserAuthHookResult} - An object containing the user, loading state, and error.
 */
export const useUser = (auth: Auth | null): UserAuthHookResult => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    // If no Auth service instance is available, we can't determine the user state.
    if (!auth) {
      setIsUserLoading(false);
      setUser(null);
      // Optional: Set an error if auth is expected but not provided.
      // setError(new Error("Firebase Auth service is not available."));
      return;
    }

    // Reset state on new auth instance, and start loading.
    setIsUserLoading(true);
    setUser(null);
    setUserError(null);

    // Subscribe to authentication state changes.
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        // Auth state has been determined.
        setUser(firebaseUser);
        setIsUserLoading(false);
      },
      (error) => {
        // An error occurred with the auth listener.
        console.error("useUser: onAuthStateChanged error:", error);
        setUserError(error);
        setIsUserLoading(false);
      }
    );

    // Cleanup subscription on unmount.
    return () => unsubscribe();
  }, [auth]); // Re-run the effect if the auth instance changes.

  return { user, isUserLoading, userError };
};
