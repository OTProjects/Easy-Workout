import React, { useState, useMemo } from 'react';
import { Plus, X, Search, ChevronRight, ChevronLeft, Target, Dumbbell, Heart, Wind, Coffee, Zap } from 'lucide-react';
import Card, { WorkoutCard, ExerciseCard } from './ui/Card';
import Button, { IconButton } from './ui/Button';
import Input, { SearchInput, NumberInput, TextArea } from './ui/Input';
import { designSystem, getWorkoutTypeStyle, getWorkoutTypeIcon } from '../styles/designSystem';

const WORKOUT_TEMPLATES = [
  {
    id: 'strength-upper',
    name: 'Upper Body Strength',
    type: 'strength',
    description: 'Build upper body muscle and strength',
    duration: 45,
    difficulty: 'Intermediate',
    exercises: [
      { name: 'Push-ups', muscleGroups: ['chest', 'shoulders', 'triceps'], sets: 3, reps: 12 },
      { name: 'Pull-ups', muscleGroups: ['back', 'biceps'], sets: 3, reps: 8 },
      { name: 'Dumbbell Rows', muscleGroups: ['back', 'biceps'], sets: 3, reps: 10 },
      { name: 'Shoulder Press', muscleGroups: ['shoulders', 'triceps'], sets: 3, reps: 10 }
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
      { name: 'Burpees', muscleGroups: ['full body'], sets: 4, time: 30 },
      { name: 'Mountain Climbers', muscleGroups: ['core', 'cardio'], sets: 4, time: 30 },
      { name: 'Jump Squats', muscleGroups: ['legs', 'glutes'], sets: 4, time: 30 },
      { name: 'High Knees', muscleGroups: ['legs', 'cardio'], sets: 4, time: 30 }
    ]
  },
  {
    id: 'flexibility-yoga',
    name: 'Morning Yoga Flow',
    type: 'flexibility',
    description: 'Gentle stretching and mobility',
    duration: 30,
    difficulty: 'Beginner',
    exercises: [
      { name: 'Cat-Cow Stretch', muscleGroups: ['back', 'core'], sets: 1, time: 60 },
      { name: 'Downward Dog', muscleGroups: ['shoulders', 'hamstrings'], sets: 1, time: 45 },
      { name: 'Warrior I', muscleGroups: ['legs', 'hip flexors'], sets: 2, time: 30 },
      { name: 'Child\'s Pose', muscleGroups: ['back', 'shoulders'], sets: 1, time: 60 }
    ]
  }
];

const EXERCISE_LIBRARY = [
  // Strength exercises
  { name: 'Push-ups', type: 'strength', muscleGroups: ['chest', 'shoulders', 'triceps'], equipment: 'bodyweight' },
  { name: 'Pull-ups', type: 'strength', muscleGroups: ['back', 'biceps'], equipment: 'pull-up bar' },
  { name: 'Squats', type: 'strength', muscleGroups: ['legs', 'glutes'], equipment: 'bodyweight' },
  { name: 'Deadlifts', type: 'strength', muscleGroups: ['back', 'legs', 'glutes'], equipment: 'barbell' },
  { name: 'Bench Press', type: 'strength', muscleGroups: ['chest', 'shoulders', 'triceps'], equipment: 'barbell' },
  { name: 'Shoulder Press', type: 'strength', muscleGroups: ['shoulders', 'triceps'], equipment: 'dumbbells' },
  
  // Cardio exercises
  { name: 'Burpees', type: 'cardio', muscleGroups: ['full body'], equipment: 'bodyweight' },
  { name: 'Mountain Climbers', type: 'cardio', muscleGroups: ['core', 'cardio'], equipment: 'bodyweight' },
  { name: 'Jump Rope', type: 'cardio', muscleGroups: ['legs', 'cardio'], equipment: 'jump rope' },
  { name: 'Running', type: 'cardio', muscleGroups: ['legs', 'cardio'], equipment: 'none' },
  { name: 'Cycling', type: 'cardio', muscleGroups: ['legs', 'cardio'], equipment: 'bike' },
  { name: 'High Knees', type: 'cardio', muscleGroups: ['legs', 'cardio'], equipment: 'bodyweight' },
  
  // Flexibility exercises
  { name: 'Cat-Cow Stretch', type: 'flexibility', muscleGroups: ['back', 'core'], equipment: 'mat' },
  { name: 'Downward Dog', type: 'flexibility', muscleGroups: ['shoulders', 'hamstrings'], equipment: 'mat' },
  { name: 'Warrior I', type: 'flexibility', muscleGroups: ['legs', 'hip flexors'], equipment: 'mat' },
  { name: 'Child\'s Pose', type: 'flexibility', muscleGroups: ['back', 'shoulders'], equipment: 'mat' },
  { name: 'Pigeon Pose', type: 'flexibility', muscleGroups: ['hips', 'glutes'], equipment: 'mat' },
  { name: 'Hamstring Stretch', type: 'flexibility', muscleGroups: ['hamstrings'], equipment: 'none' }
];

