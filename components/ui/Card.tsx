import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const baseClasses = 'bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 border border-slate-200 dark:border-slate-700';
  const interactiveClasses = onClick ? 'hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer' : '';

  return (
    <div className={`${baseClasses} ${interactiveClasses} ${className}`} onClick={onClick}>
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;