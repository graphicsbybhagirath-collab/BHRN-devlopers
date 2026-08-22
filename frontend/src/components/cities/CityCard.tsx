import React from 'react';
import { MapPin, Star, Plus, Compass } from 'lucide-react';
import { City } from '../../types';

interface CityCardProps {
  city: City;
  onAddToTrip?: (city: City) => void;
  onExplore?: (city: City) => void;
}

export const CityCard: React.FC<CityCardProps> = ({
  city,
  onAddToTrip,
  onExplore,
}) => {
  const renderCostIndex = (index: number) => {
    return (
      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
        {'$'.repeat(Math.max(1, Math.min(5, index)))}
      </span>
    );
  };

  return (
    <div className="group flex flex-col rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-card transition-all duration-300 overflow-hidden">
      {/* City Image Container */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={
            city.image ||
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'
          }
          alt={city.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-medium">
            <MapPin className="w-3 h-3 text-brand-300" />
            {city.country}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white text-xs font-bold shadow-xs">
            <Star className="w-3 h-3 fill-white" />
            <span>{city.popularity}%</span>
          </div>
        </div>

        {/* City Name at bottom */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-extrabold text-white drop-shadow-sm">
            {city.name}
          </h3>
          {city.region && (
            <p className="text-xs text-slate-200">{city.region}</p>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {city.description || 'A fascinating destination full of culture, sights, and rich experiences.'}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Cost:</span>
            {renderCostIndex(city.cost_index)}
          </div>
          {city.activity_count !== undefined && (
            <span className="text-slate-500 font-medium">
              {city.activity_count} {city.activity_count === 1 ? 'activity' : 'activities'}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-2">
          {onExplore && (
            <button
              onClick={() => onExplore(city)}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-brand-600" />
              <span>Explore</span>
            </button>
          )}
          {onAddToTrip && (
            <button
              onClick={() => onAddToTrip(city)}
              className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Trip</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
