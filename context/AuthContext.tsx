import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { auth, firebaseInitializationError } from '../firebase/config.ts';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (firebaseInitializationError) {
      setError(firebaseInitializationError.message);
      setLoading(false);
      return;
    }
    if (!auth) {
        console.error("Firebase Auth no está configurado.");
        setError("La configuración de Firebase Auth es inválida o no se pudo inicializar.");
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setError(null);
    // Only sign in if there's no current user.
    if (auth.currentUser) {
      setUser(auth.currentUser);
      return;
    }
    
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error("Anonymous Sign-In Failed:", err);
      let friendlyError = "No se pudo iniciar sesión. Por favor, verifica tu conexión e inténtalo de nuevo.";
      if (err.code === 'auth/operation-not-allowed') {
          friendlyError = "El inicio de sesión anónimo no está habilitado para este proyecto."
      }
      setError(friendlyError);
      throw new Error(friendlyError);
    }
  };

  const logout = async () => {
    try {
        await signOut(auth);
    } catch (err: any) {
        console.error("Error signing out: ", err);
        setError(err.message || 'Error al cerrar sesión.');
        throw err;
    }
  };

  const value = { user, loading, login, logout, error };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-100 dark:bg-slate-900">
        <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          Iniciando...
        </div>
      </div>
    );
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};