import React from 'react';
import { useServiceWorkerUpdater } from '../../hooks/useServiceWorkerUpdater.ts';
import Button from './Button.tsx';

const UpdateNotifier: React.FC = () => {
  const { updateAvailable, refreshPage } = useServiceWorkerUpdater();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <div className="bg-secondary-800 text-white p-4 rounded-lg shadow-2xl flex items-center space-x-4 animate-bounce">
        <div>
          <h4 className="font-bold">¡Nueva versión!</h4>
          <p className="text-sm">Hay una actualización disponible.</p>
        </div>
        <Button onClick={refreshPage} className="bg-secondary-500 hover:bg-secondary-600 focus:ring-secondary-400">
          Actualizar
        </Button>
      </div>
    </div>
  );
};

export default UpdateNotifier;