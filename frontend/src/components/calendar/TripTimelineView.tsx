import React from 'react';
import { format, parseISO, eachDayOfInterval } from 'date-fns';
import { MapPin, Clock, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { Trip, TripStop } from '../../types';
import { Badge } from '../common/Badge';

interface TripTimelineViewProps {
  trip: Trip;
}

export const TripTimelineView: React.FC<TripTimelineViewProps> = ({ trip }) => {
  const days = eachDayOfInterval({
    start: parseISO(trip.start_date),
    end: parseISO(trip.end_date),
  });

  const getStopForDay = (formatted: string): TripStop | undefined => {
    if (!trip.stops) return undefined;
    return trip.stops.find((s) => s.start_date <= formatted && s.end_date >= formatted);
  };

  const getActivitiesForDay = (formatted: string) => {
    if (!trip.stops) return [];
    const list: any[] = [];
    for (const stop of trip.stops) {
      if (stop.itinerary_activities) {
        for (const act of stop.itinerary_activities) {
          if (act.activity_date === formatted) {
            list.push(act);
          }
        }
      }
    }
    return list.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="mb-6">
        <h3 className="text-base font-extrabold text-slate-900">Timeline & Itinerary Progression</h3>
        <p className="text-xs text-slate-500">Connected journey across all stops</p>
      </div>

      <div className="relative pl-6 sm:pl-8 border-l-2 border-brand-500/30 space-y-8 ml-3 sm:ml-4">
        {days.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const stop = getStopForDay(dateStr);
          const acts = getActivitiesForDay(dateStr);
          const dayNumber = idx + 1;

          return (
            <div key={dateStr} className="relative group">
              {/* Timeline Pin Node */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[11px] ring-4 ring-white shadow-xs">
                {dayNumber}
              </div>

              {/* Day Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Day {dayNumber}: {stop?.city?.name || 'In Transit'}
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    ({format(day, 'EEEE, d MMMM')})
                  </span>
                </div>

                {stop && (
                  <span className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
                    {stop.city?.country}
                  </span>
                )}
              </div>

              {/* Day Activities */}
              {acts.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-400 italic">
                  Free day or travel between destinations.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {acts.map((itAct: any) => {
                    const act = itAct.activity;
                    const costFmt =
                      act.estimated_cost === 0
                        ? 'Free'
                        : new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0,
                          }).format(act.estimated_cost);

                    return (
                      <div
                        key={itAct.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs font-bold text-brand-700 shadow-2xs">
                            {itAct.start_time || '10:00'}
                          </div>
                          {act.image && (
                            <img
                              src={act.image}
                              alt={act.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-bold text-xs text-slate-900">{act.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {act.category} • {act.duration_minutes} mins
                              {itAct.notes && ` • Note: ${itAct.notes}`}
                            </p>
                          </div>
                        </div>

                        <div className="text-right font-extrabold text-xs text-slate-900">
                          {costFmt}
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
    </div>
  );
};
