import React, { useState, useMemo } from 'react';
import { Plus, X, Search, ChevronRight, ChevronLeft, Target, Dumbbell, Heart, Wind, Coffee, Zap, Minus, Edit2, Trash2 } from 'lucide-react';
import SimpleCard from './ui/SimpleCard';
import SimpleButton from './ui/SimpleButton';
import SimpleInput, { SearchInput } from './ui/SimpleInput';

const WORKOUT_TEMPLATES = [
  {
    id: 'strength-upper',
    name: 'Upper Body Strength',
    type: 'strength',
    description: 'Build upper body muscle and strength',
    duration: 45,
    difficulty: 'Intermediate',
    exercises: [
      { name: 'Push-ups', muscleGroups: ['chest', 'shoulders', 'triceps'], sets: 3, reps: 12, weight: 0 },
      { name: 'Pull-ups', muscleGroups: ['back', 'biceps'], sets: 3, reps: 8, weight: 0 },
      { name: 'Dumbbell Rows', muscleGroups: ['back', 'biceps'], sets: 3, reps: 10, weight: 25 },
      { name: 'Shoulder Press', muscleGroups: ['shoulders', 'triceps'], sets: 3, reps: 10, weight: 20 }
    ]
  },
  {
    id: 'cardio-hiit',
    name: 'HIIT Cardio',
    type: 'cardio',
    description: 'High-intensity interval training',
    duration: 25,
    difficulty: 'Advanced',
    exercises: [
      { name: 'Burpees', muscleGroups: ['full body'], sets: 4, time: 30, rest: 30 },
      { name: 'Mountain Climbers', muscleGroups: ['core', 'cardio'], sets: 4, time: 30, rest: 30 },
      { name: 'Jump Squats', muscleGroups: ['legs', 'glutes'], sets: 4, time: 30, rest: 30 },
      { name: 'High Knees', muscleGroups: ['legs', 'cardio'], sets: 4, time: 30, rest: 30 }
    ]
  },
  {
    id: 'strength-lower',
    name: 'Lower Body Strength',
    type: 'strength',
    description: 'Build leg and glute strength',
    duration: 50,
    difficulty: 'Intermediate',
    exercises: [
      { name: 'Squats', muscleGroups: ['legs', 'glutes'], sets: 4, reps: 12, weight: 135 },
      { name: 'Deadlifts', muscleGroups: ['back', 'legs', 'glutes'], sets: 3, reps: 8, weight: 185 },
      { name: 'Lunges', muscleGroups: ['legs', 'glutes'], sets: 3, reps: 10, weight: 20 },
      { name: 'Calf Raises', muscleGroups: ['calves'], sets: 4, reps: 15, weight: 45 }
    ]
  }
];

const EXERCISE_LIBRARY = [
  // Strength exercises
  { name: 'Bench Press', type: 'strength', muscleGroups: ['chest', 'shoulders', 'triceps'], equipment: 'barbell', defaultWeight: 135, defaultReps: 8, defaultSets: 3 },
  { name: 'Squats', type: 'strength', muscleGroups: ['legs', 'glutes'], equipment: 'barbell', defaultWeight: 135, defaultReps: 10, defaultSets: 3 },
  { name: 'Deadlifts', type: 'strength', muscleGroups: ['back', 'legs', 'glutes'], equipment: 'barbell', defaultWeight: 185, defaultReps: 5, defaultSets: 3 },
  { name: 'Pull-ups', type: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'pull-up bar', defaultWeight: 0, defaultReps: 8, defaultSets: 3 },
  { name: 'Push-ups', type: 'strength', muscleGroups: ['chest', 'shoulders', 'triceps'], equipment: 'bodyweight', defaultWeight: 0, defaultReps: 12, defaultSets: 3 },
  { name: 'Shoulder Press', type: 'strength', muscleGroups: ['shoulders', 'triceps'], equipment: 'dumbbells', defaultWeight: 25, defaultReps: 10, defaultSets: 3 },
  { name: 'Dumbbell Rows', type: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'dumbbells', defaultWeight: 30, defaultReps: 10, defaultSets: 3 },
  { name: 'Bicep Curls', type: 'strength', muscleGroups: ['biceps'], equipment: 'dumbbells', defaultWeight: 20, defaultReps: 12, defaultSets: 3 },
  
  // Cardio exercises
  { name: 'Burpees', type: 'cardio', muscleGroups: ['full body'], equipment: 'bodyweight', defaultTime: 30, defaultRest: 30, defaultSets: 4 },
  { name: 'Mountain Climbers', type: 'cardio', muscleGroups: ['core', 'cardio'], equipment: 'bodyweight', defaultTime: 30, defaultRest: 30, defaultSets: 4 },
  { name: 'Jump Rope', type: 'cardio', muscleGroups: ['legs', 'cardio'], equipment: 'jump rope', defaultTime: 60, defaultRest: 30, defaultSets: 5 },
  { name: 'Running', type: 'cardio', muscleGroups: ['legs', 'cardio'], equipment: 'none', defaultTime: 1800, defaultRest: 0, defaultSets: 1 },
  { name: 'High Knees', type: 'cardio', muscleGroups: ['legs', 'cardio'], equipment: 'bodyweight', defaultTime: 30, defaultRest: 30, defaultSets: 4 },
  
  // Flexibility exercises
  { name: 'Cat-Cow Stretch', type: 'flexibility', muscleGroups: ['back', 'core'], equipment: 'mat', defaultTime: 60, defaultRest: 0, defaultSets: 1 },
  { name: 'Downward Dog', type: 'flexibility', muscleGroups: ['shoulders', 'hamstrings'], equipment: 'mat', defaultTime: 45, defaultRest: 0, defaultSets: 1 },
  { name: 'Warrior I', type: 'flexibility', muscleGroups: ['legs', 'hip flexors'], equipment: 'mat', defaultTime: 30, defaultRest: 0, defaultSets: 2 },
  { name: 'Pigeon Pose', type: 'flexibility', muscleGroups: ['hips', 'glutes'], equipment: 'mat', defaultTime: 60, defaultRest: 0, defaultSets: 2 }
];

