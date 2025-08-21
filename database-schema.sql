-- Workout Tracker Database Schema for Supabase

-- Enable Row Level Security
ALTER TABLE IF EXISTS workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workout_routines ENABLE ROW LEVEL SECURITY;

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  muscle_groups TEXT[] DEFAULT '{}',
  sets INTEGER DEFAULT 3,
  reps_or_time VARCHAR(10) DEFAULT 'reps',
  reps_value INTEGER DEFAULT 10,
  time_value INTEGER DEFAULT 30,
  set_results JSONB DEFAULT '[]',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout routines table (for routine builder)
CREATE TABLE IF NOT EXISTS workout_routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) DEFAULT 'My Routine',
  selected_workout_ids UUID[] DEFAULT '{}',
  ordered_routine_items JSONB DEFAULT '[]',
  rotation_cycles INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON workouts(user_id);
CREATE INDEX IF NOT EXISTS exercises_workout_id_idx ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS workout_routines_user_id_idx ON workout_routines(user_id);

-- Row Level Security Policies
-- Users can only access their own data

-- Workouts policies
DROP POLICY IF EXISTS "Users can view their own workouts" ON workouts;
CREATE POLICY "Users can view their own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own workouts" ON workouts;
CREATE POLICY "Users can insert their own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own workouts" ON workouts;
CREATE POLICY "Users can update their own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own workouts" ON workouts;
CREATE POLICY "Users can delete their own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Exercises policies (exercises belong to workouts, so we need to check workout ownership)
DROP POLICY IF EXISTS "Users can view exercises from their own workouts" ON exercises;
CREATE POLICY "Users can view exercises from their own workouts" ON exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert exercises to their own workouts" ON exercises;
CREATE POLICY "Users can insert exercises to their own workouts" ON exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update exercises from their own workouts" ON exercises;
CREATE POLICY "Users can update exercises from their own workouts" ON exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete exercises from their own workouts" ON exercises;
CREATE POLICY "Users can delete exercises from their own workouts" ON exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Workout routines policies
DROP POLICY IF EXISTS "Users can view their own workout routines" ON workout_routines;
CREATE POLICY "Users can view their own workout routines" ON workout_routines
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own workout routines" ON workout_routines;
CREATE POLICY "Users can insert their own workout routines" ON workout_routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own workout routines" ON workout_routines;
CREATE POLICY "Users can update their own workout routines" ON workout_routines
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own workout routines" ON workout_routines;
CREATE POLICY "Users can delete their own workout routines" ON workout_routines
  FOR DELETE USING (auth.uid() = user_id);

-- Functions to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_workouts_updated_at ON workouts;
CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exercises_updated_at ON exercises;
CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workout_routines_updated_at ON workout_routines;
CREATE TRIGGER update_workout_routines_updated_at
    BEFORE UPDATE ON workout_routines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();