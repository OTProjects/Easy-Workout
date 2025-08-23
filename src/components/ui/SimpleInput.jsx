import React, { forwardRef } from 'react';

const SimpleInput = forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'transition-all duration-200 bg-white focus:outline-none border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-sm rounded-lg';
  const errorClasses = error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : '';
  
  const combinedClasses = [
    baseClasses,
    errorClasses,
    fullWidth && 'w-full',
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    props.disabled && 'opacity-60 cursor-not-allowed bg-gray-50',
    className
  ].filter(Boolean).join(' ');

  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={combinedClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-gray-400">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {hint}
        </p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

SimpleInput.displayName = 'SimpleInput';

export const SearchInput = forwardRef(({ 
  placeholder = "Search...", 
  onClear,
  value = '',
  className = '',
  ...props 
}, ref) => {
  const searchIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const clearIcon = value && onClear ? (
    <button
      type="button"
      onClick={onClear}
      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  ) : null;

  return (
    <SimpleInput
      ref={ref}
      type="text"
      placeholder={placeholder}
      leftIcon={searchIcon}
      rightIcon={clearIcon}
      value={value}
      className={className}
      {...props}
    />
  );
});

SearchInput.displayName = 'SearchInput';

export default SimpleInput;