import React, { forwardRef } from 'react';
import { designSystem } from '../../styles/designSystem';

const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'base',
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const getVariantClasses = () => {
    const base = 'transition-all duration-200 bg-white focus:outline-none';
    
    switch (variant) {
      case 'filled':
        return `${base} bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500/20`;
      case 'underlined':
        return `${base} border-0 border-b-2 border-gray-200 rounded-none focus:border-blue-500 px-0`;
      case 'glass':
        return `${base} backdrop-blur-lg bg-white/70 border border-white/30 focus:bg-white/90 focus:ring-2 focus:ring-white/50`;
      default:
        return `${base} border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm rounded-md';
      case 'lg':
        return 'px-4 py-3.5 text-base rounded-lg';
      default:
        return 'px-4 py-3 text-sm rounded-lg';
    }
  };

  const getErrorClasses = () => {
    if (error) {
      return 'border-red-300 focus:border-red-500 focus:ring-red-500/20';
    }
    return '';
  };

  const combinedClasses = [
    getVariantClasses(),
    getSizeClasses(),
    getErrorClasses(),
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

Input.displayName = 'Input';

// Specialized input components
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
    <Input
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

export const NumberInput = forwardRef(({ 
  min, 
  max, 
  step = 1, 
  onIncrement, 
  onDecrement,
  showButtons = true,
  className = '',
  ...props 
}, ref) => {
  const handleIncrement = () => {
    if (onIncrement) {
      onIncrement();
    } else if (props.onChange) {
      const currentValue = parseInt(props.value || 0);
      const newValue = Math.min(currentValue + step, max || Infinity);
      props.onChange({ target: { value: newValue } });
    }
  };

  const handleDecrement = () => {
    if (onDecrement) {
      onDecrement();
    } else if (props.onChange) {
      const currentValue = parseInt(props.value || 0);
      const newValue = Math.max(currentValue - step, min || -Infinity);
      props.onChange({ target: { value: newValue } });
    }
  };

  const buttons = showButtons ? (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={handleIncrement}
        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleDecrement}
        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  ) : null;

  return (
    <Input
      ref={ref}
      type="number"
      min={min}
      max={max}
      step={step}
      rightIcon={buttons}
      className={className}
      {...props}
    />
  );
});

NumberInput.displayName = 'NumberInput';

export const TextArea = forwardRef(({
  label,
  error,
  hint,
  rows = 3,
  resize = true,
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white focus:outline-none';
  const errorClasses = error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : '';
  const resizeClasses = resize ? 'resize-y' : 'resize-none';
  
  const combinedClasses = [
    baseClasses,
    errorClasses,
    resizeClasses,
    props.disabled && 'opacity-60 cursor-not-allowed bg-gray-50',
    className
  ].filter(Boolean).join(' ');

  const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={combinedClasses}
        {...props}
      />
      
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

TextArea.displayName = 'TextArea';

export default Input;