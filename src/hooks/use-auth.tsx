"use client";

import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { PinLockScreen } from '@/components/pin-lock-screen';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    loading: true,
    handleLogout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPinRequired, setIsPinRequired] = useState(false);
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleLogout = useCallback(async () => {
    try {
        await signOut(auth);
        setIsPinRequired(false);
        setIsPinUnlocked(false);
        toast({ title: "Logged Out", description: "You have been successfully logged out."});
        router.push('/');
    } catch (error) {
        toast({ variant: "destructive", title: "Logout Failed", description: "There was an error logging out."});
    }
  }, [router, toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userSettingsRef = doc(db, 'userSettings', user.uid);
        const docSnap = await getDoc(userSettingsRef);
        if (docSnap.exists() && docSnap.data().pin) {
            setIsPinRequired(true);
            setIsPinUnlocked(false); // Lock screen on new login
        } else {
            setIsPinRequired(false);
            setIsPinUnlocked(true); // No pin set, so it's "unlocked"
        }
      } else {
        setUser(null);
        setIsPinRequired(false);
        setIsPinUnlocked(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/' || pathname === '/signup' || pathname === '/forgot-password';

    if (!user && !isAuthPage) {
      router.push('/');
    } else if (user && isAuthPage) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);


  if (loading) {
     return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
     )
  }

  const isAuthPage = pathname === '/' || pathname === '/signup' || pathname === '/forgot-password';
  if (!user && !isAuthPage) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Redirecting to login...</p>
        </div>
      );
  }
   if (user && isAuthPage) {
      return (
         <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Redirecting to dashboard...</p>
        </div>
      )
  }

  if (user && isPinRequired && !isPinUnlocked) {
    return <PinLockScreen onUnlock={() => setIsPinUnlocked(true)} />
  }

  return (
    <AuthContext.Provider value={{ user, loading, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
