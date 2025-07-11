import React, { useState } from 'react';
import { CloseIcon } from './Icons.tsx';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt, className }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleZoomIn = () => setIsZoomed(true);
  const handleZoomOut = () => setIsZoomed(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className} cursor-pointer transition-transform duration-300 hover:scale-105`}
        onClick={handleZoomIn}
      />
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in"
          onClick={handleZoomOut}
        >
          <style>{`
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fade-in {
              animation: fade-in 0.3s ease-out forwards;
            }
            @keyframes zoom-in {
              from { transform: scale(0.8); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            .animate-zoom-in {
              animation: zoom-in 0.3s ease-out forwards;
            }
          `}</style>
          <button
            onClick={handleZoomOut}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            aria-label="Cerrar"
          >
            <CloseIcon className="w-8 h-8" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl object-contain animate-zoom-in"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
        </div>
      )}
    </>
  );
};

export default ImageZoom;
