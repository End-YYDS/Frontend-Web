import React from 'react';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`flex items-center justify-between w-full max-w-none ${className}`}>
      {/* Search Section */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex items-center w-full">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/6ec9a1cbd21b4e598820b0c75fdd6e3e/fdf5c05b52c3e5d6d56b7af7ef9fb692805a0503?placeholderIfAbsent=true"
            className="absolute left-3 w-4 h-4 text-gray-400"
            alt="Search icon"
          />
          <input
            type="search"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search"
          />
        </div>
      </div>

      {/* User Section */}
      <div className="flex items-center gap-6">
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets/6ec9a1cbd21b4e598820b0c75fdd6e3e/2ec9fb42c642dc54429233d0f71a090a5fbdf761?placeholderIfAbsent=true"
            className="w-5 h-5"
            alt="Notification icon"
          />
        </button>
        
        <div className="flex items-center gap-3">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/6ec9a1cbd21b4e598820b0c75fdd6e3e/1430db32d00f64d4426f011e6ed3dcbbdc8061a0?placeholderIfAbsent=true"
            className="w-8 h-8 rounded-full object-cover"
            alt="User avatar"
          />
          <span className="text-sm font-medium text-gray-700">
            Derrick Lin
          </span>
        </div>
      </div>
    </header>
  );
};