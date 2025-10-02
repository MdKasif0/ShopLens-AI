
import React from 'react';
import { SearchIcon, ArrowLeftIcon } from './icons';

interface HeaderProps {
  showNewSearch: boolean;
  onNewSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ showNewSearch, onNewSearch }) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg fixed top-0 left-0 right-0 z-10 border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
                <SearchIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">ShopLens AI</h1>
          </div>
          {showNewSearch && (
            <button
              onClick={onNewSearch}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>New Search</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
