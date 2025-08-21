import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, X, GripVertical, Trash2, ChevronDown, Target, Calendar, BarChart3, Dumbbell, Minus, RotateCcw, Edit2 } from 'lucide-react';
import { supabase, hasValidCredentials } from './supabase';
import { workoutService } from './services/workoutService';
import Auth from './components/Auth';

const WorkoutApp = () => {
  // Authentication state
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check authentication status on component mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Load user data when authenticated
  useEffect(() => {
    if (user) {
      loadWorkouts()
      loadRoutine()
    }
  }, [user])


  // Cleanup effect for debounce timeouts
  useEffect(() => {
    return () => {
      // Clear all pending timeouts on unmount
      Object.values(debounceTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  const loadWorkouts = async () => {
    try {
      const workouts = await workoutService.getWorkouts()
      
      // Transform the workouts to match the expected local state format
      const transformedWorkouts = workouts.map(workout => ({
        ...workout,
        exercises: (workout.exercises || []).map(exercise => ({
          id: exercise.id,
          exerciseId: exercise.exercise_id || exercise.id,
          name: exercise.name,
          muscleGroups: exercise.muscle_groups || [],
          sets: exercise.sets,
          repsOrTime: exercise.reps_or_time || 'reps',
          repsValue: exercise.reps_value || 10,
          timeValue: exercise.time_value || 30,
          setResults: exercise.set_results || []
        }))
      }))
      
      setCreatedWorkouts(transformedWorkouts)
    } catch (error) {
      console.error('Error loading workouts:', error)
    }
  }

  const loadRoutine = async () => {
    try {
      const routine = await workoutService.getRoutine()
      if (routine) {
        setSelectedWorkouts(routine.selected_workout_ids || [])
        setOrderedRoutineItems(routine.ordered_routine_items || [])
        setRotationCycles(routine.rotation_cycles || 4)
      }
    } catch (error) {
      console.error('Error loading routine:', error)
    }
  }

  const exerciseLibraryByMuscle = {
    'Back': [
      { id: 1, name: 'Cross-Body Lat Pull-Around', muscleGroups: ['Back'], muscleWeights: [100] },
      { id: 2, name: 'Seated DB Shoulder Press', muscleGroups: ['Back', 'Shoulders'], muscleWeights: [60, 40] },
      { id: 3, name: 'Paused Barbell RDL', muscleGroups: ['Back', 'Legs'], muscleWeights: [60, 40] },
      { id: 4, name: 'Chest-Supported Machine Row', muscleGroups: ['Back'], muscleWeights: [100] },
      { id: 5, name: 'Superset A1: Assisted Pull-Up', muscleGroups: ['Back'], muscleWeights: [100] },
      { id: 6, name: 'Neutral-Grip Lat Pulldown', muscleGroups: ['Back'], muscleWeights: [100] }
    ],
    'Chest': [
      { id: 7, name: 'Low Incline Smith Machine Press', muscleGroups: ['Chest'], muscleWeights: [100] },
      { id: 8, name: 'Bent-Over Cable Pec Flye', muscleGroups: ['Chest'], muscleWeights: [100] }
    ],
    'Legs': [
      { id: 9, name: 'Machine Hip Adduction', muscleGroups: ['Legs'], muscleWeights: [100] },
      { id: 10, name: 'Leg Press', muscleGroups: ['Legs'], muscleWeights: [100] },
      { id: 11, name: 'Superset B1: Seated Leg Curl', muscleGroups: ['Legs'], muscleWeights: [100] },
      { id: 12, name: 'Superset B2: Leg Extension', muscleGroups: ['Legs'], muscleWeights: [100] },
      { id: 13, name: 'Lying Leg Curl', muscleGroups: ['Legs'], muscleWeights: [100] },
      { id: 14, name: 'Hack Squat', muscleGroups: ['Legs'], muscleWeights: [100] },
      { id: 15, name: 'Leg Press Calf Press', muscleGroups: ['Legs'], muscleWeights: [100] },
      { id: 16, name: 'Standing Calf Raise', muscleGroups: ['Legs'], muscleWeights: [100] }
    ],
    'Shoulders': [
      { id: 17, name: 'Cuffed Behind-The-Back Lateral Raise', muscleGroups: ['Shoulders'], muscleWeights: [100] },
      { id: 18, name: 'Cable Paused Shrug-In', muscleGroups: ['Shoulders'], muscleWeights: [100] },
      { id: 19, name: 'Cable Reverse Flye (Mechanical Dropset)', muscleGroups: ['Shoulders'], muscleWeights: [100] }
    ],
    'Triceps': [
      { id: 20, name: 'Overhead Cable Triceps Extension (Bar)', muscleGroups: ['Triceps'], muscleWeights: [100] },
      { id: 21, name: 'Superset A2: Paused Assisted Dip', muscleGroups: ['Triceps'], muscleWeights: [100] },
      { id: 22, name: 'Triceps Pressdown (Bar)', muscleGroups: ['Triceps'], muscleWeights: [100] },
      { id: 23, name: 'Cable Triceps Kickback', muscleGroups: ['Triceps'], muscleWeights: [100] }
    ],
    'Abs': [
      { id: 24, name: 'Lying Paused Rope Face Pull', muscleGroups: ['Abs'], muscleWeights: [100] },
      { id: 25, name: 'Cable Crunch', muscleGroups: ['Abs'], muscleWeights: [100] },
      { id: 26, name: 'Roman Chair Leg Raise', muscleGroups: ['Abs'], muscleWeights: [100] }
    ],
    'Biceps': [
      { id: 27, name: 'Hammer Preacher Curl', muscleGroups: ['Biceps'], muscleWeights: [100] },
      { id: 28, name: 'Bayesian Cable Curl', muscleGroups: ['Biceps'], muscleWeights: [100] },
      { id: 29, name: 'Bottom-2/3 Constant Tension Preacher Curl', muscleGroups: ['Biceps'], muscleWeights: [100] }
    ],
    'Custom': [
      { id: 30, name: 'Weak Point Exercise 1', muscleGroups: ['Custom'], muscleWeights: [100] },
      { id: 31, name: 'Weak Point Exercise 2 (optional)', muscleGroups: ['Custom'], muscleWeights: [100] }
    ]
  };

  // Flatten the exercise library for backward compatibility
  const exerciseLibrary = Object.values(exerciseLibraryByMuscle).flat();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [currentDay, setCurrentDay] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentTab, setCurrentTab] = useState('workout');
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dayNames] = useState(days.map(day => day));
  const [workoutPlans, setWorkoutPlans] = useState(
    Array(4).fill().map(() => Array(3).fill().map(() => []))
  );
  const [collapsedExercises, setCollapsedExercises] = useState({});
  const [showUpperLower, setShowUpperLower] = useState(false);
  const [libraryMode, setLibraryMode] = useState('exercises');
  const [collapsedMuscleGroups, setCollapsedMuscleGroups] = useState({});
  
  // Routine Builder State
  const [rotationCycles, setRotationCycles] = useState(4);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [createdWorkouts, setCreatedWorkouts] = useState([]);
  const [orderedRoutineItems, setOrderedRoutineItems] = useState([]);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  
  // Summary View State - default everything to collapsed
  const [collapsedCycles, setCollapsedCycles] = useState(() => {
    const collapsed = {};
    for (let i = 0; i < 10; i++) { // Cover up to 10 cycles
      collapsed[i] = true;
    }
    return collapsed;
  });
  const [collapsedWorkouts, setCollapsedWorkouts] = useState(() => {
    const collapsed = {};
    for (let i = 0; i < 10; i++) { // Cover up to 10 cycles
      for (let j = 0; j < 20; j++) { // Cover up to 20 items per cycle
        collapsed[`${i}-${j}`] = true;
      }
    }
    return collapsed;
  });
  
  // Workout Builder State
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [editingExerciseName, setEditingExerciseName] = useState(null);
  const [editingWorkoutName, setEditingWorkoutName] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedCopyExercises, setSelectedCopyExercises] = useState([]);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);

  // Debounce ref for set value updates
  const debounceTimeouts = useRef({});

  // Custom component for uncontrolled set inputs to prevent focus loss
  const SetInput = React.memo(({ exerciseIndex, setIndex, field, initialValue, placeholder, onValueChange, stableKey }) => {
    const inputRef = useRef(null);
    const lastSavedValue = useRef(initialValue);
    
    const handleChange = (e) => {
      const value = e.target.value;
      // Don't trigger re-renders during typing - just save the data
      onValueChange(exerciseIndex, setIndex, field, value);
    };
    
    // Only update the input if the value changed from outside (not from typing)
    useEffect(() => {
      if (inputRef.current && 
          inputRef.current !== document.activeElement && 
          initialValue !== lastSavedValue.current) {
        inputRef.current.value = initialValue || '';
        lastSavedValue.current = initialValue;
      }
    }, [initialValue]);
    
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        defaultValue={initialValue || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-16 sm:w-20 px-2 py-2 sm:py-1.5 bg-white border-0 rounded-lg text-sm text-center font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 shadow-sm min-h-[44px] sm:min-h-[36px]"
      />
    );
  });

  const filteredExercises = exerciseLibrary.filter(exercise => {
    return exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const addExerciseDirectly = async (exercise) => {
    if (!currentWorkout) return;
    
    try {
      const newExercise = {
        workout_id: currentWorkout.id,
        name: exercise.name,
        muscle_groups: exercise.muscleGroups,
        sets: 3,
        reps_or_time: 'reps',
        reps_value: 10,
        time_value: 30,
        set_results: Array(3).fill().map(() => ({ weight: '', reps: '10' })),
        order_index: currentWorkout.exercises?.length || 0
      };

      const savedExercise = await workoutService.createExercise(newExercise);
      
      const exerciseForState = {
        id: savedExercise.id,
        exerciseId: exercise.id,
        name: savedExercise.name,
        muscleGroups: savedExercise.muscle_groups,
        sets: savedExercise.sets,
        repsOrTime: savedExercise.reps_or_time,
        repsValue: savedExercise.reps_value,
        timeValue: savedExercise.time_value,
        setResults: savedExercise.set_results
      };

      const updatedWorkouts = createdWorkouts.map(workout => 
        workout.id === currentWorkout.id 
          ? { ...workout, exercises: [...(workout.exercises || []), exerciseForState] }
          : workout
      );
      setCreatedWorkouts(updatedWorkouts);
      setCurrentWorkout({ ...currentWorkout, exercises: [...(currentWorkout.exercises || []), exerciseForState] });
      setShowExerciseLibrary(false);
      setLibraryMode('exercises');
      setSelectedExercises([]);
      setSelectedCopyExercises([]);
    } catch (error) {
      console.error('Error adding exercise:', error);
      alert('Failed to add exercise. Please try again.');
    }
  };

  const addMultipleExercises = async () => {
    if (!currentWorkout || selectedExercises.length === 0) return;
    
    try {
      const exercisesToCreate = selectedExercises.map((exercise, index) => ({
        workout_id: currentWorkout.id,
        name: exercise.name,
        muscle_groups: exercise.muscleGroups,
        sets: 3,
        reps_or_time: 'reps',
        reps_value: 10,
        time_value: 30,
        set_results: Array(3).fill().map(() => ({ weight: '', reps: '10' })),
        order_index: (currentWorkout.exercises?.length || 0) + index
      }));

      const savedExercises = await Promise.all(
        exercisesToCreate.map(exercise => workoutService.createExercise(exercise))
      );
      
      const exercisesForState = savedExercises.map((savedExercise, index) => ({
        id: savedExercise.id,
        exerciseId: selectedExercises[index].id,
        name: savedExercise.name,
        muscleGroups: savedExercise.muscle_groups,
        sets: savedExercise.sets,
        repsOrTime: savedExercise.reps_or_time,
        repsValue: savedExercise.reps_value,
        timeValue: savedExercise.time_value,
        setResults: savedExercise.set_results
      }));

      const updatedWorkouts = createdWorkouts.map(workout => 
        workout.id === currentWorkout.id 
          ? { ...workout, exercises: [...(workout.exercises || []), ...exercisesForState] }
          : workout
      );
      setCreatedWorkouts(updatedWorkouts);
      setCurrentWorkout({ ...currentWorkout, exercises: [...(currentWorkout.exercises || []), ...exercisesForState] });
      setShowExerciseLibrary(false);
      setLibraryMode('exercises');
      setSelectedExercises([]);
      setSelectedCopyExercises([]);
    } catch (error) {
      console.error('Error adding exercises:', error);
      alert('Failed to add exercises. Please try again.');
    }
  };

  const toggleExerciseSelection = (exercise) => {
    setSelectedExercises(prev => {
      const isSelected = prev.some(e => e.id === exercise.id);
      if (isSelected) {
        return prev.filter(e => e.id !== exercise.id);
      } else {
        return [...prev, exercise];
      }
    });
  };

  const updateWorkoutNameInline = async (workoutId, newName) => {
    try {
      await workoutService.updateWorkout(workoutId, { name: newName });
      
      const updatedWorkouts = createdWorkouts.map(workout => 
        workout.id === workoutId ? { ...workout, name: newName } : workout
      );
      setCreatedWorkouts(updatedWorkouts);
      if (currentWorkout?.id === workoutId) {
        setCurrentWorkout({ ...currentWorkout, name: newName });
      }
    } catch (error) {
      console.error('Error updating workout name:', error);
      alert('Failed to update workout name. Please try again.');
    }
  };

  const copyExerciseFromWorkout = async (exercise) => {
    if (!currentWorkout) return;
    
    try {
      const exerciseToCreate = {
        workout_id: currentWorkout.id,
        name: exercise.name,
        muscle_groups: exercise.muscleGroups,
        sets: exercise.sets,
        reps_or_time: exercise.repsOrTime,
        reps_value: exercise.repsValue,
        time_value: exercise.timeValue,
        set_results: exercise.setResults ? exercise.setResults.map(set => ({ ...set })) : Array(3).fill().map(() => ({ weight: '', reps: '10' })),
        order_index: currentWorkout.exercises?.length || 0
      };

      const savedExercise = await workoutService.createExercise(exerciseToCreate);
      
      const copiedExercise = {
        id: savedExercise.id,
        exerciseId: exercise.exerciseId,
        name: savedExercise.name,
        muscleGroups: savedExercise.muscle_groups,
        sets: savedExercise.sets,
        repsOrTime: savedExercise.reps_or_time,
        repsValue: savedExercise.reps_value,
        timeValue: savedExercise.time_value,
        setResults: savedExercise.set_results
      };

      const updatedWorkouts = createdWorkouts.map(workout => 
        workout.id === currentWorkout.id 
          ? { ...workout, exercises: [...(workout.exercises || []), copiedExercise] }
          : workout
      );
      setCreatedWorkouts(updatedWorkouts);
      setCurrentWorkout({ ...currentWorkout, exercises: [...(currentWorkout.exercises || []), copiedExercise] });
      setShowExerciseLibrary(false);
      setLibraryMode('exercises');
    } catch (error) {
      console.error('Error copying exercise:', error);
      alert('Failed to copy exercise. Please try again.');
    }
  };

  const toggleCopyExerciseSelection = (exercise) => {
    setSelectedCopyExercises(prev => {
      const isSelected = prev.some(e => e.id === exercise.id);
      if (isSelected) {
        return prev.filter(e => e.id !== exercise.id);
      } else {
        return [...prev, exercise];
      }
    });
  };

  const addMultipleCopyExercises = async () => {
    if (!currentWorkout || selectedCopyExercises.length === 0) return;
    
    try {
      const exercisesToCreate = selectedCopyExercises.map((exercise, index) => ({
        workout_id: currentWorkout.id,
        name: exercise.name,
        muscle_groups: exercise.muscleGroups,
        sets: exercise.sets,
        reps_or_time: exercise.repsOrTime,
        reps_value: exercise.repsValue,
        time_value: exercise.timeValue,
        set_results: exercise.setResults ? exercise.setResults.map(set => ({ ...set })) : Array(3).fill().map(() => ({ weight: '', reps: '10' })),
        order_index: (currentWorkout.exercises?.length || 0) + index
      }));

      const savedExercises = await Promise.all(
        exercisesToCreate.map(exercise => workoutService.createExercise(exercise))
      );
      
      const copiedExercises = savedExercises.map((savedExercise, index) => ({
        id: savedExercise.id,
        exerciseId: selectedCopyExercises[index].exerciseId,
        name: savedExercise.name,
        muscleGroups: savedExercise.muscle_groups,
        sets: savedExercise.sets,
        repsOrTime: savedExercise.reps_or_time,
        repsValue: savedExercise.reps_value,
        timeValue: savedExercise.time_value,
        setResults: savedExercise.set_results
      }));

      const updatedWorkouts = createdWorkouts.map(workout => 
        workout.id === currentWorkout.id 
          ? { ...workout, exercises: [...(workout.exercises || []), ...copiedExercises] }
          : workout
      );
      setCreatedWorkouts(updatedWorkouts);
      setCurrentWorkout({ ...currentWorkout, exercises: [...(currentWorkout.exercises || []), ...copiedExercises] });
      setShowExerciseLibrary(false);
      setLibraryMode('exercises');
      setSelectedCopyExercises([]);
    } catch (error) {
      console.error('Error copying exercises:', error);
      alert('Failed to copy exercises. Please try again.');
    }
  };

  const MuscleGroupBar = ({ muscleGroups, muscleWeights }) => {
    const muscleColors = {
      'Chest': 'bg-red-500',
      'Triceps': 'bg-orange-500',
      'Shoulders': 'bg-yellow-500',
      'Legs': 'bg-green-500',
      'Back': 'bg-blue-500',
      'Abs': 'bg-purple-500',
      'Biceps': 'bg-teal-500',
      'Custom': 'bg-pink-500',
      'Upper': 'bg-blue-600',
      'Lower': 'bg-green-600',
      'Other': 'bg-gray-400'
    };

    return (
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
        {muscleGroups.map((muscle, index) => (
          <div
            key={muscle}
            className={`${muscleColors[muscle] || 'bg-gray-400'} h-full`}
            style={{ width: `${muscleWeights[index]}%` }}
            title={`${muscle}: ${muscleWeights[index]}%`}
          />
        ))}
      </div>
    );
  };

  const getUpperLowerDistribution = (exercises) => {
    const upperMuscles = ['Chest', 'Triceps', 'Back', 'Biceps', 'Shoulders'];
    const lowerMuscles = ['Legs'];
    
    const distribution = { upper: 0, lower: 0, core: 0 };
    let totalWeight = 0;

    exercises.forEach(exercise => {
      if (exercise.muscleGroups && exercise.muscleWeights) {
        exercise.muscleGroups.forEach((muscle, index) => {
          const weight = exercise.muscleWeights[index] || 0;
          totalWeight += weight;
          
          if (upperMuscles.includes(muscle)) {
            distribution.upper += weight;
          } else if (lowerMuscles.includes(muscle)) {
            distribution.lower += weight;
          } else if (muscle === 'Abs') {
            distribution.core += weight;
          }
        });
      }
    });

    if (totalWeight === 0) return { upper: 0, lower: 0, core: 0 };

    let upperPercent = Math.round((distribution.upper / totalWeight) * 100);
    let lowerPercent = Math.round((distribution.lower / totalWeight) * 100);
    let corePercent = Math.round((distribution.core / totalWeight) * 100);

    const total = upperPercent + lowerPercent + corePercent;
    if (total !== 100 && total > 0) {
      const diff = 100 - total;
      if (upperPercent >= lowerPercent && upperPercent >= corePercent) {
        upperPercent += diff;
      } else if (lowerPercent >= corePercent) {
        lowerPercent += diff;
      } else {
        corePercent += diff;
      }
    }

    return {
      upper: upperPercent,
      lower: lowerPercent,
      core: corePercent
    };
  };

  const calculateDayMuscleDistribution = (exercises) => {
    const muscleTotal = {};
    let totalWeight = 0;

    exercises.forEach(exercise => {
      if (exercise.muscleGroups && exercise.muscleWeights) {
        exercise.muscleGroups.forEach((muscle, index) => {
          const weight = exercise.muscleWeights[index] || 0;
          muscleTotal[muscle] = (muscleTotal[muscle] || 0) + weight;
          totalWeight += weight;
        });
      }
    });

    if (totalWeight === 0) return { muscleGroups: [], muscleWeights: [] };

    const sortedMuscles = Object.entries(muscleTotal)
      .map(([muscle, weight]) => ({ 
        muscle, 
        weight: (weight / totalWeight) * 100
      }))
      .sort((a, b) => b.weight - a.weight);

    const top3 = sortedMuscles.slice(0, 3);
    const remaining = sortedMuscles.slice(3);
    
    const muscleGroups = top3.map(item => item.muscle);
    let muscleWeights = top3.map(item => item.weight);
    
    if (remaining.length > 0) {
      const otherWeight = remaining.reduce((sum, item) => sum + item.weight, 0);
      muscleGroups.push('Other');
      muscleWeights.push(otherWeight);
    }

    muscleWeights = muscleWeights.map(weight => Math.round(weight));
    
    const total = muscleWeights.reduce((sum, weight) => sum + weight, 0);
    if (total !== 100 && muscleWeights.length > 0) {
      const diff = 100 - total;
      const maxIndex = muscleWeights.indexOf(Math.max(...muscleWeights));
      muscleWeights[maxIndex] += diff;
    }

    return { muscleGroups, muscleWeights };
  };

  const removeExercise = async (exerciseIndex) => {
    if (!currentWorkout) return;
    
    try {
      const exerciseToDelete = currentWorkout.exercises[exerciseIndex];
      
      await workoutService.deleteExercise(exerciseToDelete.id);
      
      const updatedExercises = currentWorkout.exercises.filter((_, index) => index !== exerciseIndex);
      const updatedWorkouts = createdWorkouts.map(workout => 
        workout.id === currentWorkout.id 
          ? { ...workout, exercises: updatedExercises }
          : workout
      );
      setCreatedWorkouts(updatedWorkouts);
      setCurrentWorkout({ ...currentWorkout, exercises: updatedExercises });
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Failed to delete exercise. Please try again.');
    }
  };

  const toggleExerciseCollapse = (exerciseId) => {
    setCollapsedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const updateExerciseSets = async (exerciseIndex, change) => {
    if (!currentWorkout?.exercises[exerciseIndex]) return;
    
    try {
      const exercise = currentWorkout.exercises[exerciseIndex];
      const newSets = Math.max(1, exercise.sets + change);
      
      const updatedExercise = { ...exercise, sets: newSets };
      
      if (newSets > exercise.setResults.length) {
        const additionalSets = newSets - exercise.setResults.length;
        const targetValue = exercise.repsOrTime === 'time' ? exercise.timeValue : exercise.repsValue;
        updatedExercise.setResults = [
          ...exercise.setResults,
          ...Array(additionalSets).fill().map(() => ({ weight: '', reps: targetValue.toString() }))
        ];
      } else if (newSets < exercise.setResults.length) {
        updatedExercise.setResults = exercise.setResults.slice(0, newSets);
      }
      
      await workoutService.updateExercise(exercise.id, {
        sets: newSets,
        set_results: updatedExercise.setResults
      });
      
      const updatedExercises = [...currentWorkout.exercises];
      updatedExercises[exerciseIndex] = updatedExercise;
      
      const updatedWorkouts = createdWorkouts.map(workout => 
        workout.id === currentWorkout.id 
          ? { ...workout, exercises: updatedExercises }
          : workout
      );
      setCreatedWorkouts(updatedWorkouts);
      setCurrentWorkout({ ...currentWorkout, exercises: updatedExercises });
    } catch (error) {
      console.error('Error updating exercise sets:', error);
      alert('Failed to update exercise sets. Please try again.');
    }
  };

  // Store exercise data in a ref to avoid triggering re-renders during typing
  const exerciseDataRef = useRef({});

  const updateSetValue = useCallback((exerciseIndex, setIndex, field, value) => {
    if (!currentWorkout?.exercises[exerciseIndex]) return;
    
    const exercise = currentWorkout.exercises[exerciseIndex];
    const exerciseKey = `${exercise.id}`;
    
    // Update our local ref immediately (no re-render)
    if (!exerciseDataRef.current[exerciseKey]) {
      exerciseDataRef.current[exerciseKey] = { ...exercise };
    }
    
    const localExercise = exerciseDataRef.current[exerciseKey];
    if (!localExercise.setResults) {
      localExercise.setResults = [...exercise.setResults];
    }
    
    if (!localExercise.setResults[setIndex]) {
      localExercise.setResults[setIndex] = { weight: '', reps: '' };
    }
    
    localExercise.setResults[setIndex][field] = value;
    
    // Debounce both the state update AND database save
    const debounceKey = `${exercise.id}-${setIndex}-${field}`;
    
    if (debounceTimeouts.current[debounceKey]) {
      clearTimeout(debounceTimeouts.current[debounceKey]);
    }
    
    debounceTimeouts.current[debounceKey] = setTimeout(async () => {
      try {
        // Update the database
        await workoutService.updateExercise(exercise.id, {
          set_results: localExercise.setResults
        });
        
        // Update React state (this will cause a re-render, but only after typing stops)
        setCreatedWorkouts(prevWorkouts => {
          return prevWorkouts.map(workout => {
            if (workout.id === currentWorkout.id) {
              const newExercises = [...workout.exercises];
              newExercises[exerciseIndex] = { 
                ...newExercises[exerciseIndex], 
                setResults: [...localExercise.setResults]
              };
              return { ...workout, exercises: newExercises };
            }
            return workout;
          });
        });
        
        setCurrentWorkout(prevWorkout => {
          if (!prevWorkout) return prevWorkout;
          const newExercises = [...prevWorkout.exercises];
          newExercises[exerciseIndex] = { 
            ...newExercises[exerciseIndex], 
            setResults: [...localExercise.setResults]
          };
          return { ...prevWorkout, exercises: newExercises };
        });
        
      } catch (error) {
        console.error('Error updating set value:', error);
      }
      delete debounceTimeouts.current[debounceKey];
    }, 1000); // Wait 1 second after typing stops
  }, [currentWorkout]);

  const updateExerciseName = async (exerciseIndex, newName) => {
    if (!currentWorkout?.exercises[exerciseIndex]) return;
    
    try {
      const exercise = currentWorkout.exercises[exerciseIndex];
      
      await workoutService.updateExercise(exercise.id, {
        name: newName
      });
      
      const updatedExercises = [...currentWorkout.exercises];
      updatedExercises[exerciseIndex] = { ...updatedExercises[exerciseIndex], name: newName };
      
      const updatedWorkouts = createdWorkouts.map(workout => 
        workout.id === currentWorkout.id 
          ? { ...workout, exercises: updatedExercises }
          : workout
      );
      setCreatedWorkouts(updatedWorkouts);
      setCurrentWorkout({ ...currentWorkout, exercises: updatedExercises });
    } catch (error) {
      console.error('Error updating exercise name:', error);
      alert('Failed to update exercise name. Please try again.');
    }
  };

  // Routine Builder Functions
  const addWorkout = () => {
    setIsCreatingWorkout(true);
    setNewWorkoutName('');
    // Create a temporary workout to switch to workout creation view
    const tempWorkout = {
      id: 'temp-' + Date.now(),
      name: '',
      exercises: []
    };
    setCurrentWorkout(tempWorkout);
  };
  
  const createWorkout = async () => {
    if (!newWorkoutName.trim()) return;
    
    try {
      const newWorkout = await workoutService.createWorkout({
        name: newWorkoutName.trim()
      });
      
      setCreatedWorkouts(prev => [...prev, newWorkout]);
      setCurrentWorkout(newWorkout);
      setIsCreatingWorkout(false);
      setNewWorkoutName('');
    } catch (error) {
      console.error('Error creating workout:', error)
      alert('Failed to create workout. Please try again.')
    }
  };
  
  const cancelWorkoutCreation = () => {
    setIsCreatingWorkout(false);
    setNewWorkoutName('');
  };

  const updateWorkoutName = async (id, newName) => {
    try {
      await workoutService.updateWorkout(id, { name: newName });
      
      setCreatedWorkouts(prev => 
        prev.map(workout => 
          workout.id === id ? { ...workout, name: newName } : workout
        )
      );
      if (currentWorkout?.id === id) {
        setCurrentWorkout({ ...currentWorkout, name: newName });
      }
    } catch (error) {
      console.error('Error updating workout name:', error);
      alert('Failed to update workout name. Please try again.');
    }
  };
  
  const selectWorkout = (workout) => {
    setCurrentWorkout(workout);
  };

  const addNewWorkoutAndSwitch = () => {
    setIsCreatingWorkout(true);
    setNewWorkoutName('');
    setCurrentTab('workout');
  };

  const deleteWorkout = async (workoutId) => {
    try {
      await workoutService.deleteWorkout(workoutId);
      
      // Remove from created workouts
      const updatedWorkouts = createdWorkouts.filter(workout => workout.id !== workoutId);
      setCreatedWorkouts(updatedWorkouts);
      
      // Remove from selected workouts in routine
      const updatedSelectedWorkouts = selectedWorkouts.filter(id => id !== workoutId);
      setSelectedWorkouts(updatedSelectedWorkouts);
      
      // Clear current workout if it's the one being deleted
      if (currentWorkout?.id === workoutId) {
        setCurrentWorkout(null);
      }
      
      // Update workout plans to remove this workout
      updateWorkoutPlans();
      
      // Close delete confirmation
      setWorkoutToDelete(null);
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout. Please try again.');
      setWorkoutToDelete(null);
    }
  };

  const confirmDeleteWorkout = (workoutId) => {
    setWorkoutToDelete(workoutId);
  };

  const cancelDeleteWorkout = () => {
    setWorkoutToDelete(null);
  };

  const addWorkoutToRoutine = async (workoutId) => {
    if (!selectedWorkouts.includes(workoutId)) {
      const newSelectedWorkouts = [...selectedWorkouts, workoutId];
      const newOrderedRoutineItems = [...orderedRoutineItems, { type: 'workout', id: workoutId }];
      
      try {
        await workoutService.saveRoutine({
          selectedWorkoutIds: newSelectedWorkouts,
          orderedRoutineItems: newOrderedRoutineItems,
          rotationCycles
        });
        
        setSelectedWorkouts(newSelectedWorkouts);
        setOrderedRoutineItems(newOrderedRoutineItems);
        updateWorkoutPlans();
      } catch (error) {
        console.error('Error adding workout to routine:', error);
        alert('Failed to add workout to routine. Please try again.');
      }
    }
  };

  const removeWorkoutFromRoutine = async (workoutId) => {
    const newSelectedWorkouts = selectedWorkouts.filter(id => id !== workoutId);
    const newOrderedRoutineItems = orderedRoutineItems.filter(item => !(item.type === 'workout' && item.id === workoutId));
    
    try {
      await workoutService.saveRoutine({
        selectedWorkoutIds: newSelectedWorkouts,
        orderedRoutineItems: newOrderedRoutineItems,
        rotationCycles
      });
      
      setSelectedWorkouts(newSelectedWorkouts);
      setOrderedRoutineItems(newOrderedRoutineItems);
      updateWorkoutPlans();
    } catch (error) {
      console.error('Error removing workout from routine:', error);
      alert('Failed to remove workout from routine. Please try again.');
    }
  };

  const addRestDay = async () => {
    const restDayId = Date.now();
    const newOrderedRoutineItems = [...orderedRoutineItems, { type: 'rest', id: restDayId, name: 'Rest' }];
    
    try {
      await workoutService.saveRoutine({
        selectedWorkoutIds: selectedWorkouts,
        orderedRoutineItems: newOrderedRoutineItems,
        rotationCycles
      });
      
      setOrderedRoutineItems(newOrderedRoutineItems);
    } catch (error) {
      console.error('Error adding rest day:', error);
      alert('Failed to add rest day. Please try again.');
    }
  };

  const removeRoutineItem = async (itemId) => {
    const newOrderedRoutineItems = orderedRoutineItems.filter(item => item.id !== itemId);
    
    try {
      await workoutService.saveRoutine({
        selectedWorkoutIds: selectedWorkouts,
        orderedRoutineItems: newOrderedRoutineItems,
        rotationCycles
      });
      
      setOrderedRoutineItems(newOrderedRoutineItems);
    } catch (error) {
      console.error('Error removing routine item:', error);
      alert('Failed to remove routine item. Please try again.');
    }
  };

  const reorderRoutineItems = async (startIndex, endIndex) => {
    const items = [...orderedRoutineItems];
    const [removed] = items.splice(startIndex, 1);
    items.splice(endIndex, 0, removed);
    
    try {
      await workoutService.saveRoutine({
        selectedWorkoutIds: selectedWorkouts,
        orderedRoutineItems: items,
        rotationCycles
      });
      
      setOrderedRoutineItems(items);
    } catch (error) {
      console.error('Error reordering routine items:', error);
      alert('Failed to reorder routine items. Please try again.');
    }
  };

  const toggleCycleCollapse = (cycleIndex) => {
    setCollapsedCycles(prev => ({
      ...prev,
      [cycleIndex]: !prev[cycleIndex]
    }));
  };

  const toggleWorkoutCollapse = (cycleIndex, itemIndex) => {
    const key = `${cycleIndex}-${itemIndex}`;
    setCollapsedWorkouts(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateWorkoutPlans = () => {
    const newWorkoutPlans = Array(rotationCycles).fill().map(() => 
      Array(selectedWorkouts.length).fill().map(() => [])
    );
    
    // Preserve existing data where possible
    workoutPlans.forEach((week, weekIndex) => {
      if (weekIndex < rotationCycles && week) {
        week.forEach((day, dayIndex) => {
          if (dayIndex < selectedWorkouts.length && newWorkoutPlans[weekIndex]?.[dayIndex]) {
            newWorkoutPlans[weekIndex][dayIndex] = day;
          }
        });
      }
    });
    
    setWorkoutPlans(newWorkoutPlans);
    
    // Reset current selections if they're out of bounds
    if (currentDay >= selectedWorkouts.length && selectedWorkouts.length > 0) setCurrentDay(0);
    if (currentWeek >= rotationCycles) setCurrentWeek(0);
  };

  const RoutineBuilderView = () => (
    <div className="flex-1 overflow-y-auto pb-20 sm:pb-24 bg-gray-50">
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Routine Builder</h2>
        
        {/* Select Workouts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Workouts</h3>
          <div className="space-y-2 sm:space-y-3">
            {createdWorkouts.map(workout => (
              <div key={workout.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg gap-3 ${
                selectedWorkouts.includes(workout.id) ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}>
                <div className="flex-1">
                  <span className="font-medium text-gray-900 block">{workout.name}</span>
                  {workout.exercises && workout.exercises.length > 0 && (
                    <span className="text-xs text-gray-500 mt-1 block">({workout.exercises.length} exercises)</span>
                  )}
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  {selectedWorkouts.includes(workout.id) ? (
                    <button
                      onClick={() => removeWorkoutFromRoutine(workout.id)}
                      className="w-full sm:w-auto px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 active:bg-red-700 min-h-[44px] sm:min-h-[32px]"
                    >
                      Remove from Routine
                    </button>
                  ) : (
                    <button
                      onClick={() => addWorkoutToRoutine(workout.id)}
                      className="w-full sm:w-auto px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 active:bg-blue-700 min-h-[44px] sm:min-h-[32px]"
                    >
                      Add to Routine
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button
              onClick={addNewWorkoutAndSwitch}
              className="w-full p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 active:border-blue-500 transition-colors min-h-[44px]"
            >
              {createdWorkouts.length === 0 ? "+ Create Your First Workout" : "+ Add New Workout"}
            </button>
          </div>
        </div>

        {/* Select Cycles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Cycles</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Cycles
            </label>
            <select
              value={rotationCycles}
              onChange={async (e) => {
                const newRotationCycles = parseInt(e.target.value);
                
                try {
                  await workoutService.saveRoutine({
                    selectedWorkoutIds: selectedWorkouts,
                    orderedRoutineItems: orderedRoutineItems,
                    rotationCycles: newRotationCycles
                  });
                  
                  setRotationCycles(newRotationCycles);
                  updateWorkoutPlans();
                } catch (error) {
                  console.error('Error updating rotation cycles:', error);
                  alert('Failed to update rotation cycles. Please try again.');
                }
              }}
              className="w-full px-3 py-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] text-base"
            >
              {[1,2,3,4,5,6,8,10,12].map(num => (
                <option key={num} value={num}>{num} cycle{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Select Ordering */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Ordering</h3>
              <button
                onClick={addRestDay}
                className="px-3 py-1.5 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors font-medium"
              >
                + Add Rest Day
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {orderedRoutineItems.map((item, index) => (
                  <div key={`${item.type}-${item.id}`} className="relative">
                    {dragOverIndex === index && (
                      <div className="absolute -left-1 top-0 bottom-0 w-1 bg-blue-500 rounded-full"></div>
                    )}
                    <div
                      className={`relative px-3 py-1.5 text-sm font-medium rounded-lg cursor-move ${
                        item.type === 'workout' 
                          ? 'bg-blue-200 text-blue-800' 
                          : 'bg-yellow-200 text-yellow-800'
                      }`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', index.toString());
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverIndex(index);
                      }}
                      onDragLeave={(e) => {
                        setDragOverIndex(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverIndex(null);
                        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        const dropIndex = index;
                        if (dragIndex !== dropIndex) {
                          reorderRoutineItems(dragIndex, dropIndex);
                        }
                      }}
                  >
                    <div className="flex items-center">
                      <div className="grid grid-cols-2 gap-0.5 mr-2">
                        <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                        <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                        <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                        <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                        <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                        <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                      </div>
                      {index + 1}. {item.type === 'workout' 
                        ? createdWorkouts.find(w => w.id === item.id)?.name 
                        : item.name}
                    </div>
                    <button
                      onClick={() => removeRoutineItem(item.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
                    >
                      ×
                    </button>
                    </div>
                  </div>
                ))}
                {orderedRoutineItems.length === 0 && (
                  <p className="text-gray-500 text-sm">No workouts selected yet. Select workouts above to start building your routine.</p>
                )}
              </div>
            </div>
          </div>
        
        {/* Routine Preview */}
        {orderedRoutineItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Routine Preview</h3>
            <div className="space-y-4">
              {Array.from({length: rotationCycles}, (_, cycleIndex) => (
                <div key={cycleIndex} className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">Cycle {cycleIndex + 1}</h4>
                  <div className="flex flex-wrap gap-2">
                    {orderedRoutineItems.map((item, itemIndex) => (
                      <span 
                        key={`cycle-${cycleIndex}-item-${itemIndex}`} 
                        className={`px-3 py-1 text-sm font-medium rounded-lg ${
                          item.type === 'workout'
                            ? 'bg-blue-200 text-blue-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}
                      >
                        {itemIndex + 1}. {item.type === 'workout' 
                          ? createdWorkouts.find(w => w.id === item.id)?.name 
                          : item.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="p-3 bg-gray-100 rounded-lg">
                <div className="text-sm text-gray-700">
                  <p className="font-medium">
                    {orderedRoutineItems.length} days per cycle × {rotationCycles} cycle{rotationCycles !== 1 ? 's' : ''} = {orderedRoutineItems.length * rotationCycles} total days
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Workouts: {orderedRoutineItems.filter(item => item.type === 'workout').length} per cycle, 
                    Rest days: {orderedRoutineItems.filter(item => item.type === 'rest').length} per cycle
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const WeeklySummaryView = () => {
    if (orderedRoutineItems.length === 0) {
      return (
        <div className="flex-1 overflow-y-auto pb-24 bg-gray-50">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Summary</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="text-gray-500">
                <div className="text-lg font-medium mb-2">No routine created yet</div>
                <div className="text-sm">Go to the Routine Builder tab to create your workout routine</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto pb-24 bg-gray-50">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Summary</h2>
          
          {/* Routine Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Routine Overview</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>{orderedRoutineItems.length} days per cycle × {rotationCycles} cycles = {orderedRoutineItems.length * rotationCycles} total days</div>
              <div>
                {orderedRoutineItems.filter(item => item.type === 'workout').length} workouts and {orderedRoutineItems.filter(item => item.type === 'rest').length} rest days per cycle
              </div>
            </div>
          </div>

          {/* Cycles */}
          <div className="space-y-4">
            {Array.from({length: rotationCycles}, (_, cycleIndex) => {
              const isCycleCollapsed = collapsedCycles[cycleIndex];
              
              return (
                <div key={cycleIndex} className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <button
                    onClick={() => toggleCycleCollapse(cycleIndex)}
                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">Cycle {cycleIndex + 1}</h3>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${!isCycleCollapsed ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {!isCycleCollapsed && (
                    <div className="px-6 pb-6 space-y-3">
                      {orderedRoutineItems.map((item, itemIndex) => {
                        const isWorkoutCollapsed = collapsedWorkouts[`${cycleIndex}-${itemIndex}`];
                        
                        if (item.type === 'rest') {
                          return (
                            <div key={`${cycleIndex}-${itemIndex}`} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                  {itemIndex + 1}
                                </div>
                                <span className="font-medium text-yellow-800">Rest Day</span>
                              </div>
                            </div>
                          );
                        }

                        const workout = createdWorkouts.find(w => w.id === item.id);
                        if (!workout) return null;

                        return (
                          <div key={`${cycleIndex}-${itemIndex}`} className="bg-blue-50 border border-blue-200 rounded-lg">
                            <button
                              onClick={() => toggleWorkoutCollapse(cycleIndex, itemIndex)}
                              className="w-full p-4 flex items-center justify-between hover:bg-blue-100 transition-colors"
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                  {itemIndex + 1}
                                </div>
                                <div className="text-left">
                                  <div className="font-medium text-blue-900">{workout.name}</div>
                                  <div className="text-sm text-blue-700">{workout.exercises?.length || 0} exercises</div>
                                </div>
                              </div>
                              <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform ${!isWorkoutCollapsed ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {!isWorkoutCollapsed && workout.exercises && (
                              <div className="px-4 pb-4 space-y-3">
                                {workout.exercises.map((exercise, exerciseIndex) => (
                                  <div key={exerciseIndex} className="bg-white rounded-lg p-3 border border-blue-100">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-gray-900">{exercise.name}</span>
                                      <span className="text-sm text-gray-500">
                                        {exercise.sets} set{exercise.sets !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {exercise.setResults && exercise.setResults.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                          {exercise.setResults.map((set, setIndex) => (
                                            <div key={setIndex} className="text-xs text-gray-500">
                                              {set.weight || '0'} lb × {set.reps || '0'} reps
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const toggleMuscleGroupCollapse = (muscleGroup) => {
    setCollapsedMuscleGroups(prev => ({
      ...prev,
      [muscleGroup]: !prev[muscleGroup]
    }));
  };

  const ExerciseLibraryView = () => {
    const filteredExercisesByMuscle = {};
    
    // Filter exercises by search term and organize by muscle group
    Object.entries(exerciseLibraryByMuscle).forEach(([muscleGroup, exercises]) => {
      const filtered = exercises.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        filteredExercisesByMuscle[muscleGroup] = filtered;
      }
    });

    return (
      <div className="flex-1 flex flex-col pb-24 bg-gray-50">
        <div className="p-6 bg-white border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Exercise Library</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {Object.entries(filteredExercisesByMuscle).map(([muscleGroup, exercises]) => {
              const isCollapsed = collapsedMuscleGroups[muscleGroup];
              const muscleColors = {
                'Chest': 'bg-red-500',
                'Triceps': 'bg-orange-500',
                'Shoulders': 'bg-yellow-500',
                'Legs': 'bg-green-500',
                'Back': 'bg-blue-500',
                'Abs': 'bg-purple-500',
                'Biceps': 'bg-teal-500',
                'Custom': 'bg-pink-500'
              };

              return (
                <div key={muscleGroup} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleMuscleGroupCollapse(muscleGroup)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${muscleColors[muscleGroup] || 'bg-gray-400'}`}></div>
                      <h3 className="text-lg font-semibold text-gray-900">{muscleGroup}</h3>
                      <span className="text-sm text-gray-500">({exercises.length} exercises)</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${!isCollapsed ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {!isCollapsed && (
                    <div className="border-t border-gray-100 p-4 space-y-3">
                      {exercises.map(exercise => (
                        <div
                          key={exercise.id}
                          className="bg-gray-50 rounded-lg p-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{exercise.name}</div>
                            {exercise.muscleWeights && (
                              <div className="mt-2 mb-1">
                                <MuscleGroupBar 
                                  muscleGroups={exercise.muscleGroups} 
                                  muscleWeights={exercise.muscleWeights} 
                                />
                              </div>
                            )}
                            <div className="text-sm text-gray-500 mt-1">{exercise.muscleGroups.join(', ')}</div>
                          </div>
                          <button
                            onClick={() => addExerciseDirectly(exercise)}
                            className="ml-4 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const WorkoutBuilderView = () => {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 pb-20 sm:pb-24">
        {/* Workout Repository */}
        <div className="bg-white px-4 sm:px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Workout Builder</h2>
            {!isCreatingWorkout && (
              <button
                onClick={addWorkout}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-md min-h-[44px] flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Workout
              </button>
            )}
          </div>
          
          {/* Created Workouts */}
          {createdWorkouts.length > 0 && (
            <div className="mb-4">
              <div className="flex space-x-3 overflow-x-auto pb-2 pt-2 pr-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {createdWorkouts.map(workout => (
                  <div key={workout.id} className="relative flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => selectWorkout(workout)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all min-h-[44px] ${
                        currentWorkout?.id === workout.id
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                      }`}
                    >
                      <span className="block">{workout.name}</span>
                      {workout.exercises && workout.exercises.length > 0 && (
                        <span className="text-xs opacity-75 block">({workout.exercises.length} exercises)</span>
                      )}
                    </button>
                    {currentWorkout?.id === workout.id && (
                      <button
                        onClick={() => confirmDeleteWorkout(workout.id)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 active:bg-red-700 transition-colors text-sm z-10 shadow-md"
                        title="Delete workout"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {currentWorkout && (
            <div className="flex items-center justify-between">
              {isCreatingWorkout ? (
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newWorkoutName}
                    onChange={(e) => setNewWorkoutName(e.target.value)}
                    placeholder="Enter workout name"
                    className="text-xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 pb-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') createWorkout();
                      if (e.key === 'Escape') cancelWorkoutCreation();
                    }}
                  />
                  <button
                    onClick={createWorkout}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={cancelWorkoutCreation}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : editingWorkoutName === currentWorkout.id ? (
                <div className="flex items-center space-x-3 flex-1">
                  <input
                    type="text"
                    value={currentWorkout.name}
                    onChange={(e) => updateWorkoutNameInline(currentWorkout.id, e.target.value)}
                    className="text-xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 pb-1 flex-1 max-w-xs"
                    autoFocus
                    onBlur={() => setEditingWorkoutName(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditingWorkoutName(null);
                      if (e.key === 'Escape') setEditingWorkoutName(null);
                    }}
                  />
                  <button
                    onClick={() => setEditingWorkoutName(null)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => {
                    console.log('Title clicked, setting editing to:', currentWorkout.id);
                    setEditingWorkoutName(currentWorkout.id);
                  }}
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{currentWorkout.name}</h3>
                    <p className="text-sm text-gray-500">
                      {currentWorkout.exercises?.length || 0} exercise{(currentWorkout.exercises?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pb-24">
          {!currentWorkout ? (
            <div className="p-12 text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Dumbbell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-xl font-medium mb-2 text-gray-700">Select a workout to get started</p>
              <p className="text-sm text-gray-500">Choose a workout from above or create a new one</p>
            </div>
          ) : currentWorkout.exercises?.length === 0 ? (
            <div className="p-6 space-y-4">
              <button
                onClick={() => setShowExerciseLibrary(true)}
                className="w-full bg-blue-500 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Exercise</span>
              </button>
              <div className="p-12 text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-xl font-medium mb-2 text-gray-700">No exercises in {currentWorkout.name}</p>
                <p className="text-sm text-gray-500">Click "Add Exercise" above to add your first exercise</p>
              </div>
            </div>
          ) : (
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4">
              <button
                onClick={() => setShowExerciseLibrary(true)}
                className="w-full bg-blue-500 text-white px-4 py-3 sm:py-2.5 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-lg min-h-[48px]"
              >
                <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                <span>Add Exercise</span>
              </button>
              {currentWorkout.exercises?.map((exercise, exerciseIndex) => {
                const isCollapsed = collapsedExercises[exercise.id];
                
                return (
                  <div key={exercise.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-start sm:items-center justify-between p-4 sm:p-5 gap-3">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="p-1 text-gray-400 flex-shrink-0">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {exercise.muscleGroups?.map((muscle, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-md"
                              >
                                {muscle}
                              </span>
                            ))}
                          </div>
                          {editingExerciseName === exercise.id ? (
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={(e) => updateExerciseName(exerciseIndex, e.target.value)}
                              onBlur={() => setEditingExerciseName(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditingExerciseName(null);
                                if (e.key === 'Escape') setEditingExerciseName(null);
                              }}
                              className="text-lg sm:text-xl font-semibold text-gray-900 bg-white border border-blue-500 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                              autoFocus
                            />
                          ) : (
                            <h3 
                              className="text-lg sm:text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors leading-tight"
                              onClick={() => setEditingExerciseName(exercise.id)}
                            >
                              {exercise.name}
                            </h3>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => toggleExerciseCollapse(exercise.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <ChevronDown className={`w-5 h-5 sm:w-4 sm:h-4 text-gray-400 transition-transform ${!isCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                        <button
                          onClick={() => removeExercise(exerciseIndex)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      {isCollapsed && (
                        <div className="px-4 sm:px-5 pb-4">
                          <div className="text-sm text-gray-600 pl-8">
                            <div className="font-medium mb-1">
                              {exercise.sets} set{exercise.sets !== 1 ? 's' : ''}
                            </div>
                            {exercise.setResults && exercise.setResults.length > 0 && (
                              <div className="space-y-0.5">
                                {exercise.setResults.map((set, setIndex) => (
                                  <div key={setIndex} className="text-xs text-gray-500">
                                    {set.weight || '0'} lb × {set.reps || '0'} reps
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-50">
                        <div className="py-4 border-b border-gray-100">
                          <h4 className="text-sm font-medium text-gray-700 mb-4 underline">Target</h4>
                          
                          <div className="mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Sets</span>
                              <div className="flex items-center space-x-3 sm:space-x-4">
                                <button
                                  onClick={() => updateExerciseSets(exerciseIndex, -1)}
                                  className="w-10 h-10 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors"
                                >
                                  <Minus className="w-5 h-5 sm:w-4 sm:h-4 text-gray-600" />
                                </button>
                                <span className="text-xl sm:text-2xl font-semibold text-gray-900 min-w-[3rem] sm:min-w-[2rem] text-center">{exercise.sets}</span>
                                <button
                                  onClick={() => updateExerciseSets(exerciseIndex, 1)}
                                  className="w-10 h-10 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors"
                                >
                                  <Plus className="w-5 h-5 sm:w-4 sm:h-4 text-gray-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4 px-2 sm:px-4 pt-4">
                          {Array.from({ length: exercise.sets }, (_, setIndex) => {
                            const setResult = exercise.setResults?.[setIndex] || { weight: '', reps: '' };
                            
                            return (
                              <div key={setIndex} className="p-3 sm:p-4 bg-gray-50 rounded-xl relative">
                                <div className="absolute -top-2 -left-2 w-7 h-7 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm z-10">
                                  {setIndex + 1}
                                </div>
                                <div className="flex items-center justify-between pl-5 sm:pl-4 gap-3 sm:gap-4">
                                  <div className="flex flex-col items-center flex-1">
                                    <span className="text-xs text-gray-500 mb-2 sm:mb-1 font-medium">Weight</span>
                                    <SetInput
                                      key={`${exercise.id}-${setIndex}-weight`}
                                      exerciseIndex={exerciseIndex}
                                      setIndex={setIndex}
                                      field="weight"
                                      initialValue={setResult.weight}
                                      placeholder="lbs"
                                      onValueChange={updateSetValue}
                                    />
                                  </div>
                                  
                                  <span className="text-lg sm:text-xl text-gray-400 flex-shrink-0">×</span>
                                  
                                  <div className="flex flex-col items-center flex-1">
                                    <span className="text-xs text-gray-500 mb-2 sm:mb-1 font-medium">Reps</span>
                                    <SetInput
                                      key={`${exercise.id}-${setIndex}-reps`}
                                      exerciseIndex={exerciseIndex}
                                      setIndex={setIndex}
                                      field="reps"
                                      initialValue={setResult.reps}
                                      placeholder="10"
                                      onValueChange={updateSetValue}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {workoutToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 m-4 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Workout</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{createdWorkouts.find(w => w.id === workoutToDelete)?.name}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelDeleteWorkout}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteWorkout(workoutToDelete)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show setup screen if Supabase credentials are not configured
  if (!hasValidCredentials()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Setup Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please configure your Supabase credentials to continue
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Setup Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">supabase.com</a></li>
              <li>Get your Project URL and anon key from Settings → API</li>
              <li>Update the <code className="bg-gray-100 px-1 rounded">.env.local</code> file with your credentials</li>
              <li>Run the database schema in your Supabase SQL Editor</li>
              <li>Restart this development server</li>
            </ol>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                📖 See <code>SUPABASE_SETUP.md</code> for detailed instructions
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show authentication form if user is not logged in
  if (!user) {
    return <Auth onAuthSuccess={setUser} />
  }

  return (
    <div className="w-full max-w-none sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto bg-gray-50 min-h-screen flex flex-col">
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Workout Tracker</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {currentTab === 'workout' && <WorkoutBuilderView />}
      {currentTab === 'routine' && <RoutineBuilderView />}
      {currentTab === 'weekly' && <WeeklySummaryView />}

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 flex safe-area-inset-bottom">
        <button
          onClick={() => setCurrentTab('workout')}
          className={`flex-1 py-3 sm:py-4 flex flex-col items-center space-y-1 transition-colors min-h-[3.5rem] sm:min-h-[4rem] ${
            currentTab === 'workout' ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Target className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs sm:text-sm font-medium leading-tight">Workout</span>
        </button>
        <button
          onClick={() => setCurrentTab('routine')}
          className={`flex-1 py-3 sm:py-4 flex flex-col items-center space-y-1 transition-colors min-h-[3.5rem] sm:min-h-[4rem] ${
            currentTab === 'routine' ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs sm:text-sm font-medium leading-tight">Routine</span>
        </button>
        <button
          onClick={() => setCurrentTab('weekly')}
          className={`flex-1 py-3 sm:py-4 flex flex-col items-center space-y-1 transition-colors min-h-[3.5rem] sm:min-h-[4rem] ${
            currentTab === 'weekly' ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs sm:text-sm font-medium leading-tight">Summary</span>
        </button>
      </div>

      {showExerciseLibrary && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center sm:justify-center">
          <div className="bg-white w-full h-[85vh] sm:h-[80vh] sm:w-11/12 sm:max-w-4xl sm:rounded-2xl rounded-t-3xl sm:rounded-t-2xl flex flex-col shadow-2xl sm:max-h-[600px]">
            <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                {libraryMode === 'exercises' ? 'Exercise Library' : 'Copy from Other Workouts'}
              </h2>
              <button
                onClick={() => {
                  setShowExerciseLibrary(false);
                  setLibraryMode('exercises');
                  setSelectedExercises([]);
                  setSelectedCopyExercises([]);
                }}
                className="w-10 h-10 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4 text-gray-600" />
              </button>
            </div>

            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex space-x-2 mb-3">
                <button
                  onClick={() => setLibraryMode('exercises')}
                  className={`flex-1 py-3 sm:py-2 px-4 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                    libraryMode === 'exercises'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  Add New Exercises
                </button>
                <button
                  onClick={() => setLibraryMode('copy')}
                  className={`flex-1 py-3 sm:py-2 px-4 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                    libraryMode === 'copy'
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  Copy from Other Workouts
                </button>
              </div>
              
              {libraryMode === 'exercises' && (
                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedExercises.length > 0 
                      ? `${selectedExercises.length} exercise${selectedExercises.length !== 1 ? 's' : ''} selected`
                      : 'No exercises selected'
                    }
                  </span>
                  <button
                    onClick={addMultipleExercises}
                    disabled={selectedExercises.length === 0}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                      selectedExercises.length > 0
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Add Selected
                  </button>
                </div>
              )}
              
              {libraryMode === 'copy' && (
                <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-green-900">
                    {selectedCopyExercises.length > 0
                      ? `${selectedCopyExercises.length} exercise${selectedCopyExercises.length !== 1 ? 's' : ''} selected`
                      : 'No exercises selected'
                    }
                  </span>
                  <button
                    onClick={addMultipleCopyExercises}
                    disabled={selectedCopyExercises.length === 0}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                      selectedCopyExercises.length > 0
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Copy Selected
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {libraryMode === 'exercises' ? (
                <div className="space-y-4">
                  {Object.entries(exerciseLibraryByMuscle).map(([muscleGroup, exercises]) => {
                    const filteredExercises = exercises.filter(exercise => 
                      exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    
                    if (filteredExercises.length === 0) return null;
                    
                    const isCollapsed = collapsedMuscleGroups[muscleGroup];
                    const muscleColors = {
                      'Chest': 'bg-red-500',
                      'Triceps': 'bg-orange-500',
                      'Shoulders': 'bg-yellow-500',
                      'Legs': 'bg-green-500',
                      'Back': 'bg-blue-500',
                      'Abs': 'bg-purple-500',
                      'Biceps': 'bg-teal-500',
                      'Custom': 'bg-pink-500'
                    };

                    return (
                      <div key={muscleGroup} className="bg-gray-50 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleMuscleGroupCollapse(muscleGroup)}
                          className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${muscleColors[muscleGroup] || 'bg-gray-400'}`}></div>
                            <h3 className="text-lg font-semibold text-gray-900">{muscleGroup}</h3>
                            <span className="text-sm text-gray-500">({filteredExercises.length} exercises)</span>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${!isCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {!isCollapsed && (
                          <div className="border-t border-gray-200 p-4 space-y-3">
                            {filteredExercises.map(exercise => {
                              const isSelected = selectedExercises.some(e => e.id === exercise.id);
                              return (
                                <div
                                  key={exercise.id}
                                  onClick={() => toggleExerciseSelection(exercise)}
                                  className={`bg-white rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer border-2 ${
                                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3 flex-1">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                      isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                    }`}>
                                      {isSelected && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{exercise.name}</div>
                                      <div className="text-sm text-gray-500 mt-1">{exercise.muscleGroups.join(', ')}</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {createdWorkouts
                    .filter(workout => workout.id !== currentWorkout?.id && workout.exercises?.length > 0)
                    .map(workout => (
                    <div key={workout.id} className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-md font-semibold text-gray-900 mb-3">
                        {workout.name} ({workout.exercises?.length || 0} exercises)
                      </h3>
                      <div className="space-y-2">
                        {workout.exercises?.map((exercise, exerciseIndex) => {
                          const isSelected = selectedCopyExercises.some(e => e.id === exercise.id);
                          return (
                            <div
                              key={exercise.id}
                              onClick={() => toggleCopyExerciseSelection(exercise)}
                              className={`p-3 bg-white rounded-lg flex items-center justify-between hover:bg-gray-100 cursor-pointer transition-colors border-2 ${
                                isSelected ? 'border-green-500 bg-green-50' : 'border-transparent'
                              }`}
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                }`}>
                                  {isSelected && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{exercise.name}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {exercise.sets} sets × {exercise.repsOrTime === 'reps' ? `${exercise.repsValue} reps` : `${exercise.timeValue} secs`}
                                  </div>
                                  {exercise.muscleGroups && (
                                    <div className="text-xs text-gray-400 mt-1">{exercise.muscleGroups.join(', ')}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {(!workout.exercises || workout.exercises.length === 0) && (
                          <div className="text-center py-4 text-gray-400">
                            <p className="text-sm">No exercises in this workout</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {createdWorkouts.filter(workout => workout.id !== currentWorkout?.id && workout.exercises?.length > 0).length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No other workouts with exercises to copy from</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutApp;