import React from 'react';

const SimpleButton = ({
  children,
  variant = 'primary',
  size = 'base',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    const base = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (variant) {
      case 'primary':
        return `${base} bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg focus:ring-blue-500`;
      case 'secondary':
        return `${base} bg-white hover:bg-gray-50 text-gray-700 shadow-sm border border-gray-200 hover:shadow-md focus:ring-gray-500`;
      case 'success':
        return `${base} bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg focus:ring-green-500`;
      case 'danger':
        return `${base} bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg focus:ring-red-500`;
      case 'ghost':
        return `${base} text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500`;
      default:
        return `${base} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-2 py-1 text-xs rounded-md';
      case 'sm':
        return 'px-3 py-2 text-sm rounded-md';
      case 'lg':
        return 'px-6 py-3 text-lg rounded-lg';
      case 'xl':
        return 'px-8 py-4 text-xl rounded-lg';
      default:
        return 'px-4 py-2.5 text-sm rounded-lg';
    }
  };

  const combinedClasses = [
    getVariantClasses(),
    getSizeClasses(),
    fullWidth && 'w-full',
    className
  ].filter(Boolean).join(' ');

  const renderLoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && renderLoadingSpinner()}
      {children}
    </button>
  );
};

export const FloatingActionButton = ({ onClick, icon, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};

export const IconButton = ({ icon, variant = 'ghost', size = 'base', className = '', ...props }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'p-1';
      case 'sm': return 'p-1.5';
      case 'lg': return 'p-3';
      case 'xl': return 'p-4';
      default: return 'p-2';
    }
  };

  return (
    <SimpleButton 
      variant={variant} 
      className={`rounded-full ${getSizeClasses()} ${className}`}
      {...props}
    >
      {icon}
    </SimpleButton>
  );
};

export default SimpleButton;