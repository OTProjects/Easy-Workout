-- Workout Tracker Database Schema for Supabase (Fixed Version)

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

-- Create workout routines table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON workouts(user_id);
CREATE INDEX IF NOT EXISTS exercises_workout_id_idx ON exercises(workout_id);
CREATE INDEX IF NOT EXISTS workout_routines_user_id_idx ON workout_routines(user_id);

-- Enable Row Level Security
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;

-- Workouts policies
CREATE POLICY "Users can manage their own workouts" ON workouts
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Exercises policies
CREATE POLICY "Users can manage exercises from their own workouts" ON exercises
  USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Workout routines policies
CREATE POLICY "Users can manage their own workout routines" ON workout_routines
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_routines_updated_at
    BEFORE UPDATE ON workout_routines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();