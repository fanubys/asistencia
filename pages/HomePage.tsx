import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.tsx';
import { ArrowRightIcon } from '../components/ui/Icons.tsx';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
       <div className="max-w-md">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white sm:text-5xl">
                Bienvenido a <span className="text-primary-600 dark:text-primary-400">Asistencia Pro</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                La forma más sencilla de gestionar la asistencia de tus grupos.
            </p>
            <Link to="/grupos" className="mt-8 inline-block">
                <Button variant="primary" className="text-xl px-8 py-4">
                  Comenzar
                  <ArrowRightIcon/>
                </Button>
            </Link>
        </div>
    </div>
  );
};

export default HomePage;
