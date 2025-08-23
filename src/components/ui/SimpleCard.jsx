import React from 'react';

const SimpleCard = ({ 
  children, 
  className = '',
  onClick,
  ...props 
}) => {
  const cardClasses = `
    bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden p-6 
    transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''}
    ${className}
  `.trim();

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const WorkoutCard = ({ 
  title, 
  subtitle, 
  exerciseCount, 
  workoutType = 'mixed', 
  duration,
  difficulty,
  onClick,
  className = ''
}) => {
  const getTypeColor = (type) => {
    const colors = {
      strength: 'border-l-blue-500 bg-blue-50',
      cardio: 'border-l-red-500 bg-red-50', 
      flexibility: 'border-l-green-500 bg-green-50',
      rest: 'border-l-yellow-500 bg-yellow-50',
      mixed: 'border-l-purple-500 bg-purple-50'
    };
    return colors[type] || colors.mixed;
  };
  
  return (
    <SimpleCard 
      onClick={onClick}
      className={`border-l-4 ${getTypeColor(workoutType)} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${getTypeColor(workoutType).split(' ')[1]}`}>
              <div className="w-5 h-5 bg-current opacity-80 rounded"></div>
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
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {difficulty}
              </span>
            )}
          </div>
        </div>
      </div>
    </SimpleCard>
  );
};

export default SimpleCard;