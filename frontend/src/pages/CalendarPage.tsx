import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, GitCommit, List, MapPin } from 'lucide-react';
import { tripService } from '../services/api';
import { Trip } from '../types';
import { TripCalendar } from '../components/calendar/TripCalendar';
import { TripTimelineView } from '../components/calendar/TripTimelineView';
import { TripListView } from '../components/calendar/TripListView';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export const CalendarPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline' | 'list'>('calendar');

  useEffect(() => {
    if (id) {
      loadTrip(parseInt(id, 10));
    }
  }, [id]);

  const loadTrip = async (tripId: number) => {
    try {
      setLoading(true);
      const data = await tripService.getTrip(tripId);
      setTrip(data);
    } catch (err) {
      console.error('Failed to load trip', err);
      toast.error('Error', 'Failed to load trip schedule.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !trip) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="Loading calendar & timeline views..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            to={`/trips/${trip.id}/builder`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Itinerary Builder</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Trip Calendar & Timeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {trip.name} • {trip.cities_summary} • {trip.start_date} to {trip.end_date}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'calendar'
                ? 'bg-white text-brand-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'timeline'
                ? 'bg-white text-brand-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-brand-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {viewMode === 'calendar' && <TripCalendar trip={trip} />}
      {viewMode === 'timeline' && <TripTimelineView trip={trip} />}
      {viewMode === 'list' && <TripListView trip={trip} />}
    </div>
  );
};
