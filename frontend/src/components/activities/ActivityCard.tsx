import React from 'react';
import { Star, Clock, DollarSign, Plus } from 'lucide-react';
import { Activity } from '../../types';
import { Badge } from '../common/Badge';

interface ActivityCardProps {
  activity: Activity;
  onAddToItinerary?: (activity: Activity) => void;
  isAdded?: boolean;
}

const CATEGORY_COLORS: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'indigo'> = {
  Sightseeing: 'primary',
  Culture: 'indigo',
  Food: 'warning',
  Adventure: 'danger',
  Nature: 'success',
  Shopping: 'secondary',
  Entertainment: 'primary',
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onAddToItinerary,
  isAdded = false,
}) => {
  const formattedCost =
    activity.estimated_cost === 0
      ? 'Free'
      : new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(activity.estimated_cost);

  const durationHours = (activity.duration_minutes / 60).toFixed(
    activity.duration_minutes % 60 === 0 ? 0 : 1
  );

  return (
    <div className="group flex flex-col rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-card transition-all duration-300 overflow-hidden">
      {/* Activity Image */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        <img
          src={
            activity.image ||
            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80'
          }
          alt={activity.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        {/* Category & Rating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <Badge variant={CATEGORY_COLORS[activity.category] || 'primary'} size="sm">
            {activity.category}
          </Badge>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-amber-300 text-xs font-bold">
            <Star className="w-3 h-3 fill-amber-300" />
            <span>{activity.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {activity.name}
          </h4>
          {activity.city_name && (
            <p className="text-[11px] text-brand-600 font-semibold mt-0.5">
              {activity.city_name}
            </p>
          )}
          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            {activity.description}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{durationHours} hrs</span>
          </div>
          <div className="font-bold text-slate-900 text-sm">
            {formattedCost}
          </div>
        </div>

        {onAddToItinerary && (
          <button
            onClick={() => onAddToItinerary(activity)}
            disabled={isAdded}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isAdded
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdded ? 'Added to Day' : 'Add to Day'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
