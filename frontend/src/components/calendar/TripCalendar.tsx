import React, { useState } from 'react';
import {
  format,
  parseISO,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Trip, TripStop } from '../../types';

interface TripCalendarProps {
  trip: Trip;
}

export const TripCalendar: React.FC<TripCalendarProps> = ({ trip }) => {
  const tripStartDate = parseISO(trip.start_date);
  const [currentMonth, setCurrentMonth] = useState(tripStartDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Map dates to stops and activities
  const getActivityForDay = (day: Date) => {
    if (!trip.stops) return [];
    const formatted = format(day, 'yyyy-MM-dd');
    const acts: any[] = [];
    for (const stop of trip.stops) {
      if (stop.itinerary_activities) {
        for (const it of stop.itinerary_activities) {
          if (it.activity_date === formatted) {
            acts.push({ ...it, cityName: stop.city?.name });
          }
        }
      }
    }
    return acts;
  };

  const getStopForDay = (day: Date): TripStop | undefined => {
    if (!trip.stops) return undefined;
    const formatted = format(day, 'yyyy-MM-dd');
    return trip.stops.find((s) => s.start_date <= formatted && s.end_date >= formatted);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Calendar Navigation Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <p className="text-xs text-slate-500">Trip duration: {trip.start_date} to {trip.end_date}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(tripStartDate)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Trip Start
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-center py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
        {days.map((day) => {
          const formatted = format(day, 'yyyy-MM-dd');
          const isWithinTrip = formatted >= trip.start_date && formatted <= trip.end_date;
          const isCurrentMonth = format(day, 'M') === format(currentMonth, 'M');
          const stop = getStopForDay(day);
          const acts = getActivityForDay(day);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                !isCurrentMonth
                  ? 'bg-slate-50/40 text-slate-300'
                  : isWithinTrip
                  ? 'bg-white hover:bg-slate-50/80'
                  : 'bg-slate-50/20 text-slate-400'
              } ${isWithinTrip ? 'ring-1 ring-inset ring-brand-500/10' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                    isWithinTrip
                      ? 'bg-brand-600 text-white shadow-2xs'
                      : 'text-slate-700'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {stop && (
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200 truncate max-w-[80px]">
                    {stop.city?.name}
                  </span>
                )}
              </div>

              {/* Day scheduled activities pills */}
              <div className="space-y-1 my-1 flex-1 overflow-y-auto max-h-[60px] scrollbar-none">
                {acts.map((actItem) => (
                  <div
                    key={actItem.id}
                    className="p-1 rounded bg-slate-100/90 text-slate-800 text-[10px] truncate border border-slate-200/60 font-medium flex items-center gap-1"
                    title={`${actItem.start_time || ''} ${actItem.activity?.name}`}
                  >
                    <Clock className="w-2.5 h-2.5 text-brand-600 shrink-0" />
                    <span className="truncate">{actItem.activity?.name}</span>
                  </div>
                ))}
              </div>

              {isWithinTrip && acts.length === 0 && (
                <span className="text-[10px] text-slate-300 italic">No sights</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
