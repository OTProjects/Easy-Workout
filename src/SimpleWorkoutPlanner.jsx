import React, { useState, useEffect } from 'react';
import { Plus, Calendar, BarChart3, User, Settings, LogOut, Search, Menu, X, Play, Target } from 'lucide-react';
import { supabase } from './supabase';
import { workoutService } from './services/workoutService';
import Auth from './components/Auth';
import FullWorkoutWizard from './components/FullWorkoutWizard';
import WorkoutExecution from './components/WorkoutExecution';
import RoutinePlanner from './components/RoutinePlanner';
import SimpleCard, { WorkoutCard } from './components/ui/SimpleCard';
import SimpleButton, { FloatingActionButton, IconButton } from './components/ui/SimpleButton';
import { SearchInput } from './components/ui/SimpleInput';

const SimpleWorkoutPlanner = () => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // App state
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [workouts, setWorkouts] = useState([]);
  const [routineData, setRoutineData] = useState({
    name: 'My Workout Routine',
    description: '',
    selectedWorkoutIds: [],
    orderedRoutineItems: [],
    rotationCycles: 4,
    restDays: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWorkoutWizard, setShowWorkoutWizard] = useState(false);
  const [executingWorkout, setExecutingWorkout] = useState(null);
  
  // Load data
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
        }
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          
          if (window.location.hash && session?.user) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          
          if (window.location.hash && session?.user) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load user data when authenticated
  useEffect(() => {
    if (user) {
      loadWorkouts();
      // Removed loadRoutine() - let users start fresh each time
    }
  }, [user]);

  const loadWorkouts = async () => {
    if (loadingWorkouts) return;
    
    setLoadingWorkouts(true);
    try {
      const workoutData = await workoutService.getWorkouts();
      
      const transformedWorkouts = workoutData.map(workout => ({
        ...workout,
        type: workout.type || determineWorkoutType(workout.exercises),
        exercises: (workout.exercises || []).map(exercise => ({
          id: exercise.id,
          exerciseId: exercise.exercise_id || exercise.id,
          name: exercise.name,
          muscleGroups: exercise.muscle_groups || [],
          sets: exercise.sets || 3,
          repsOrTime: exercise.reps_or_time || 'reps',
          repsValue: exercise.reps_value || 10,
          timeValue: exercise.time_value || 30,
          setResults: exercise.set_results || [],
          orderIndex: exercise.order_index || 0,
        }))
      }));

      setWorkouts(transformedWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoadingWorkouts(false);
    }
  };

  const loadRoutine = async () => {
    try {
      const routine = await workoutService.getRoutine();
      console.log('Loaded routine from database:', routine);
      
      if (routine) {
        console.log('Setting routine data:', routine);
        setRoutineData(routine);
      } else {
        console.log('No routine found, setting defaults');
        // Set default routine if none exists
        setRoutineData({
          name: 'My Workout Routine',
          description: '',
          selectedWorkoutIds: [],
          orderedRoutineItems: [],
          rotationCycles: 4,
          restDays: []
        });
      }
    } catch (error) {
      console.error('Error loading routine:', error);
      // Set default routine on error
      setRoutineData({
        name: 'My Workout Routine',
        description: '',
        selectedWorkoutIds: [],
        orderedRoutineItems: [],
        rotationCycles: 4,
        restDays: []
      });
    }
  };

  const determineWorkoutType = (exercises) => {
    if (!exercises || exercises.length === 0) return 'mixed';
    
    const cardioExercises = ['burpees', 'running', 'cycling', 'jump rope', 'mountain climbers'];
    const flexibilityExercises = ['yoga', 'stretching', 'pilates'];
    
    const hasCardio = exercises.some(ex => 
      cardioExercises.some(cardio => ex.name?.toLowerCase().includes(cardio))
    );
    const hasFlexibility = exercises.some(ex => 
      flexibilityExercises.some(flex => ex.name?.toLowerCase().includes(flex))
    );
    
    if (hasCardio && !hasFlexibility) return 'cardio';
    if (hasFlexibility && !hasCardio) return 'flexibility';
    return exercises.length > 0 ? 'strength' : 'mixed';
  };

  const handleWorkoutWizardComplete = async (workoutData) => {
    try {
      // Create the workout
      const newWorkout = await workoutService.createWorkout({
        name: workoutData.name,
        type: workoutData.type
      });

      // Add exercises to the workout
      const exercisesWithOrderIndex = workoutData.exercises.map((exercise, index) => ({
        ...exercise,
        workout_id: newWorkout.id,
        order_index: index,
        muscle_groups: exercise.muscleGroups || [],
        reps_or_time: exercise.reps ? 'reps' : 'time',
        reps_value: exercise.reps || 0,
        time_value: exercise.time || 0,
        sets: exercise.sets,
        set_results: exercise.setResults || Array(exercise.sets).fill().map(() => ({
          weight: exercise.weight || 0,
          reps: exercise.reps || 0,
          time: exercise.time || 0,
          completed: false
        }))
      }));

      // Create all exercises
      const createdExercises = await Promise.all(
        exercisesWithOrderIndex.map(exercise => workoutService.createExercise(exercise))
      );

      // Add to local state
      const completeWorkout = {
        ...newWorkout,
        type: workoutData.type,
        exercises: createdExercises.map(exercise => ({
          id: exercise.id,
          exerciseId: exercise.id,
          name: exercise.name,
          muscleGroups: exercise.muscle_groups,
          sets: exercise.sets,
          repsOrTime: exercise.reps_or_time,
          repsValue: exercise.reps_value,
          timeValue: exercise.time_value,
          weight: exercise.weight || 0,
          rest: exercise.rest || 60,
          setResults: exercise.set_results,
          orderIndex: exercise.order_index
        }))
      };

      setWorkouts(prev => [completeWorkout, ...prev]);
      setShowWorkoutWizard(false);
      setCurrentTab('workouts');
    } catch (error) {
      console.error('Error creating workout:', error);
      alert('Failed to create workout. Please try again.');
    }
  };

  const handleStartWorkout = (workout) => {
    // Initialize set results if they don't exist
    const workoutWithResults = {
      ...workout,
      exercises: workout.exercises.map(exercise => ({
        ...exercise,
        setResults: exercise.setResults || Array(exercise.sets).fill().map(() => ({
          weight: exercise.weight || 0,
          reps: exercise.repsValue || 0,
          time: exercise.timeValue || 0,
          completed: false
        }))
      }))
    };
    setExecutingWorkout(workoutWithResults);
  };

  const handleWorkoutComplete = async (completedWorkout) => {
    try {
      // Save completed workout data to the backend
      // This would include updating set results, completion time, etc.
      console.log('Workout completed:', completedWorkout);
      
      // Update local state
      setWorkouts(prev => prev.map(w => 
        w.id === completedWorkout.id ? completedWorkout : w
      ));
      
      setExecutingWorkout(null);
      setCurrentTab('dashboard');
    } catch (error) {
      console.error('Error saving completed workout:', error);
    }
  };

  const handleSaveRoutine = async (routine) => {
    try {
      await workoutService.saveRoutine(routine);
      setRoutineData(routine);
      console.log('Routine saved successfully');
    } catch (error) {
      console.error('Error saving routine:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setWorkouts([]);
      setRoutineData({});
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Filter workouts based on search
  const filteredWorkouts = workouts.filter(workout =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.exercises.some(ex => 
      ex.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={(user) => setUser(user)} />;
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to crush your fitness goals today?
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SimpleCard className="text-center p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{workouts.length}</h3>
          <p className="text-gray-600">Total Workouts</p>
        </SimpleCard>
        
        <SimpleCard className="text-center p-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {workouts.filter(w => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(w.created_at) > weekAgo;
            }).length}
          </h3>
          <p className="text-gray-600">This Week</p>
        </SimpleCard>
        
        <SimpleCard className="text-center p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {workouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0)}
          </h3>
          <p className="text-gray-600">Total Exercises</p>
        </SimpleCard>
      </div>

      {/* Recent Workouts */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Workouts</h2>
          <SimpleButton onClick={() => setCurrentTab('workouts')}>View All</SimpleButton>
        </div>
        
        {workouts.length === 0 ? (
          <SimpleCard className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No workouts yet</h3>
            <p className="text-gray-600 mb-4">Create your first workout to get started!</p>
            <SimpleButton onClick={() => setShowWorkoutWizard(true)}>
              Create First Workout
            </SimpleButton>
          </SimpleCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workouts.slice(0, 4).map((workout) => (
              <SimpleCard key={workout.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <div className="w-5 h-5 bg-current opacity-80 rounded"></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{workout.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{workout.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{workout.exercises?.length || 0} exercises</span>
                      <span>~30 min</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">Custom</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <SimpleButton 
                    onClick={() => handleStartWorkout(workout)}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Workout
                  </SimpleButton>
                  <SimpleButton variant="ghost" size="sm">
                    View Details
                  </SimpleButton>
                </div>
              </SimpleCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderWorkouts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Workouts</h2>
        <SimpleButton onClick={() => setShowWorkoutWizard(true)}>
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

      {loadingWorkouts ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <SimpleCard className="h-32">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </SimpleCard>
            </div>
          ))}
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <SimpleCard className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No workouts found' : 'No workouts yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Create your first workout to get started!'
            }
          </p>
          {!searchQuery && (
            <SimpleButton onClick={() => setShowWorkoutWizard(true)}>
              Create First Workout
            </SimpleButton>
          )}
        </SimpleCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWorkouts.map((workout) => (
            <SimpleCard key={workout.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <div className="w-5 h-5 bg-current opacity-80 rounded"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{workout.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{workout.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{workout.exercises?.length || 0} exercises</span>
                    <span>~30 min</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">Custom</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <SimpleButton 
                  onClick={() => handleStartWorkout(workout)}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Workout
                </SimpleButton>
                <SimpleButton variant="ghost" size="sm">
                  Edit
                </SimpleButton>
              </div>
            </SimpleCard>
          ))}
        </div>
      )}
    </div>
  );

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'workouts', label: 'Workouts', icon: Plus },
    { id: 'routines', label: 'Routines', icon: Target },
    { id: 'calendar', label: 'Schedule', icon: Calendar },
    { id: 'analytics', label: 'Progress', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <IconButton
                icon={mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                variant="ghost"
                className="lg:hidden mr-3"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              />
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Easy Workout</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <IconButton
                icon={<Settings className="w-5 h-5" />}
                variant="ghost"
              />
              <IconButton
                icon={<LogOut className="w-5 h-5" />}
                variant="ghost"
                onClick={handleSignOut}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <nav className="fixed top-16 left-0 bottom-0 w-64 bg-white shadow-lg">
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                      ${currentTab === item.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <IconComponent className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar Navigation */}
          <nav className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-2 sticky top-24">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                      ${currentTab === item.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <IconComponent className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {currentTab === 'dashboard' && renderDashboard()}
            {currentTab === 'workouts' && renderWorkouts()}
            {currentTab === 'routines' && (
              <RoutinePlanner
                workouts={workouts}
                onSaveRoutine={handleSaveRoutine}
                currentRoutine={{}}
              />
            )}
            {currentTab === 'calendar' && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Calendar View</h2>
                <p className="text-gray-600">Coming soon - Schedule your workouts on a calendar!</p>
              </div>
            )}
            {currentTab === 'analytics' && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Progress Analytics</h2>
                <p className="text-gray-600">Coming soon - Track your progress with detailed analytics!</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-30">
        <div className="grid grid-cols-4">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`
                  flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-all duration-200
                  ${currentTab === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <IconComponent className="w-6 h-6 mb-1" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button - hide on mobile bottom nav */}
      <FloatingActionButton
        onClick={() => setShowWorkoutWizard(true)}
        icon={<Plus className="w-6 h-6" />}
        className="hidden sm:flex"
      />

      {/* Mobile FAB - positioned above bottom nav */}
      <FloatingActionButton
        onClick={() => setShowWorkoutWizard(true)}
        icon={<Plus className="w-5 h-5" />}
        className="sm:hidden bottom-20 right-4 w-12 h-12 p-3"
      />

      {/* Modals and Overlays */}
      {showWorkoutWizard && (
        <FullWorkoutWizard
          onComplete={handleWorkoutWizardComplete}
          onCancel={() => setShowWorkoutWizard(false)}
        />
      )}

      {executingWorkout && (
        <WorkoutExecution
          workout={executingWorkout}
          onComplete={handleWorkoutComplete}
          onExit={() => setExecutingWorkout(null)}
        />
      )}

      {/* Safe area for mobile devices */}
      <div className="h-20 lg:hidden"></div>
    </div>
  );
};

export default SimpleWorkoutPlanner;