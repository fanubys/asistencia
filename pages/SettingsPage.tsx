
import React from 'react';
import Header from '../components/layout/Header.tsx';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import { useTheme } from '../hooks/useTheme.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Theme } from '../types.ts';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  const themes: { id: Theme; name: string }[] = [
    { id: 'light', name: 'Claro' },
    { id: 'dark', name: 'Oscuro' },
    { id: 'accessible', name: 'Accesible' },
  ];
  
  const handleLogout = async () => {
    try {
        await logout();
        // The ProtectedRoute component will automatically redirect to the login page.
    } catch (error) {
        console.error("Logout failed", error);
        alert("No se pudo cerrar la sesión. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <div className="p-4 space-y-6">
      <Header title="Configuración" />

      <Card>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Tema Visual</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Elige la apariencia de la aplicación.</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-primary-500
                ${theme === t.id 
                  ? 'bg-primary-600 text-white shadow-lg' 
                  : 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </Card>

      <Card>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Sesión</h3>
          <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                  Sesión iniciada como: <span className="font-bold text-slate-800 dark:text-slate-200">admin</span>
              </p>
              <Button variant="danger" onClick={handleLogout}>
                  Cerrar Sesión
              </Button>
          </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Acerca de</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Asistencia Pro v1.3.0</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
          Aplicación de gestión de asistencia escolar. Diseñada para ser rápida, funcional y accesible offline, con sincronización en la nube para múltiples dispositivos.
        </p>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Desarrollado por:</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Fabián de Castillo</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                <a href="mailto:fabdecas@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline">fabdecas@gmail.com</a>
            </p>
             <p className="text-sm text-slate-500 dark:text-slate-400">
                <a href="tel:092603921" className="text-primary-600 dark:text-primary-400 hover:underline">092 603 921</a>
             </p>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
