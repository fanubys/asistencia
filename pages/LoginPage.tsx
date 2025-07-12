
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import Button from '../components/ui/Button.tsx';

const LoginPage: React.FC = () => {
  const { user, login, error: authError, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen w-full text-lg font-semibold text-slate-700 dark:text-slate-300">Verificando sesión...</div>;
  }
  
  if (user) {
    return <Navigate to="/inicio" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(username);
    } catch (err) {
      // The error is handled and displayed via the context's error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = 'Iniciar Sesión';
  const buttonText = 'Entrar';

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-slate-100 dark:bg-slate-950">
       <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-secondary-50/50 dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-900/50 -z-10"></div>
       <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl dark:bg-slate-800 animate-zoom-in">
        <div className="text-center">
             <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                <span className="text-primary-600 dark:text-primary-400">Asistencia Pro</span>
            </h1>
            <h2 className="mt-2 text-xl font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Usuario</label>
            <input 
              type="text" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600" 
              required 
              autoComplete="username"
              placeholder="admin"
            />
          </div>
          
          {authError && <p className="text-sm text-red-500 text-center">{authError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
            {isSubmitting ? 'Procesando...' : buttonText}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;