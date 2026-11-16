'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  role: 'primary_admin' | 'secondary_admin' | 'user';
  studentIds?: string[];
  permissions?: string[];
  photoURL?: string;
  status: 'active' | 'blocked';
  password?: string; // Only for local auth
}

interface AuthContextType {
  user: User | SupabaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isPrimaryAdmin: boolean;
  isSecondaryAdmin: boolean;
  isUser: boolean;
  isDemo: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const PRIMARY_ADMIN_EMAIL = 'valter1990vado@gmail.com';

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isPrimaryAdmin: false,
  isSecondaryAdmin: false,
  isUser: false,
  isDemo: false,
  signOut: async () => {},
  updateProfile: async () => {},
});

const DEFAULT_ADMIN: UserProfile = {
  uid: 'demo-admin',
  email: 'admin@eloescolar.ao',
  name: 'Administrador Geral',
  role: 'primary_admin',
  studentIds: [],
  permissions: ['all'],
  status: 'active',
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const localUser = localStorage.getItem('elo_escolar_user');
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser);
          if (parsed.status === 'blocked') {
            localStorage.removeItem('elo_escolar_user');
            return DEFAULT_ADMIN;
          }
          return parsed;
        } catch (e) {
          return DEFAULT_ADMIN;
        }
      }
      return DEFAULT_ADMIN;
    }
    return DEFAULT_ADMIN;
  });
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('elo_escolar_demo');
      localStorage.removeItem('elo_escolar_user');
      setIsDemo(false);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Sign out from Firebase if initialized
      if (auth) {
        await auth.signOut();
      }
      
      // Use window.location.href for a full page reload to clear all states and redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;

    // Merge updates locally first for immediate UI feedback
    const updatedProfile = { ...profile, ...updates };

    // 1. Handle Demo / Local Auth Update
    if (isDemo || profile.uid.startsWith('local-')) {
      if (profile.uid !== 'demo-admin') {
        const localUsers = JSON.parse(localStorage.getItem('elo_escolar_local_db') || '[]');
        const userIndex = localUsers.findIndex((u: any) => u.uid === profile.uid);
        if (userIndex !== -1) {
          localUsers[userIndex] = { ...localUsers[userIndex], ...updates };
          localStorage.setItem('elo_escolar_local_db', JSON.stringify(localUsers));
        }
      }
      localStorage.setItem('elo_escolar_user', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      return;
    }

    // 2. Handle Supabase Update
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: updates.name ?? profile.name,
            photo_url: updates.photoURL ?? profile.photoURL,
            role: updates.role ?? profile.role,
            status: updates.status ?? profile.status,
            permissions: updates.permissions ?? profile.permissions
          })
          .eq('id', session.user.id);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error updating profile in Supabase:", error);
      throw error;
    }

    // 3. Handle Firebase Update (if exists)
    const firestoreDb = db;
    if (firestoreDb && user && 'uid' in user) {
      try {
        const profileRef = doc(firestoreDb, 'users', user.uid);
        await setDoc(profileRef, updates, { merge: true });
      } catch (error) {
        console.error("Error updating profile in Firestore:", error);
      }
    }

    // Finally, ensure local state is updated for Supabase/Firebase users too
    setProfile(updatedProfile);
  };

  useEffect(() => {
    let unsubscribeAuth: any;
    let unsubscribeProfile: any;

    const initAuth = async () => {
      // 1. Check Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          setIsDemo(false);
          // Fetch profile from Supabase
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const isPrimary = currentUser.email === PRIMARY_ADMIN_EMAIL;
            const newProfile: UserProfile = {
              uid: currentUser.id,
              email: currentUser.email || '',
              name: currentUser.user_metadata?.full_name || '',
              role: isPrimary ? 'primary_admin' : 'user',
              status: 'active',
              permissions: isPrimary ? ['all'] : [],
            };
            
            await supabase.from('profiles').insert([{
              id: currentUser.id,
              email: currentUser.email,
              name: newProfile.name,
              role: newProfile.role,
              status: newProfile.status,
              permissions: newProfile.permissions
            }]);
            
            setProfile(newProfile);
          } else if (profileData) {
            setProfile({
              uid: profileData.id,
              email: profileData.email,
              name: profileData.name,
              role: profileData.role,
              status: profileData.status,
              permissions: profileData.permissions,
              photoURL: profileData.photo_url
            });
          }
          setLoading(false);
        } else if (!isDemo) {
          // If no Supabase user and not demo, check Firebase
          const firebaseAuth = auth;
          if (firebaseAuth) {
            unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
              if (firebaseUser) {
                setUser(firebaseUser);
                // Firebase logic... (existing logic)
                const firestoreDb = db;
                if (firestoreDb) {
                  const profileRef = doc(firestoreDb, 'users', firebaseUser.uid);
                  const profileSnap = await getDoc(profileRef);
                  if (profileSnap.exists()) {
                    setProfile(profileSnap.data() as UserProfile);
                  }
                }
                setLoading(false);
              } else {
                setUser(null);
                setProfile(null);
                setLoading(false);
              }
            });
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
        if (unsubscribeAuth) unsubscribeAuth();
      };
    };

    if (isDemo) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    } else {
      initAuth();
    }
  }, [isDemo]);

  const isPrimary = profile?.role === 'primary_admin' || (user?.email === PRIMARY_ADMIN_EMAIL && !!user);

  const value = {
    user,
    profile,
    loading,
    isAdmin: isPrimary || profile?.role === 'secondary_admin' || profile?.uid === 'demo-admin',
    isPrimaryAdmin: isPrimary || profile?.uid === 'demo-admin',
    isSecondaryAdmin: profile?.role === 'secondary_admin',
    isUser: profile?.role === 'user' && !isPrimary && profile?.uid !== 'demo-admin',
    isDemo,
    signOut: handleSignOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
