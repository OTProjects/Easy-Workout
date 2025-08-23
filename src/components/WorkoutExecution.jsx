import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, CheckCircle, Clock, Dumbbell, RotateCcw, Plus, Minus } from 'lucide-react';
import SimpleCard from './ui/SimpleCard';
import SimpleButton from './ui/SimpleButton';
import SimpleInput from './ui/SimpleInput';

const WorkoutExecution = ({ workout, onComplete, onExit }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [exerciseStartTime, setExerciseStartTime] = useState(null);
  const [workoutData, setWorkoutData] = useState(workout);
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);

  const currentExercise = workoutData.exercises[currentExerciseIndex];
  const totalSets = workoutData.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSets = workoutData.exercises.reduce((sum, ex, index) => {
    if (index < currentExerciseIndex) return sum + ex.sets;
    if (index === currentExerciseIndex) return sum + currentSetIndex;
    return sum;
  }, 0);

  // Timer for rest periods
  useEffect(() => {
    let interval;
    if (isResting && restTimeRemaining > 0) {
      interval = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeRemaining]);

  // Initialize workout
  useEffect(() => {
    if (!workoutStartTime) {
      setWorkoutStartTime(new Date());
      setExerciseStartTime(new Date());
    }
  }, [workoutStartTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateSetResult = (exerciseIndex, setIndex, updates) => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, exIndex) => 
        exIndex === exerciseIndex ? {
          ...exercise,
          setResults: exercise.setResults.map((setResult, setIdx) => 
            setIdx === setIndex ? { ...setResult, ...updates } : setResult
          )
        } : exercise
      )
    }));
  };

  const completeCurrentSet = () => {
    // Mark current set as completed
    updateSetResult(currentExerciseIndex, currentSetIndex, { completed: true });
    
    const isLastSetOfExercise = currentSetIndex === currentExercise.sets - 1;
    const isLastExercise = currentExerciseIndex === workoutData.exercises.length - 1;

    if (isLastSetOfExercise && isLastExercise) {
      // Workout complete
      setIsWorkoutComplete(true);
      return;
    }

    if (isLastSetOfExercise) {
      // Move to next exercise
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
      setExerciseStartTime(new Date());
    } else {
      // Move to next set
      setCurrentSetIndex(prev => prev + 1);
      
      // Start rest period if there's rest time configured
      if (currentExercise.rest > 0) {
        setIsResting(true);
        setRestTimeRemaining(currentExercise.rest);
      }
    }
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimeRemaining(0);
  };

  const addRestTime = (seconds) => {
    setRestTimeRemaining(prev => prev + seconds);
  };

  const goToPreviousSet = () => {
    if (currentSetIndex > 0) {
      setCurrentSetIndex(prev => prev - 1);
    } else if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      const prevExercise = workoutData.exercises[currentExerciseIndex - 1];
      setCurrentSetIndex(prevExercise.sets - 1);
    }
    setIsResting(false);
  };

  const handleWorkoutComplete = () => {
    const endTime = new Date();
    const duration = Math.round((endTime - workoutStartTime) / 1000 / 60); // minutes
    
    const completedWorkout = {
      ...workoutData,
      completedAt: endTime,
      actualDuration: duration,
      completionRate: (completedSets / totalSets) * 100
    };
    
    onComplete(completedWorkout);
  };

  if (isWorkoutComplete) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
        <div className="text-center p-8">
          <CheckCircle className="w-24 h-24 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl font-bold mb-4">Workout Complete! 🎉</h1>
          <p className="text-xl mb-2">Great job finishing your workout!</p>
          <p className="text-green-100 mb-8">
            Duration: {Math.round((new Date() - workoutStartTime) / 1000 / 60)} minutes
          </p>
          <div className="space-y-4">
            <SimpleButton 
              onClick={handleWorkoutComplete}
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
            >
              Save Workout
            </SimpleButton>
            <SimpleButton 
              variant="ghost" 
              onClick={onExit}
              className="text-white hover:bg-white/20 px-8 py-4"
            >
              Exit Without Saving
            </SimpleButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{workoutData.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{currentExerciseIndex + 1} of {workoutData.exercises.length} exercises</span>
              <span>{completedSets} of {totalSets} sets completed</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SimpleButton variant="ghost" onClick={onExit}>
              Exit
            </SimpleButton>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSets / totalSets) * 100}%` }}
          />
        </div>
      </div>

      {/* Rest Timer */}
      {isResting && (
        <div className="bg-orange-500 text-white p-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Clock className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Rest Time</h2>
              <p className="text-3xl font-mono">{formatTime(restTimeRemaining)}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <SimpleButton 
              onClick={() => addRestTime(30)}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              +30s
            </SimpleButton>
            <SimpleButton 
              onClick={skipRest}
              className="bg-white text-orange-600 hover:bg-gray-100 font-semibold"
            >
              Skip Rest
            </SimpleButton>
            <SimpleButton 
              onClick={() => addRestTime(-30)}
              className="bg-white/20 hover:bg-white/30 text-white"
              disabled={restTimeRemaining <= 30}
            >
              -30s
            </SimpleButton>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Current Exercise */}
          <SimpleCard className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Dumbbell className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentExercise.name}</h2>
                <p className="text-blue-100">
                  {currentExercise.muscleGroups?.join(', ')}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-blue-100 text-sm">Current Set</p>
                <p className="text-3xl font-bold">{currentSetIndex + 1}/{currentExercise.sets}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Target</p>
                <p className="text-xl font-semibold">
                  {currentExercise.reps ? `${currentExercise.reps} reps` : `${currentExercise.time}s`}
                  {currentExercise.weight > 0 && ` @ ${currentExercise.weight}lbs`}
                </p>
              </div>
            </div>
          </SimpleCard>

          {/* Set Input */}
          {!isResting && (
            <SimpleCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Set {currentSetIndex + 1} Results
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {currentExercise.weight > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (lbs)
                    </label>
                    <div className="flex items-center gap-2">
                      <SimpleButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const currentWeight = currentExercise.setResults[currentSetIndex]?.weight || currentExercise.weight;
                          updateSetResult(currentExerciseIndex, currentSetIndex, { 
                            weight: Math.max(0, currentWeight - 5) 
                          });
                        }}
                      >
                        <Minus className="w-4 h-4" />
                      </SimpleButton>
                      <SimpleInput
                        type="number"
                        value={currentExercise.setResults[currentSetIndex]?.weight || currentExercise.weight}
                        onChange={(e) => updateSetResult(currentExerciseIndex, currentSetIndex, {
                          weight: parseInt(e.target.value) || 0
                        })}
                        className="text-center"
                        min="0"
                      />
                      <SimpleButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const currentWeight = currentExercise.setResults[currentSetIndex]?.weight || currentExercise.weight;
                          updateSetResult(currentExerciseIndex, currentSetIndex, { 
                            weight: currentWeight + 5 
                          });
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </SimpleButton>
                    </div>
                  </div>
                )}

                {currentExercise.reps && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reps Completed
                    </label>
                    <div className="flex items-center gap-2">
                      <SimpleButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const currentReps = currentExercise.setResults[currentSetIndex]?.reps || currentExercise.reps;
                          updateSetResult(currentExerciseIndex, currentSetIndex, { 
                            reps: Math.max(0, currentReps - 1) 
                          });
                        }}
                      >
                        <Minus className="w-4 h-4" />
                      </SimpleButton>
                      <SimpleInput
                        type="number"
                        value={currentExercise.setResults[currentSetIndex]?.reps || currentExercise.reps}
                        onChange={(e) => updateSetResult(currentExerciseIndex, currentSetIndex, {
                          reps: parseInt(e.target.value) || 0
                        })}
                        className="text-center"
                        min="0"
                      />
                      <SimpleButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const currentReps = currentExercise.setResults[currentSetIndex]?.reps || currentExercise.reps;
                          updateSetResult(currentExerciseIndex, currentSetIndex, { 
                            reps: currentReps + 1 
                          });
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </SimpleButton>
                    </div>
                  </div>
                )}

                {currentExercise.time && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time (seconds)
                    </label>
                    <SimpleInput
                      type="number"
                      value={currentExercise.setResults[currentSetIndex]?.time || currentExercise.time}
                      onChange={(e) => updateSetResult(currentExerciseIndex, currentSetIndex, {
                        time: parseInt(e.target.value) || 0
                      })}
                      min="0"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <SimpleButton
                  variant="ghost"
                  onClick={goToPreviousSet}
                  disabled={currentExerciseIndex === 0 && currentSetIndex === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Previous Set
                </SimpleButton>

                <SimpleButton
                  variant="success"
                  onClick={completeCurrentSet}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Set
                </SimpleButton>
              </div>
            </SimpleCard>
          )}

          {/* Exercise History */}
          <SimpleCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Set History</h3>
            <div className="space-y-2">
              {currentExercise.setResults.map((setResult, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    setResult.completed 
                      ? 'bg-green-100 text-green-800' 
                      : index === currentSetIndex 
                      ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300' 
                      : 'bg-gray-100'
                  }`}
                >
                  <span className="font-medium">Set {index + 1}</span>
                  <span>
                    {setResult.weight > 0 && `${setResult.weight}lbs × `}
                    {setResult.reps > 0 && `${setResult.reps} reps`}
                    {setResult.time > 0 && `${setResult.time}s`}
                  </span>
                  {setResult.completed && <CheckCircle className="w-4 h-4" />}
                </div>
              ))}
            </div>
          </SimpleCard>

          {/* Workout Summary */}
          <SimpleCard className="p-6 bg-gray-800 text-white">
            <h3 className="text-lg font-semibold mb-4">Workout Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-300">Time Elapsed</p>
                <p className="font-semibold">
                  {workoutStartTime ? Math.round((new Date() - workoutStartTime) / 1000 / 60) : 0} min
                </p>
              </div>
              <div>
                <p className="text-gray-300">Completion</p>
                <p className="font-semibold">{Math.round((completedSets / totalSets) * 100)}%</p>
              </div>
            </div>
          </SimpleCard>
        </div>
      </div>
    </div>
  );
};

export default WorkoutExecution;