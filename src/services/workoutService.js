import { supabase } from '../supabase'

// Workout CRUD operations
export const workoutService = {
  // Get all workouts for the current user
  async getWorkouts() {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises (*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching workouts:', error)
      throw error
    }
    
    return data || []
  },

  // Create a new workout
  async createWorkout(workout) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('workouts')
      .insert([
        {
          name: workout.name,
          user_id: user.id
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating workout:', error)
      throw error
    }
    
    return { ...data, exercises: [] }
  },

  // Update a workout
  async updateWorkout(workoutId, updates) {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', workoutId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating workout:', error)
      throw error
    }
    
    return data
  },

  // Delete a workout
  async deleteWorkout(workoutId) {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId)
    
    if (error) {
      console.error('Error deleting workout:', error)
      throw error
    }
  },

  // Exercise operations
  async getExercises(workoutId) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('workout_id', workoutId)
      .order('order_index')
    
    if (error) {
      console.error('Error fetching exercises:', error)
      throw error
    }
    
    return data || []
  },

  async createExercise(exercise) {
    const { data, error } = await supabase
      .from('exercises')
      .insert([exercise])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating exercise:', error)
      throw error
    }
    
    return data
  },

  async updateExercise(exerciseId, updates) {
    const { data, error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', exerciseId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating exercise:', error)
      throw error
    }
    
    return data
  },

  async deleteExercise(exerciseId) {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId)
    
    if (error) {
      console.error('Error deleting exercise:', error)
      throw error
    }
  },

  // Routine operations
  async getRoutine() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching routine:', error)
      throw error
    }
    
    return data
  },

  async saveRoutine(routine) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Try to update existing routine first
    const existingRoutine = await this.getRoutine()
    
    if (existingRoutine) {
      const { data, error } = await supabase
        .from('workout_routines')
        .update({
          selected_workout_ids: routine.selectedWorkoutIds,
          ordered_routine_items: routine.orderedRoutineItems,
          rotation_cycles: routine.rotationCycles
        })
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating routine:', error)
        throw error
      }
      
      return data
    } else {
      // Create new routine
      const { data, error } = await supabase
        .from('workout_routines')
        .insert([
          {
            selected_workout_ids: routine.selectedWorkoutIds,
            ordered_routine_items: routine.orderedRoutineItems,
            rotation_cycles: routine.rotationCycles,
            user_id: user.id
          }
        ])
        .select()
        .single()
      
      if (error) {
        console.error('Error creating routine:', error)
        throw error
      }
      
      return data
    }
  }
}