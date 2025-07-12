import React, { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  actions?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, actions }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-lg px-4 py-3 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
    </header>
  );
};

export default Header;