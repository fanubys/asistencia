import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, UsersIcon, ChartBarIcon, Cog6ToothIcon } from '../ui/Icons.tsx';

const MainLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navItems = [
    { path: '/inicio', label: 'Inicio', icon: <HomeIcon /> },
    { path: '/grupos', label: 'Grupos', icon: <UsersIcon /> },
    { path: '/estadisticas', label: 'Estadísticas', icon: <ChartBarIcon /> },
    { path: '/configuracion', label: 'Ajustes', icon: <Cog6ToothIcon /> },
  ];

  return (
    <div className="flex flex-col h-screen font-sans text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex justify-around max-w-lg mx-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors duration-200 ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-300'
                }`
              }
            >
              <span className="w-6 h-6">{item.icon}</span>
              <span className="mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;