import React from 'react';
import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { TripStop } from '../../types';

interface StopTimelineProps {
  stops: TripStop[];
  activeStopId: number | null;
  onSelectStop: (stopId: number) => void;
  onAddStop: () => void;
  onDeleteStop: (stopId: number) => void;
  onMoveStop?: (index: number, direction: 'left' | 'right') => void;
}

export const StopTimeline: React.FC<StopTimelineProps> = ({
  stops,
  activeStopId,
  onSelectStop,
  onAddStop,
  onDeleteStop,
  onMoveStop,
}) => {
  const formatDateRange = (start: string, end: string) => {
    try {
      const s = parseISO(start);
      const e = parseISO(end);
      return `${format(s, 'd MMM')} – ${format(e, 'd MMM')}`;
    } catch {
      return `${start} – ${end}`;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>Trip Route & Destinations</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {stops.length} {stops.length === 1 ? 'City Stop' : 'City Stops'} planned in sequence
          </p>
        </div>

        <button
          onClick={onAddStop}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs border border-brand-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stop</span>
        </button>
      </div>

      {stops.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <p className="text-xs font-semibold text-slate-700">No destinations added yet</p>
          <p className="text-[11px] text-slate-500 mt-1 mb-3">Add your first city stop to begin building your day-by-day itinerary</p>
          <button
            onClick={onAddStop}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-xs hover:bg-brand-700 transition-colors"
          >
            + Add First Destination
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {stops.map((stop, index) => {
            const isActive = activeStopId === stop.id;
            const activityCount = stop.itinerary_activities?.length || 0;

            return (
              <React.Fragment key={stop.id}>
                {/* Stop Card */}
                <div
                  onClick={() => onSelectStop(stop.id)}
                  className={`group shrink-0 w-64 rounded-xl p-3.5 border transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                        {index + 1}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">
                        {stop.city?.name || 'City Stop'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onMoveStop && index > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveStop(index, 'left');
                          }}
                          title="Move Stop Left"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      )}
                      {onMoveStop && index < stops.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveStop(index, 'right');
                          }}
                          title="Move Stop Right"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStop(stop.id);
                        }}
                        title="Delete Stop"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateRange(stop.start_date, stop.end_date)}
                    </span>
                    <span className="font-semibold text-brand-700 bg-brand-100/60 px-2 py-0.5 rounded-md text-[11px]">
                      {activityCount} {activityCount === 1 ? 'Act' : 'Acts'}
                    </span>
                  </div>
                </div>

                {/* Connecting arrow */}
                {index < stops.length - 1 && (
                  <div className="shrink-0 text-slate-300 font-bold text-lg">
                    →
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