const WorkoutWizard = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [workoutData, setWorkoutData] = useState({
    name: '',
    type: 'mixed',
    exercises: [],
    description: '',
    estimatedDuration: 0
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [exerciseFilter, setExerciseFilter] = useState('all');

  const WIZARD_STEPS = [
    { id: 1, title: 'Choose Template', subtitle: 'Start with a template or create from scratch' },
    { id: 2, title: 'Add Exercises', subtitle: 'Build your workout routine' },
    { id: 3, title: 'Customize Details', subtitle: 'Fine-tune your workout' },
    { id: 4, title: 'Review & Save', subtitle: 'Complete your workout creation' }
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
        orderIndex: index
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
      estimatedDuration: 0
    });
  };

  const handleAddExercise = (exercise) => {
    const newExercise = {
      ...exercise,
      id: `exercise-${Date.now()}`,
      sets: 3,
      reps: exercise.type === 'cardio' ? null : 10,
      time: exercise.type !== 'strength' ? 30 : null,
      orderIndex: workoutData.exercises.length
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
            <WorkoutCard
              key={template.id}
              title={template.name}
              subtitle={template.description}
              exerciseCount={template.exercises.length}
              workoutType={template.type}
              duration={template.duration}
              difficulty={template.difficulty}
              onClick={() => handleTemplateSelect(template)}
              className={selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''}
              actions={
                <div className="flex items-center text-blue-600">
                  {getWorkoutIcon(template.type)}
                </div>
              }
            />
          ))}
        </div>

        {/* Custom workout option */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Custom Workout</h3>
          <Card 
            hover 
            onClick={handleFromScratch}
            className={`${!selectedTemplate ? 'ring-2 ring-blue-500' : ''} h-48 flex flex-col items-center justify-center text-center`}
          >
            <div className="p-4 bg-blue-50 rounded-full mb-4">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Create from Scratch</h4>
            <p className="text-gray-600">Build your own custom workout routine</p>
          </Card>
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
                <Button
                  key={filter}
                  variant={exerciseFilter === filter ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setExerciseFilter(filter)}
                  className="whitespace-nowrap"
                >
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredExercises.map((exercise, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getWorkoutTypeStyle(exercise.type).secondary}`}>
                    {getWorkoutIcon(exercise.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                    <p className="text-sm text-gray-500">
                      {exercise.muscleGroups.join(', ')}
                    </p>
                  </div>
                </div>
                <IconButton
                  icon={<Plus className="w-4 h-4" />}
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddExercise(exercise)}
                />
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
                <div key={exercise.id} className="p-4 bg-white border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                      <p className="text-sm text-gray-500">
                        {exercise.muscleGroups?.join(', ')}
                      </p>
                    </div>
                    <IconButton
                      icon={<X className="w-4 h-4" />}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExercise(exercise.id)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput
                      label="Sets"
                      value={exercise.sets}
                      min={1}
                      onChange={(e) => handleExerciseUpdate(exercise.id, { sets: parseInt(e.target.value) })}
                    />
                    {exercise.reps !== null && (
                      <NumberInput
                        label="Reps"
                        value={exercise.reps}
                        min={1}
                        onChange={(e) => handleExerciseUpdate(exercise.id, { reps: parseInt(e.target.value) })}
                      />
                    )}
                    {exercise.time !== null && (
                      <NumberInput
                        label="Time (s)"
                        value={exercise.time}
                        min={1}
                        onChange={(e) => handleExerciseUpdate(exercise.id, { time: parseInt(e.target.value) })}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Workout</h2>
        <p className="text-gray-600">Add final details to complete your workout</p>
      </div>

      <div className="space-y-6">
        <Input
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
              <button
                key={type}
                onClick={() => setWorkoutData(prev => ({ ...prev, type }))}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-300 text-center
                  ${workoutData.type === type
                    ? `border-blue-500 bg-blue-50`
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  {getWorkoutIcon(type)}
                  <span className="text-sm font-medium capitalize">{type}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <TextArea
          label="Description (Optional)"
          value={workoutData.description}
          onChange={(e) => setWorkoutData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your workout goals or notes..."
          rows={3}
        />

        <NumberInput
          label="Estimated Duration (minutes)"
          value={workoutData.estimatedDuration}
          onChange={(e) => setWorkoutData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
          min={1}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Workout</h2>
        <p className="text-gray-600">Make sure everything looks good before saving</p>
      </div>

      <WorkoutCard
        title={workoutData.name || 'Untitled Workout'}
        subtitle={workoutData.description}
        exerciseCount={workoutData.exercises.length}
        workoutType={workoutData.type}
        duration={workoutData.estimatedDuration}
        difficulty="Custom"
      />

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Exercises</h3>
        {workoutData.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            name={exercise.name}
            muscleGroups={exercise.muscleGroups}
            sets={exercise.sets}
            reps={exercise.reps}
            time={exercise.time}
          />
        ))}
      </div>
    </div>
  );

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedTemplate !== null || (!selectedTemplate && true); // From scratch is always valid
      case 2:
        return workoutData.exercises.length > 0;
      case 3:
        return workoutData.name.trim().length > 0;
      case 4:
        return true;
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
    onComplete(workoutData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Create New Workout</h1>
              <IconButton
                icon={<X className="w-5 h-5" />}
                variant="ghost"
                onClick={onCancel}
              />
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
            <Button
              variant="secondary"
              onClick={step === 1 ? onCancel : handleBack}
              icon={step > 1 ? <ChevronLeft className="w-4 h-4" /> : null}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            <div className="flex items-center gap-3">
              {step < 4 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  icon={<ChevronRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={handleComplete}
                  icon={<Target className="w-4 h-4" />}
                >
                  Create Workout
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutWizard;