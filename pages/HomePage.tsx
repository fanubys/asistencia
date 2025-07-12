import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.tsx';
import { ArrowRightIcon } from '../components/ui/Icons.tsx';

const HomePage: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-full p-4 text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-secondary-50/50 dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-900/50 -z-10"></div>
       <div className="max-w-md z-10">
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white sm:text-5xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                Bienvenido a <span className="text-primary-600 dark:text-primary-400">Asistencia Pro</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                La forma más sencilla de gestionar la asistencia de tus grupos.
            </p>
            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <Link to="/grupos" className="mt-8 inline-block">
                  <Button variant="primary" className="text-xl px-8 py-4 shadow-xl">
                    Comenzar
                    <ArrowRightIcon/>
                  </Button>
              </Link>
            </div>
        </div>
    </div>
  );
};

export default HomePage;