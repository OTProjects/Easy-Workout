import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Target, Calendar, Award, Activity } from 'lucide-react';
import Card, { ProgressCard } from './ui/Card';
import { designSystem, getWorkoutTypeStyle } from '../styles/designSystem';

const AnalyticsDashboard = ({ workouts = [], routineData = {} }) => {
  // Calculate analytics data
  const analytics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Recent workouts (last 30 days)
    const recentWorkouts = workouts.filter(workout => 
      new Date(workout.created_at) >= thirtyDaysAgo
    );

    const thisWeekWorkouts = workouts.filter(workout => 
      new Date(workout.created_at) >= sevenDaysAgo
    );

    // Workout type distribution
    const typeDistribution = workouts.reduce((acc, workout) => {
      const type = workout.type || 'mixed';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Exercise frequency
    const exerciseFrequency = {};
    workouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        const name = exercise.name;
        exerciseFrequency[name] = (exerciseFrequency[name] || 0) + 1;
      });
    });

    // Top exercises
    const topExercises = Object.entries(exerciseFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Weekly consistency (last 4 weeks)
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.created_at);
        return workoutDate >= weekStart && workoutDate < weekEnd;
      });

      weeklyData.push({
        week: `Week ${4 - i}`,
        workouts: weekWorkouts.length,
        totalExercises: weekWorkouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0)
      });
    }

    // Calculate averages and trends
    const avgWorkoutsPerWeek = weeklyData.reduce((sum, week) => sum + week.workouts, 0) / 4;
    const lastTwoWeeksAvg = (weeklyData[2].workouts + weeklyData[3].workouts) / 2;
    const firstTwoWeeksAvg = (weeklyData[0].workouts + weeklyData[1].workouts) / 2;
    const weeklyTrend = lastTwoWeeksAvg - firstTwoWeeksAvg;

    return {
      totalWorkouts: workouts.length,
      recentWorkouts: recentWorkouts.length,
      thisWeekWorkouts: thisWeekWorkouts.length,
      typeDistribution,
      topExercises,
      weeklyData,
      avgWorkoutsPerWeek,
      weeklyTrend,
      totalExercises: workouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0),
      consistencyScore: Math.min(100, Math.round((thisWeekWorkouts.length / 5) * 100)) // Assuming 5 workouts per week target
    };
  }, [workouts]);

  // Render workout type chart
  const renderWorkoutTypeChart = () => {
    const types = Object.entries(analytics.typeDistribution);
    const maxCount = Math.max(...types.map(([, count]) => count));

    if (types.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No workout data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {types.map(([type, count]) => {
          const typeStyle = getWorkoutTypeStyle(type);
          const percentage = (count / maxCount) * 100;

          return (
            <div key={type} className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-20">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: typeStyle.primary }}
                />
                <span className="text-sm font-medium capitalize">{type}</span>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: typeStyle.primary,
                      width: `${percentage}%` 
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-600 w-8 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render weekly progress chart
  const renderWeeklyChart = () => {
    const maxWorkouts = Math.max(...analytics.weeklyData.map(week => week.workouts), 1);

    return (
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-2 h-32">
          {analytics.weeklyData.map((week, index) => {
            const height = (week.workouts / maxWorkouts) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                  style={{ height: `${height}%`, minHeight: week.workouts > 0 ? '8px' : '2px' }}
                />
                <div className="text-xs text-gray-600 text-center">
                  <div className="font-semibold">{week.workouts}</div>
                  <div>{week.week}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render top exercises
  const renderTopExercises = () => {
    if (analytics.topExercises.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No exercise data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {analytics.topExercises.map(([exercise, count], index) => (
          <div key={exercise} className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{exercise}</div>
              <div className="text-sm text-gray-500">{count} times</div>
            </div>
            <div className="w-16">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(count / analytics.topExercises[0][1]) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg">
          <BarChart3 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Progress</h2>
          <p className="text-gray-600">Track your fitness journey and achievements</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProgressCard
          title="Total Workouts"
          value={analytics.totalWorkouts}
          icon={<Target className="w-8 h-8 text-blue-600" />}
          color="blue"
        />
        
        <ProgressCard
          title="This Week"
          value={analytics.thisWeekWorkouts}
          change={analytics.weeklyTrend > 0 ? `+${analytics.weeklyTrend.toFixed(1)} from last week` : 
                  analytics.weeklyTrend < 0 ? `${analytics.weeklyTrend.toFixed(1)} from last week` : 'Same as last week'}
          changeType={analytics.weeklyTrend > 0 ? 'positive' : analytics.weeklyTrend < 0 ? 'negative' : 'neutral'}
          icon={<Calendar className="w-8 h-8 text-green-600" />}
          color="green"
        />
        
        <ProgressCard
          title="Avg Per Week"
          value={analytics.avgWorkoutsPerWeek.toFixed(1)}
          icon={<TrendingUp className="w-8 h-8 text-purple-600" />}
          color="purple"
        />
        
        <ProgressCard
          title="Consistency"
          value={analytics.consistencyScore}
          unit="%"
          icon={<Award className="w-8 h-8 text-orange-600" />}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
          </div>
          {renderWeeklyChart()}
        </Card>

        {/* Workout Types */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Workout Types</h3>
          </div>
          {renderWorkoutTypeChart()}
        </Card>
      </div>

      {/* Top Exercises */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Most Popular Exercises</h3>
        </div>
        {renderTopExercises()}
      </Card>

      {/* Achievement Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h4 className="text-lg font-semibold mb-2">Consistency Champion</h4>
          <p className="text-sm opacity-90">
            {analytics.consistencyScore >= 80 ? 'Outstanding commitment!' : 
             analytics.consistencyScore >= 60 ? 'Great progress!' : 
             'Keep building the habit!'}
          </p>
        </div>

        <div className="text-center p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h4 className="text-lg font-semibold mb-2">Workout Warrior</h4>
          <p className="text-sm opacity-90">
            {analytics.totalWorkouts >= 50 ? 'Master level achieved!' : 
             analytics.totalWorkouts >= 20 ? 'Well on your way!' : 
             'Just getting started!'}
          </p>
        </div>

        <div className="text-center p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h4 className="text-lg font-semibold mb-2">Exercise Explorer</h4>
          <p className="text-sm opacity-90">
            {analytics.totalExercises >= 100 ? 'Incredible variety!' : 
             analytics.totalExercises >= 50 ? 'Great diversity!' : 
             'Building your repertoire!'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;