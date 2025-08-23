import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import Card, { WorkoutCard } from './ui/Card';
import Button, { IconButton } from './ui/Button';
import { designSystem, getWorkoutTypeStyle } from '../styles/designSystem';

const CalendarView = ({ 
  routineData = {}, 
  workouts = [], 
  onScheduleWorkout, 
  onRemoveFromSchedule,
  onEditSchedule 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week'); // 'week' or 'month'

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (view === 'week') {
      // Get week view dates
      const weekStart = new Date(currentDate);
      const day = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - day); // Start from Sunday
      
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        weekDates.push(date);
      }
      return weekDates;
    } else {
      // Get month view dates
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday of first week
      
      const monthDates = [];
      let currentCalendarDate = new Date(startDate);
      
      // Generate 6 weeks of dates
      for (let week = 0; week < 6; week++) {
        const weekDates = [];
        for (let day = 0; day < 7; day++) {
          weekDates.push(new Date(currentCalendarDate));
          currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
        }
        monthDates.push(weekDates);
      }
      return monthDates;
    }
  }, [currentDate, view]);

  // Get scheduled workout for a specific date
  const getScheduledWorkout = (date) => {
    const dateStr = date.toDateString();
    const routineItems = routineData.orderedRoutineItems || [];
    const scheduled = routineItems.find(item => {
      if (item.scheduledDate) {
        return new Date(item.scheduledDate).toDateString() === dateStr;
      }
      return false;
    });
    
    if (scheduled) {
      return workouts.find(w => w.id === scheduled.workoutId);
    }
    return null;
  };

  // Navigate calendar
  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const formatDateHeader = () => {
    const options = view === 'week' 
      ? { month: 'long', year: 'numeric' }
      : { month: 'long', year: 'numeric' };
    return currentDate.toLocaleDateString('en-US', options);
  };

  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date) => {
    return date < today;
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Render day cell for calendar
  const renderDayCell = (date, isCompact = false) => {
    const scheduledWorkout = getScheduledWorkout(date);
    const isDateToday = isToday(date);
    const isDatePast = isPastDate(date);
    const isInCurrentMonth = isCurrentMonth(date);

    return (
      <div 
        key={date.toDateString()}
        className={`
          relative p-2 border border-gray-100 transition-colors duration-200
          ${isCompact ? 'min-h-[100px]' : 'min-h-[120px]'}
          ${isDateToday ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'}
          ${!isInCurrentMonth && view === 'month' ? 'bg-gray-50 text-gray-400' : ''}
        `}
      >
        {/* Date number */}
        <div className={`
          inline-flex items-center justify-center w-6 h-6 text-sm font-medium rounded-full mb-2
          ${isDateToday ? 'bg-blue-600 text-white' : 'text-gray-900'}
          ${isDatePast && !isDateToday ? 'text-gray-400' : ''}
        `}>
          {date.getDate()}
        </div>

        {/* Scheduled workout */}
        {scheduledWorkout && (
          <div className="space-y-1">
            <div 
              className={`
                p-2 rounded-lg text-xs font-medium border-l-3 cursor-pointer transition-all duration-200 hover:shadow-md
                ${getWorkoutTypeStyle(scheduledWorkout.type || 'mixed').secondary}
              `}
              style={{ 
                borderLeftColor: getWorkoutTypeStyle(scheduledWorkout.type || 'mixed').primary 
              }}
              onClick={() => onEditSchedule && onEditSchedule(scheduledWorkout, date)}
            >
              <div className="flex items-center justify-between">
                <span className="truncate flex-1">{scheduledWorkout.name}</span>
                <div className="flex items-center gap-1 ml-1">
                  <IconButton
                    icon={<Edit2 className="w-3 h-3" />}
                    size="xs"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSchedule && onEditSchedule(scheduledWorkout, date);
                    }}
                  />
                  <IconButton
                    icon={<Trash2 className="w-3 h-3" />}
                    size="xs"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromSchedule && onRemoveFromSchedule(scheduledWorkout.id, date);
                    }}
                  />
                </div>
              </div>
              {scheduledWorkout.exercises && (
                <div className="text-gray-500 mt-1">
                  {scheduledWorkout.exercises.length} exercises
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add workout button */}
        {!scheduledWorkout && !isDatePast && (
          <button
            onClick={() => onScheduleWorkout && onScheduleWorkout(date)}
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-blue-50/80 rounded-lg"
          >
            <div className="p-2 bg-blue-600 text-white rounded-full shadow-lg">
              <Plus className="w-4 h-4" />
            </div>
          </button>
        )}
      </div>
    );
  };

  // Week view
  const renderWeekView = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Week header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day, index) => (
            <div key={day} className="p-4 text-center font-semibold text-gray-700 bg-gray-50">
              <div className="text-sm">{day}</div>
              <div className="text-lg font-bold">
                {calendarData[index].getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Week body */}
        <div className="grid grid-cols-7">
          {calendarData.map((date) => renderDayCell(date))}
        </div>
      </div>
    );
  };

  // Month view
  const renderMonthView = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Month header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center font-semibold text-gray-700 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Month body */}
        <div className="grid grid-rows-6">
          {calendarData.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-100 last:border-b-0">
              {week.map((date) => renderDayCell(date, true))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">{formatDateHeader()}</h2>
          <div className="flex items-center gap-1">
            <IconButton
              icon={<ChevronLeft className="w-5 h-5" />}
              onClick={() => navigateCalendar('prev')}
              variant="ghost"
            />
            <IconButton
              icon={<ChevronRight className="w-5 h-5" />}
              onClick={() => navigateCalendar('next')}
              variant="ghost"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={currentDate.toDateString() === today.toDateString() ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                view === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                view === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Body */}
      {view === 'week' ? renderWeekView() : renderMonthView()}

      {/* Legend */}
      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-l-4 border-blue-500 bg-blue-100 rounded"></div>
          <span>Strength</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-l-4 border-red-500 bg-red-100 rounded"></div>
          <span>Cardio</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-l-4 border-green-500 bg-green-100 rounded"></div>
          <span>Flexibility</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-l-4 border-amber-500 bg-amber-100 rounded"></div>
          <span>Rest</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;