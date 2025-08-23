import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Copy, RotateCcw, Target, Clock, TrendingUp, Save } from 'lucide-react';
import SimpleCard, { WorkoutCard } from './ui/SimpleCard';
import SimpleButton from './ui/SimpleButton';
import SimpleInput, { SearchInput } from './ui/SimpleInput';
import { workoutService } from '../services/workoutService';

const RoutinePlanner = ({ workouts = [], onSaveRoutine, currentRoutine = {} }) => {
  const [activeView, setActiveView] = useState('builder'); // 'builder', 'calendar', 'templates'
  const [routineData, setRoutineData] = useState({
    name: 'My Workout Routine',
    description: '',
    selectedWorkoutIds: [],
    orderedRoutineItems: [],
    rotationCycles: 4,
    restDays: [],
    ...currentRoutine
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);

  // Pre-defined routine templates
  const ROUTINE_TEMPLATES = [
    {
      name: 'Push/Pull/Legs',
      description: '3-day split focusing on different muscle groups',
      pattern: ['Push Day', 'Pull Day', 'Leg Day', 'Rest'],
      duration: '4 days',
      level: 'Intermediate'
    },
    {
      name: 'Upper/Lower Split',
      description: '4-day split alternating upper and lower body',
      pattern: ['Upper Body', 'Lower Body', 'Rest', 'Upper Body', 'Lower Body', 'Rest', 'Rest'],
      duration: '7 days',
      level: 'Beginner'
    },
    {
      name: 'Full Body 3x',
      description: 'Full body workouts 3 times per week',
      pattern: ['Full Body', 'Rest', 'Full Body', 'Rest', 'Full Body', 'Rest', 'Rest'],
      duration: '7 days',
      level: 'Beginner'
    },
    {
      name: 'Arnold Split',
      description: '6-day split popularized by Arnold Schwarzenegger',
      pattern: ['Chest/Back', 'Shoulders/Arms', 'Legs', 'Chest/Back', 'Shoulders/Arms', 'Legs', 'Rest'],
      duration: '7 days',
      level: 'Advanced'
    }
  ];

  const filteredWorkouts = workouts.filter(workout =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addWorkoutToRoutine = (workout) => {
    if (!routineData.selectedWorkoutIds.includes(workout.id)) {
      setRoutineData(prev => ({
        ...prev,
        selectedWorkoutIds: [...prev.selectedWorkoutIds, workout.id],
        orderedRoutineItems: [...prev.orderedRoutineItems, {
          id: Date.now(),
          workoutId: workout.id,
          workoutName: workout.name,
          workoutType: workout.type,
          dayOfWeek: null,
          isRestDay: false
        }]
      }));
    }
  };

  const removeWorkoutFromRoutine = (workoutId) => {
    setRoutineData(prev => ({
      ...prev,
      selectedWorkoutIds: prev.selectedWorkoutIds.filter(id => id !== workoutId),
      orderedRoutineItems: prev.orderedRoutineItems.filter(item => item.workoutId !== workoutId)
    }));
  };

  const addRestDay = () => {
    setRoutineData(prev => ({
      ...prev,
      orderedRoutineItems: [...prev.orderedRoutineItems, {
        id: Date.now(),
        workoutId: null,
        workoutName: 'Rest Day',
        workoutType: 'rest',
        dayOfWeek: null,
        isRestDay: true
      }]
    }));
  };

  const reorderRoutineItems = (fromIndex, toIndex) => {
    setRoutineData(prev => {
      const newItems = [...prev.orderedRoutineItems];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return { ...prev, orderedRoutineItems: newItems };
    });
  };

  const duplicateRoutineItem = (index) => {
    const item = routineData.orderedRoutineItems[index];
    const newItem = { ...item, id: Date.now() };
    setRoutineData(prev => ({
      ...prev,
      orderedRoutineItems: [
        ...prev.orderedRoutineItems.slice(0, index + 1),
        newItem,
        ...prev.orderedRoutineItems.slice(index + 1)
      ]
    }));
  };

  const removeRoutineItem = (index) => {
    setRoutineData(prev => ({
      ...prev,
      orderedRoutineItems: prev.orderedRoutineItems.filter((_, i) => i !== index)
    }));
  };

  const calculateRoutineStats = () => {
    const totalDays = routineData.orderedRoutineItems.length;
    const workoutDays = routineData.orderedRoutineItems.filter(item => !item.isRestDay).length;
    const restDays = totalDays - workoutDays;
    
    const workoutTypes = routineData.orderedRoutineItems.reduce((acc, item) => {
      if (!item.isRestDay) {
        acc[item.workoutType] = (acc[item.workoutType] || 0) + 1;
      }
      return acc;
    }, {});

    return { totalDays, workoutDays, restDays, workoutTypes };
  };

  const handleSaveRoutine = async () => {
    try {
      await onSaveRoutine(routineData);
      // Show success message
    } catch (error) {
      console.error('Error saving routine:', error);
      // Show error message
    }
  };

  const renderRoutineBuilder = () => (
    <div className="space-y-6">
      {/* Routine Header */}
      <SimpleCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <SimpleInput
              label="Routine Name"
              value={routineData.name}
              onChange={(e) => setRoutineData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter routine name..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rotation Cycles
            </label>
            <SimpleInput
              type="number"
              value={routineData.rotationCycles}
              onChange={(e) => setRoutineData(prev => ({ 
                ...prev, 
                rotationCycles: parseInt(e.target.value) || 1 
              }))}
              min="1"
              max="52"
            />
            <p className="text-xs text-gray-500 mt-1">
              How many times to repeat this routine cycle
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={routineData.description}
            onChange={(e) => setRoutineData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your routine goals and notes..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>
      </SimpleCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Workouts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Available Workouts</h3>
            <SimpleButton size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Workout
            </SimpleButton>
          </div>

          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Search workouts..."
          />

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredWorkouts.map((workout) => (
              <div 
                key={workout.id}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => addWorkoutToRoutine(workout)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{workout.name}</h4>
                    <p className="text-sm text-gray-500">
                      {workout.exercises?.length || 0} exercises • {workout.type}
                    </p>
                  </div>
                  <SimpleButton 
                    size="sm" 
                    variant="ghost"
                    disabled={routineData.selectedWorkoutIds.includes(workout.id)}
                  >
                    {routineData.selectedWorkoutIds.includes(workout.id) ? 'Added' : 'Add'}
                  </SimpleButton>
                </div>
              </div>
            ))}

            <div 
              className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200 cursor-pointer text-center"
              onClick={addRestDay}
            >
              <div className="flex flex-col items-center gap-2">
                <Coffee className="w-6 h-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Add Rest Day</span>
              </div>
            </div>
          </div>
        </div>

        {/* Routine Builder */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Routine Schedule</h3>
            <div className="flex gap-2">
              <SimpleButton variant="ghost" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </SimpleButton>
              <SimpleButton onClick={handleSaveRoutine}>
                <Save className="w-4 h-4 mr-2" />
                Save Routine
              </SimpleButton>
            </div>
          </div>

          {routineData.orderedRoutineItems.length === 0 ? (
            <SimpleCard className="p-8 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Build Your Routine</h4>
              <p className="text-gray-600">
                Add workouts and rest days from the left panel to create your routine schedule
              </p>
            </SimpleCard>
          ) : (
            <div className="space-y-3">
              {routineData.orderedRoutineItems.map((item, index) => (
                <SimpleCard key={item.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{item.workoutName}</h4>
                        <p className="text-sm text-gray-500 capitalize">{item.workoutType}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <SimpleButton 
                        variant="ghost" 
                        size="sm"
                        onClick={() => duplicateRoutineItem(index)}
                      >
                        <Copy className="w-4 h-4" />
                      </SimpleButton>
                      <SimpleButton 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeRoutineItem(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </SimpleButton>
                    </div>
                  </div>
                </SimpleCard>
              ))}
            </div>
          )}

          {/* Routine Stats */}
          {routineData.orderedRoutineItems.length > 0 && (
            <SimpleCard className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Routine Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {(() => {
                  const stats = calculateRoutineStats();
                  return (
                    <>
                      <div>
                        <p className="text-blue-600 font-medium">Total Days</p>
                        <p className="text-xl font-bold text-blue-900">{stats.totalDays}</p>
                      </div>
                      <div>
                        <p className="text-blue-600 font-medium">Workout Days</p>
                        <p className="text-xl font-bold text-blue-900">{stats.workoutDays}</p>
                      </div>
                      <div>
                        <p className="text-blue-600 font-medium">Rest Days</p>
                        <p className="text-xl font-bold text-blue-900">{stats.restDays}</p>
                      </div>
                      <div>
                        <p className="text-blue-600 font-medium">Cycles</p>
                        <p className="text-xl font-bold text-blue-900">{routineData.rotationCycles}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </SimpleCard>
          )}
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Routine Templates</h2>
        <p className="text-gray-600">Choose from proven workout routines or create your own</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ROUTINE_TEMPLATES.map((template, index) => (
          <SimpleCard key={index} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {template.level}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {template.duration}
                </span>
                <span>{template.pattern.length} days/cycle</span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Pattern:</p>
                <div className="flex flex-wrap gap-1">
                  {template.pattern.map((day, dayIndex) => (
                    <span
                      key={dayIndex}
                      className={`px-2 py-1 text-xs rounded-full ${
                        day === 'Rest' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <SimpleButton 
              fullWidth 
              onClick={() => {
                // Apply template logic here
                setActiveView('builder');
              }}
            >
              Use This Template
            </SimpleButton>
          </SimpleCard>
        ))}
      </div>
    </div>
  );

  const renderCalendarView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Routine Calendar</h2>
        <p className="text-gray-600">Visual representation of your workout schedule</p>
      </div>

      {/* Calendar implementation would go here */}
      <SimpleCard className="p-12 text-center">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar View Coming Soon</h3>
        <p className="text-gray-600">
          Interactive calendar view for scheduling and tracking your routine
        </p>
      </SimpleCard>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'builder', label: 'Builder', icon: Target },
            { id: 'templates', label: 'Templates', icon: Copy },
            { id: 'calendar', label: 'Calendar', icon: Calendar }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                  ${activeView === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <SimpleButton variant="ghost">
            <TrendingUp className="w-4 h-4 mr-2" />
            Progress
          </SimpleButton>
        </div>
      </div>

      {/* Content */}
      {activeView === 'builder' && renderRoutineBuilder()}
      {activeView === 'templates' && renderTemplates()}
      {activeView === 'calendar' && renderCalendarView()}
    </div>
  );
};

export default RoutinePlanner;