import React from 'react';
import { designSystem } from '../../styles/designSystem';

const Button = ({
  children,
  variant = 'primary',
  size = 'base',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    const base = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (variant) {
      case 'primary':
        return `${base} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg focus:ring-blue-500 transform hover:-translate-y-0.5 active:translate-y-0`;
      case 'secondary':
        return `${base} bg-white hover:bg-gray-50 text-gray-700 shadow-sm border border-gray-200 hover:shadow-md focus:ring-gray-500`;
      case 'success':
        return `${base} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg focus:ring-green-500 transform hover:-translate-y-0.5`;
      case 'danger':
        return `${base} bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg focus:ring-red-500 transform hover:-translate-y-0.5`;
      case 'warning':
        return `${base} bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg focus:ring-orange-500 transform hover:-translate-y-0.5`;
      case 'ghost':
        return `${base} text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500`;
      case 'outline':
        return `${base} border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white focus:ring-blue-500`;
      case 'glass':
        return `${base} backdrop-blur-lg bg-white/20 border border-white/30 text-white hover:bg-white/30 focus:ring-white/50`;
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

  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <span className={`flex-shrink-0 ${children ? (iconPosition === 'right' ? 'ml-2' : 'mr-2') : ''}`}>
        {icon}
      </span>
    );
  };

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
      {!loading && iconPosition === 'left' && renderIcon()}
      {children}
      {!loading && iconPosition === 'right' && renderIcon()}
    </button>
  );
};

// Specialized button components
export const FloatingActionButton = ({ onClick, icon, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${className}`}
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
    <Button 
      variant={variant} 
      className={`rounded-full ${getSizeClasses()} ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
};

export const ButtonGroup = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex rounded-lg shadow-sm ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;
        
        let roundedClasses = '';
        if (isFirst && isLast) {
          roundedClasses = 'rounded-lg';
        } else if (isFirst) {
          roundedClasses = 'rounded-l-lg rounded-r-none';
        } else if (isLast) {
          roundedClasses = 'rounded-r-lg rounded-l-none border-l-0';
        } else {
          roundedClasses = 'rounded-none border-l-0';
        }

        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${roundedClasses}`.trim()
        });
      })}
    </div>
  );
};

export const ToggleButton = ({ 
  active, 
  onToggle, 
  children, 
  activeClassName = 'bg-blue-600 text-white',
  inactiveClassName = 'bg-white text-gray-700 hover:bg-gray-50',
  className = '',
  ...props 
}) => {
  return (
    <button
      onClick={onToggle}
      className={`
        inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${active ? activeClassName : inactiveClassName}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;