const FullWorkoutWizard = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [workoutData, setWorkoutData] = useState({
    name: '',
    type: 'mixed',
    exercises: [],
    description: '',
    estimatedDuration: 0,
    notes: ''
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [exerciseFilter, setExerciseFilter] = useState('all');
  const [editingExercise, setEditingExercise] = useState(null);

  const WIZARD_STEPS = [
    { id: 1, title: 'Choose Template', subtitle: 'Start with a template or create from scratch' },
    { id: 2, title: 'Add Exercises', subtitle: 'Build your workout routine' },
    { id: 3, title: 'Customize Sets & Reps', subtitle: 'Fine-tune each exercise' },
    { id: 4, title: 'Workout Details', subtitle: 'Add final details and save' }
  ];

  // Filter exercises based on search and type
  const filteredExercises = useMemo(() => {
    let filtered = EXERCISE_LIBRARY;
    
    if (exerciseFilter !== 'all') {
      filtered = filtered.filter(exercise => exercise.type === exerciseFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(exercise => 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.muscleGroups.some(muscle => 
          muscle.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    return filtered;
  }, [searchQuery, exerciseFilter]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setWorkoutData({
      name: template.name,
      type: template.type,
      exercises: template.exercises.map((exercise, index) => ({
        ...exercise,
        id: `exercise-${index}`,
        orderIndex: index,
        sets: exercise.sets || 3,
        reps: exercise.reps || null,
        weight: exercise.weight || 0,
        time: exercise.time || null,
        rest: exercise.rest || 60,
        setResults: []
      })),
      description: template.description,
      estimatedDuration: template.duration
    });
  };

  const handleFromScratch = () => {
    setSelectedTemplate(null);
    setWorkoutData({
      name: '',
      type: 'mixed',
      exercises: [],
      description: '',
      estimatedDuration: 0,
      notes: ''
    });
  };

  const handleAddExercise = (exercise) => {
    const newExercise = {
      ...exercise,
      id: `exercise-${Date.now()}`,
      orderIndex: workoutData.exercises.length,
      sets: exercise.defaultSets || 3,
      reps: exercise.defaultReps || null,
      weight: exercise.defaultWeight || 0,
      time: exercise.defaultTime || null,
      rest: exercise.defaultRest || 60,
      setResults: []
    };
    
    setWorkoutData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  const handleRemoveExercise = (exerciseId) => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
    }));
  };

  const handleExerciseUpdate = (exerciseId, updates) => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, ...updates } : ex
      )
    }));
  };

  const getWorkoutIcon = (type) => {
    const icons = {
      strength: <Dumbbell className="w-5 h-5" />,
      cardio: <Heart className="w-5 h-5" />,
      flexibility: <Wind className="w-5 h-5" />,
      rest: <Coffee className="w-5 h-5" />,
      mixed: <Zap className="w-5 h-5" />
    };
    return icons[type] || icons.mixed;
  };

  const calculateEstimatedDuration = () => {
    return workoutData.exercises.reduce((total, exercise) => {
      const exerciseTime = exercise.time ? 
        (exercise.time * exercise.sets) : 
        (exercise.sets * 30); // Assume 30 seconds per set for strength
      const restTime = exercise.rest * (exercise.sets - 1);
      return total + exerciseTime + restTime;
    }, 0) / 60; // Convert to minutes
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {WIZARD_STEPS.map((wizardStep, index) => (
        <React.Fragment key={wizardStep.id}>
          <div className="flex items-center">
            <div
              className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                ${step >= wizardStep.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-400'
                }
              `}
            >
              {step > wizardStep.id ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                wizardStep.id
              )}
            </div>
            <div className="ml-3 hidden sm:block">
              <p className={`text-sm font-medium ${step >= wizardStep.id ? 'text-gray-900' : 'text-gray-500'}`}>
                {wizardStep.title}
              </p>
              <p className="text-xs text-gray-500">{wizardStep.subtitle}</p>
            </div>
          </div>
          {index < WIZARD_STEPS.length - 1 && (
            <div 
              className={`
                w-12 h-0.5 mx-4 transition-colors duration-300
                ${step > wizardStep.id ? 'bg-blue-600' : 'bg-gray-300'}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Starting Point</h2>
        <p className="text-gray-600">Pick a template to get started quickly or create your own from scratch</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Popular Templates</h3>
          {WORKOUT_TEMPLATES.map((template) => (
            <SimpleCard
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`${selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''} cursor-pointer hover:shadow-lg transition-all duration-200`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {getWorkoutIcon(template.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{template.exercises.length} exercises</span>
                    <span>~{template.duration} min</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{template.difficulty}</span>
                  </div>
                </div>
              </div>
            </SimpleCard>
          ))}
        </div>

        {/* Custom workout option */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Custom Workout</h3>
          <SimpleCard 
            onClick={handleFromScratch}
            className={`${!selectedTemplate ? 'ring-2 ring-blue-500 bg-blue-50' : ''} h-48 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition-all duration-200`}
          >
            <div className="p-4 bg-blue-100 rounded-full mb-4">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Create from Scratch</h4>
            <p className="text-gray-600">Build your own custom workout routine</p>
          </SimpleCard>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Build Your Workout</h2>
        <p className="text-gray-600">Add exercises to create your perfect routine</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercise Library */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search exercises..."
              className="flex-1"
            />
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'strength', 'cardio', 'flexibility'].map((filter) => (
                <SimpleButton
                  key={filter}
                  variant={exerciseFilter === filter ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setExerciseFilter(filter)}
                  className="whitespace-nowrap"
                >
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </SimpleButton>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredExercises.map((exercise, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {getWorkoutIcon(exercise.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                    <p className="text-sm text-gray-500">
                      {exercise.muscleGroups.join(', ')}
                    </p>
                    <p className="text-xs text-gray-400">{exercise.equipment}</p>
                  </div>
                </div>
                <SimpleButton
                  size="sm"
                  onClick={() => handleAddExercise(exercise)}
                  className="rounded-full p-2"
                >
                  <Plus className="w-4 h-4" />
                </SimpleButton>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Exercises */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Selected Exercises ({workoutData.exercises.length})
          </h3>
          
          {workoutData.exercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No exercises selected yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {workoutData.exercises.map((exercise) => (
                <SimpleCard key={exercise.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                      <p className="text-sm text-gray-500">
                        {exercise.muscleGroups?.join(', ')}
                      </p>
                    </div>
                    <SimpleButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExercise(exercise.id)}
                      className="rounded-full p-1 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </SimpleButton>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>{exercise.sets} sets</p>
                    {exercise.reps && <p>{exercise.reps} reps</p>}
                    {exercise.time && <p>{exercise.time}s</p>}
                    {exercise.weight > 0 && <p>{exercise.weight} lbs</p>}
                  </div>
                </SimpleCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Continue with renderStep3 and renderStep4 in the next part...
  const renderStep3 = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Sets & Reps</h2>
        <p className="text-gray-600">Fine-tune each exercise for your workout</p>
      </div>

      <div className="space-y-6">
        {workoutData.exercises.map((exercise) => (
          <SimpleCard key={exercise.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
                <p className="text-sm text-gray-500">{exercise.muscleGroups?.join(', ')}</p>
              </div>
              <div className="flex gap-2">
                <SimpleButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingExercise(editingExercise === exercise.id ? null : exercise.id)}
                >
                  <Edit2 className="w-4 h-4" />
                </SimpleButton>
                <SimpleButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveExercise(exercise.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </SimpleButton>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sets</label>
                <div className="flex items-center gap-2">
                  <SimpleButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExerciseUpdate(exercise.id, { sets: Math.max(1, exercise.sets - 1) })}
                    className="rounded-full p-1"
                  >
                    <Minus className="w-4 h-4" />
                  </SimpleButton>
                  <SimpleInput
                    type="number"
                    value={exercise.sets}
                    onChange={(e) => handleExerciseUpdate(exercise.id, { sets: parseInt(e.target.value) || 1 })}
                    className="w-16 text-center"
                    min="1"
                  />
                  <SimpleButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExerciseUpdate(exercise.id, { sets: exercise.sets + 1 })}
                    className="rounded-full p-1"
                  >
                    <Plus className="w-4 h-4" />
                  </SimpleButton>
                </div>
              </div>

              {exercise.type === 'strength' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reps</label>
                    <SimpleInput
                      type="number"
                      value={exercise.reps || ''}
                      onChange={(e) => handleExerciseUpdate(exercise.id, { reps: parseInt(e.target.value) || null })}
                      placeholder="Reps"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
                    <SimpleInput
                      type="number"
                      value={exercise.weight || ''}
                      onChange={(e) => handleExerciseUpdate(exercise.id, { weight: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </>
              )}

              {(exercise.type === 'cardio' || exercise.type === 'flexibility') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time (seconds)</label>
                  <SimpleInput
                    type="number"
                    value={exercise.time || ''}
                    onChange={(e) => handleExerciseUpdate(exercise.id, { time: parseInt(e.target.value) || null })}
                    placeholder="30"
                    min="1"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rest (seconds)</label>
                <SimpleInput
                  type="number"
                  value={exercise.rest || ''}
                  onChange={(e) => handleExerciseUpdate(exercise.id, { rest: parseInt(e.target.value) || 60 })}
                  placeholder="60"
                  min="0"
                />
              </div>
            </div>

            {editingExercise === exercise.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Notes</label>
                <SimpleInput
                  value={exercise.notes || ''}
                  onChange={(e) => handleExerciseUpdate(exercise.id, { notes: e.target.value })}
                  placeholder="Add notes about form, technique, or modifications..."
                />
              </div>
            )}
          </SimpleCard>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Workout Details</h2>
        <p className="text-gray-600">Add final details and save your workout</p>
      </div>

      <div className="space-y-6">
        <SimpleInput
          label="Workout Name"
          value={workoutData.name}
          onChange={(e) => setWorkoutData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter workout name..."
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Workout Type</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['strength', 'cardio', 'flexibility', 'rest', 'mixed'].map((type) => (
              <SimpleButton
                key={type}
                variant={workoutData.type === type ? 'primary' : 'secondary'}
                onClick={() => setWorkoutData(prev => ({ ...prev, type }))}
                className="flex flex-col items-center gap-2 py-4"
              >
                {getWorkoutIcon(type)}
                <span className="text-sm capitalize">{type}</span>
              </SimpleButton>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={workoutData.description}
            onChange={(e) => setWorkoutData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your workout goals or notes..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (minutes)</label>
          <SimpleInput
            type="number"
            value={workoutData.estimatedDuration || Math.ceil(calculateEstimatedDuration())}
            onChange={(e) => setWorkoutData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
            min="1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Auto-calculated: ~{Math.ceil(calculateEstimatedDuration())} minutes
          </p>
        </div>

        {/* Workout Preview */}
        <SimpleCard className="bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workout Preview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Exercises:</span>
              <span>{workoutData.exercises.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Estimated Time:</span>
              <span>{Math.ceil(calculateEstimatedDuration())} minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Sets:</span>
              <span>{workoutData.exercises.reduce((sum, ex) => sum + ex.sets, 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Workout Type:</span>
              <span className="capitalize">{workoutData.type}</span>
            </div>
          </div>
        </SimpleCard>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedTemplate !== null || (!selectedTemplate && true);
      case 2:
        return workoutData.exercises.length > 0;
      case 3:
        return workoutData.exercises.every(ex => ex.sets > 0);
      case 4:
        return workoutData.name.trim().length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4 && canProceed()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    const finalWorkoutData = {
      ...workoutData,
      estimatedDuration: workoutData.estimatedDuration || Math.ceil(calculateEstimatedDuration()),
      exercises: workoutData.exercises.map(ex => ({
        ...ex,
        setResults: Array(ex.sets).fill().map(() => ({
          weight: ex.weight || 0,
          reps: ex.reps || 0,
          time: ex.time || 0,
          completed: false
        }))
      }))
    };
    onComplete(finalWorkoutData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Create New Workout</h1>
              <SimpleButton
                variant="ghost"
                onClick={onCancel}
                className="rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </SimpleButton>
            </div>
            {renderStepIndicator()}
          </div>

          <div className="p-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-between">
            <SimpleButton
              variant="secondary"
              onClick={step === 1 ? onCancel : handleBack}
            >
              {step === 1 ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </>
              )}
            </SimpleButton>

            <div className="flex items-center gap-3">
              {step < 4 ? (
                <SimpleButton
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </SimpleButton>
              ) : (
                <SimpleButton
                  variant="success"
                  onClick={handleComplete}
                  disabled={!canProceed()}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Create Workout
                </SimpleButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullWorkoutWizard;