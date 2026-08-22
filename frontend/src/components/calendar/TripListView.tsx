import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, MapPin, DollarSign } from 'lucide-react';
import { Trip } from '../../types';
import { Badge } from '../common/Badge';

interface TripListViewProps {
  trip: Trip;
}

export const TripListView: React.FC<TripListViewProps> = ({ trip }) => {
  return (
    <div className="space-y-6">
      {trip.stops?.map((stop, sIdx) => (
        <div key={stop.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-extrabold text-xs flex items-center justify-center">
                {sIdx + 1}
              </span>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">{stop.city?.name}</h4>
                <p className="text-xs text-slate-500">{stop.city?.country} • {stop.start_date} to {stop.end_date}</p>
              </div>
            </div>

            <Badge variant="primary" size="md">
              {stop.itinerary_activities?.length || 0} Activities
            </Badge>
          </div>

          {(!stop.itinerary_activities || stop.itinerary_activities.length === 0) ? (
            <p className="text-xs text-slate-400 italic py-2">No activities scheduled yet for this stop.</p>
          ) : (
            <div className="space-y-3">
              {stop.itinerary_activities.map((itAct) => {
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
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      {act.image && (
                        <img
                          src={act.image}
                          alt={act.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{act.name}</span>
                          <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                            {itAct.start_time || '10:00'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{act.description}</p>
                        {itAct.notes && (
                          <p className="text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded mt-1">
                            Note: {itAct.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-slate-900 block">{costFmt}</span>
                      <span className="text-[11px] text-slate-400">{Math.round(act.duration_minutes / 60)} hrs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
