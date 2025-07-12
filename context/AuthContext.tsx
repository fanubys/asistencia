import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config.ts';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
        console.error("Firebase Auth no está configurado.");
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (username: string) => {
    setError(null);
    if (username.toLowerCase() !== 'admin') {
      const err = new Error("Usuario incorrecto.");
      setError("Usuario incorrecto.");
      throw err;
    }

    const ADMIN_EMAIL = 'admin@asistencia.pro';
    const ADMIN_PASSWORD = 'default-password-for-admin-user';

    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          // If admin user doesn't exist, create it. It will also sign in the user.
          await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        } catch (signupErr: any) {
          setError(signupErr.message || 'No se pudo crear el usuario administrador.');
          throw signupErr;
        }
      } else {
        setError(err.message || 'Error al iniciar sesión.');
        throw err;
      }
    }
  };

  const logout = async () => {
    try {
        await signOut(auth);
    } catch (err: any) {
        console.error("Error signing out: ", err);
        setError(err.message || 'Error al cerrar sesión.');
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