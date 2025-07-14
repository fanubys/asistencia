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
    <div className="flex flex-col h-screen font-sans text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950">
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-around max-w-lg mx-auto p-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full py-2 text-xs transition-colors duration-300 rounded-lg group ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-0 bg-primary-500/10 dark:bg-primary-500/20 rounded-lg -z-10 animate-zoom-in"></span>}
                  <span className="w-6 h-6 mb-1 transform transition-transform group-hover:scale-110">{item.icon}</span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;