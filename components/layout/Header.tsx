
import React, { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  actions?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, actions }) => {
  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
    </header>
  );
};

export default Header;
