import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth as useClerkAuth, useUser, useSignIn, useSignUp, ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '../utils/cache';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  );
}

interface AuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: any;
  signOut: () => Promise<void>;
  signIn: (emailAddress: string, password?: string) => Promise<any>;
  signUp: (emailAddress: string, password?: string) => Promise<any>;
  verifyEmail: (code: string) => Promise<any>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AuthInternalProvider>{children}</AuthInternalProvider>
    </ClerkProvider>
  );
}

function AuthInternalProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded, signOut } = useClerkAuth();
  
  useEffect(() => {
    console.log('[Auth Context] Loaded:', isLoaded, 'Signed In:', isSignedIn);
  }, [isLoaded, isSignedIn]);

  const { user } = useUser();
  const { signIn: clerkSignIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp: clerkSignUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();

  const signIn = async (emailAddress: string, password?: string) => {
    if (!isSignInLoaded) return;
    const result = await clerkSignIn.create({
      identifier: emailAddress,
      password,
    });
    if (result.status === 'complete') {
      await setSignInActive({ session: result.createdSessionId });
    }
    return result;
  };

  const signUp = async (emailAddress: string, password?: string) => {
    if (!isSignUpLoaded) return;
    const result = await clerkSignUp.create({
      emailAddress,
      password,
    });
    
    // Prepare for email verification
    await clerkSignUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    
    return result;
  };

  const verifyEmail = async (code: string) => {
    if (!isSignUpLoaded) return;
    const result = await clerkSignUp.attemptEmailAddressVerification({
      code,
    });
    
    if (result.status === 'complete') {
      await setSignUpActive({ session: result.createdSessionId });
    }
    return result;
  };

  const value = {
    isSignedIn: !!isSignedIn,
    isLoaded,
    user,
    signOut,
    signIn,
    signUp,
    verifyEmail,
    isLoading: !isLoaded,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
