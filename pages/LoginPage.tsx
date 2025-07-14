
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import Button from '../components/ui/Button.tsx';

const LoginPage: React.FC = () => {
  const { user, login, error: authError, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen w-full text-lg font-semibold text-slate-700 dark:text-slate-300">Verificando sesión...</div>;
  }
  
  if (user) {
    return <Navigate to="/inicio" />;
  }

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      await login();
    } catch (err) {
      // The error is handled and displayed via the context's error state
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = 'Bienvenido';
  const buttonText = 'Ingresar';

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-slate-100 dark:bg-slate-950">
       <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-secondary-50/50 dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-900/50 -z-10"></div>
       <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-2xl dark:bg-slate-800 animate-zoom-in">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              <span className="text-primary-600 dark:text-primary-400">Asistencia Pro</span>
            </h1>
            <h2 className="mt-2 text-xl font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Presiona el botón para comenzar.</p>
        </div>
        <div className="space-y-4">
          {authError && <p className="text-sm text-red-500 text-center">{authError}</p>}
          <Button onClick={handleLogin} className="w-full text-lg py-3" disabled={isSubmitting || authLoading}>
            {isSubmitting ? 'Ingresando...' : buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;