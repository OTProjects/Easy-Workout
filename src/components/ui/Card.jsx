import React from 'react';
import { designSystem, getWorkoutTypeStyle } from '../../styles/designSystem';

const Card = ({ 
  children, 
  variant = 'default',
  workoutType = null,
  hover = false,
  glass = false,
  padding = 'base',
  className = '',
  onClick,
  ...props 
}) => {
  const getVariantClasses = () => {
    const base = 'rounded-xl transition-all duration-300 overflow-hidden';
    
    if (glass) {
      return `${base} backdrop-blur-lg bg-white/90 border border-white/20 shadow-lg`;
    }
    
    if (workoutType) {
      const typeStyle = getWorkoutTypeStyle(workoutType);
      return `${base} bg-white border-l-4 shadow-md hover:shadow-lg hover:-translate-y-1`;
    }
    
    switch (variant) {
      case 'elevated':
        return `${base} bg-white shadow-lg border border-gray-100`;
      case 'outlined':
        return `${base} bg-white border-2 border-gray-200`;
      case 'minimal':
        return `${base} bg-gray-50`;
      default:
        return `${base} bg-white shadow-md border border-gray-100`;
    }
  };

  const getPaddingClasses = () => {
    switch (padding) {
      case 'sm': return 'p-3';
      case 'lg': return 'p-8';
      case 'xl': return 'p-10';
      case 'none': return '';
      default: return 'p-6';
    }
  };

  const getWorkoutTypeBorder = () => {
    if (!workoutType) return '';
    const typeStyle = getWorkoutTypeStyle(workoutType);
    return { borderLeftColor: typeStyle.primary };
  };

  const combinedClasses = [
    getVariantClasses(),
    getPaddingClasses(),
    hover && 'cursor-pointer hover:shadow-lg hover:-translate-y-1',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={combinedClasses}
      style={getWorkoutTypeBorder()}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Specialized card components
export const WorkoutCard = ({ 
  title, 
  subtitle, 
  exerciseCount, 
  workoutType = 'mixed', 
  duration,
  difficulty,
  onClick,
  actions,
  className = ''
}) => {
  const typeStyle = getWorkoutTypeStyle(workoutType);
  
  return (
    <Card 
      workoutType={workoutType} 
      hover 
      onClick={onClick}
      className={className}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-2 rounded-lg flex-shrink-0"
              style={{ backgroundColor: typeStyle.secondary }}
            >
              <div 
                className="w-5 h-5"
                style={{ color: typeStyle.icon }}
              >
                {/* Workout type icon will be rendered here */}
                <div className="w-full h-full rounded bg-current opacity-80"></div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-500 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {exerciseCount && (
              <span className="flex items-center gap-1">
                <span className="font-medium">{exerciseCount}</span> exercises
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1">
                ~{duration} min
              </span>
            )}
            {difficulty && (
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: typeStyle.secondary,
                  color: typeStyle.icon
                }}
              >
                {difficulty}
              </span>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex-shrink-0 ml-4">
            {actions}
          </div>
        )}
      </div>
    </Card>
  );
};

export const ExerciseCard = ({ 
  name, 
  muscleGroups = [], 
  sets, 
  reps, 
  time,
  notes,
  onEdit,
  onDelete,
  className = ''
}) => {
  return (
    <Card hover className={`group ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 mb-1">{name}</h4>
          
          {muscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {muscleGroups.map((muscle, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                >
                  {muscle}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {sets && <span>{sets} sets</span>}
            {reps && <span>{reps} reps</span>}
            {time && <span>{time}s</span>}
          </div>
          
          {notes && (
            <p className="text-sm text-gray-500 mt-2 italic">
              {notes}
            </p>
          )}
        </div>
        
        <div className="flex-shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export const ProgressCard = ({ 
  title, 
  value, 
  unit = '', 
  change,
  changeType = 'neutral',
  icon,
  color = 'blue',
  className = ''
}) => {
  const getColorClasses = () => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      purple: 'bg-purple-50 border-purple-200',
      orange: 'bg-orange-50 border-orange-200'
    };
    return colors[color] || colors.blue;
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card variant="outlined" className={`${getColorClasses()} ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
            {unit && <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>}
          </p>
          {change && (
            <p className={`text-sm ${getChangeColor()} mt-1`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;