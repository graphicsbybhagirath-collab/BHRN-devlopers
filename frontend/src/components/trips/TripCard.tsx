import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  DollarSign,
  ArrowRight,
  Share2,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';
import { Trip } from '../../types';
import { format, parseISO } from 'date-fns';

interface TripCardProps {
  trip: Trip;
  onEdit?: (trip: Trip) => void;
  onDelete?: (tripId: number) => void;
  onShare?: (tripId: number) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onEdit,
  onDelete,
  onShare,
}) => {
  const formatDateRange = (start: string, end: string) => {
    try {
      const s = parseISO(start);
      const e = parseISO(end);
      return `${format(s, 'd MMM')} – ${format(e, 'd MMM yyyy')}`;
    } catch {
      return `${start} – ${end}`;
    }
  };

  const formattedCost = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(trip.estimated_cost || 0);

  return (
    <div className="group flex flex-col rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-card transition-all duration-300 overflow-hidden">
      {/* Cover Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={
            trip.cover_image ||
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
          }
          alt={trip.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-brand-300" />
            {formatDateRange(trip.start_date, trip.end_date)}
          </span>

          <div className="flex items-center gap-1">
            {onShare && (
              <button
                onClick={() => onShare(trip.id)}
                title="Share Trip"
                className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-brand-600 transition-colors shadow-xs"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(trip)}
                title="Edit Trip Details"
                className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-brand-600 transition-colors shadow-xs"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(trip.id)}
                title="Delete Trip"
                className="p-1.5 rounded-full bg-white/80 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title inside bottom of cover */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white line-clamp-1 drop-shadow-sm">
            {trip.name}
          </h3>
          <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="w-3 h-3 text-brand-300 shrink-0" />
            {trip.cities_summary || 'Multi-City Itinerary'}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        {trip.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {trip.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
              Estimated Total
            </span>
            <span className="text-base font-extrabold text-brand-700">
              {formattedCost}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/trips/${trip.id}/view`}
              title="View Itinerary"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Link
              to={`/trips/${trip.id}/builder`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>Build / Edit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
