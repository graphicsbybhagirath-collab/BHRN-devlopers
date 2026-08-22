import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, DollarSign, Plus, Trash2, Edit3, MapPin, Sparkles } from 'lucide-react';
import { ItineraryActivity, TripStop } from '../../types';
import { Badge } from '../common/Badge';

interface DayScheduleProps {
  dayNumber: number;
  dateStr: string;
  stop: TripStop;
  activities: ItineraryActivity[];
  onAddActivity: (dateStr: string) => void;
  onEditActivity: (activity: ItineraryActivity) => void;
  onDeleteActivity: (id: number) => void;
}

export const DaySchedule: React.FC<DayScheduleProps> = ({
  dayNumber,
  dateStr,
  stop,
  activities,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}) => {
  const formattedDate = (() => {
    try {
      return format(parseISO(dateStr), 'EEEE, d MMMM yyyy');
    } catch {
      return dateStr;
    }
  })();

  const sortedActivities = [...activities].sort((a, b) => {
    if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time);
    return a.order_index - b.order_index;
  });

  const dayTotalCost = sortedActivities.reduce(
    (acc, item) => acc + (item.activity?.estimated_cost || 0),
    0
  );

  const formattedDayCost = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(dayTotalCost);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Day Header */}
      <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-brand-600 text-white font-extrabold text-xs shadow-2xs tracking-wide">
            DAY {dayNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">{stop.city?.name}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            Day Total: <span className="text-brand-700">{formattedDayCost}</span>
          </span>
          <button
            onClick={() => onAddActivity(dateStr)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Activity Timeline / Schedule */}
      <div className="p-4 sm:p-5">
        {sortedActivities.length === 0 ? (
          <div className="py-8 text-center rounded-xl bg-slate-50/50 border border-dashed border-slate-200">
            <Sparkles className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No activities scheduled for this day</p>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Add sightseeing, food tours, or cultural experiences to your schedule</p>
            <button
              onClick={() => onAddActivity(dateStr)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-brand-600" />
              <span>Browse {stop.city?.name} Activities</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedActivities.map((item, idx) => {
              const act = item.activity;
              const formattedActCost =
                act.estimated_cost === 0
                  ? 'Free'
                  : new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(act.estimated_cost);

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-colors group"
                >
                  {/* Left: Time + Image + Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {/* Time Pill */}
                    <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold shadow-2xs">
                      <Clock className="w-3 h-3 text-brand-600" />
                      <span>{item.start_time || '--:--'}</span>
                    </div>

                    {/* Image */}
                    {act.image && (
                      <img
                        src={act.image}
                        alt={act.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 hidden sm:block"
                      />
                    )}

                    {/* Text Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-sm font-bold text-slate-900 truncate">
                          {act.name}
                        </h5>
                        <Badge variant="secondary" size="sm">
                          {act.category}
                        </Badge>
                      </div>

                      {item.notes ? (
                        <p className="text-xs text-brand-700 bg-brand-50/60 rounded px-1.5 py-0.5 mt-1 line-clamp-1 border border-brand-200/40">
                          Note: {item.notes}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Cost, Duration, Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-extrabold text-slate-900 block">
                        {formattedActCost}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {Math.round(act.duration_minutes / 60)} hrs
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditActivity(item)}
                        title="Edit Time & Notes"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteActivity(item.id)}
                        title="Remove Activity"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
