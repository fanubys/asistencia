import React from 'react';
import Header from '../components/layout/Header.tsx';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import { useTheme } from '../hooks/useTheme.ts';
import { Theme } from '../types.ts';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: { id: Theme; name: string }[] = [
    { id: 'light', name: 'Claro' },
    { id: 'dark', name: 'Oscuro' },
    { id: 'accessible', name: 'Accesible' },
  ];

  return (
    <div className="p-4 space-y-6">
      <Header title="Configuración" />

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Tema Visual</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Elige la apariencia de la aplicación.</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map(t => (
            <Button
              key={t.id}
              onClick={() => setTheme(t.id)}
              variant={theme === t.id ? 'primary' : 'secondary'}
              className="py-4 text-lg"
            >
              {t.name}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Acerca de</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Asistencia Pro v1.0.0</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
          Aplicación de gestión de asistencia escolar. Diseñada para ser rápida, funcional y accesible offline.
        </p>
      </Card>
    </div>
  );
};

export default SettingsPage;