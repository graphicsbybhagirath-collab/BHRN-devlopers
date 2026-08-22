import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO, eachDayOfInterval } from 'date-fns';
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Copy,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { shareService } from '../services/api';
import { PublicTripView } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';

export const SharedTripPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const [data, setData] = useState<PublicTripView | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (shareToken) {
      loadPublicTrip(shareToken);
    }
  }, [shareToken]);

  const loadPublicTrip = async (token: string) => {
    try {
      setLoading(true);
      const res = await shareService.getPublicTrip(token);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load shared trip', err);
      toast.error('Not Found', 'This shared trip link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrip = async () => {
    if (!isAuthenticated) {
      toast.info('Sign in to Copy', 'Please sign in or create an account to copy this trip to your dashboard.');
      navigate('/login', { state: { from: { pathname: `/shared/${shareToken}` } } });
      return;
    }

    if (!shareToken) return;

    try {
      setCopying(true);
      const cloned = await shareService.copyTrip(shareToken);
      toast.success('Trip Copied!', `"${cloned.name}" has been added to your dashboard.`);
      navigate(`/trips/${cloned.id}/builder`);
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to copy trip.');
      toast.error('Error', msg);
    } finally {
      setCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="Loading shared itinerary..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Trip Not Found</h2>
        <p className="text-xs text-slate-500">This itinerary link may have been made private or deleted.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-xs"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const { trip, budget, owner_name } = data;

  const formattedCost = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(budget.total_estimated_cost || 0);

  // Group days
  let dayCounter = 1;
  const daysList: any[] = [];
  const stops = trip.stops || [];

  for (const stop of stops) {
    const sStart = parseISO(stop.start_date);
    const sEnd = parseISO(stop.end_date);
    const intervalDays = eachDayOfInterval({ start: sStart, end: sEnd });

    for (const dayDate of intervalDays) {
      const dateStr = format(dayDate, 'yyyy-MM-dd');
      const dayActs = (stop.itinerary_activities || []).filter(
        (it) => it.activity_date === dateStr
      );
      daysList.push({
        dayNumber: dayCounter++,
        dateStr,
        stop,
        activities: dayActs.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')),
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-brand-900">
              Shared Public Itinerary • Planned by {owner_name}
            </p>
            <p className="text-[11px] text-brand-700">
              You can copy this complete multi-city itinerary into your account and customize dates & activities.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyTrip}
          disabled={copying}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shadow-sm transition-all shrink-0 disabled:opacity-50"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>{copying ? 'Copying Trip...' : 'Copy Trip to My Account'}</span>
        </button>
      </div>

      {/* Hero Cover */}
      <div className="relative rounded-3xl overflow-hidden shadow-card border border-slate-200 bg-slate-900 text-white">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={
              trip.cover_image ||
              'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'
            }
            alt={trip.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-brand-300">
                Community Itinerary
              </span>
              <span className="text-xs text-slate-300">• Planned by {owner_name}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {trip.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
              <span className="flex items-center gap-1.5 font-semibold">
                <MapPin className="w-4 h-4 text-brand-400" />
                {trip.cities_summary}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-400" />
                {trip.start_date} – {trip.end_date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-bold text-white">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                {formattedCost} estimated
              </span>
            </div>
          </div>
        </div>
      </div>

      {trip.description && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs sm:text-sm leading-relaxed shadow-xs">
          <p>{trip.description}</p>
        </div>
      )}

      {/* Budget Summary Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Estimated Trip Budget Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {budget.category_breakdown.map((cat) => (
            <div key={cat.category} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[11px] text-slate-500 font-medium block truncate">{cat.category}</span>
              <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">
                ₹{cat.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Day by Day Itinerary */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Complete Day-by-Day Schedule
          </h2>
          <button
            onClick={handleCopyTrip}
            disabled={copying}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Itinerary</span>
          </button>
        </div>

        {daysList.map((day) => {
          const formattedDate = (() => {
            try {
              return format(parseISO(day.dateStr), 'EEEE, d MMMM yyyy');
            } catch {
              return day.dateStr;
            }
          })();

          return (
            <div
              key={day.dateStr}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
            >
              {/* Day Header */}
              <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-brand-600 text-white font-extrabold text-xs">
                    DAY {day.dayNumber}
                  </span>
                  <div>
                    <span className="font-bold text-sm text-slate-900">{day.stop.city?.name}</span>
                    <span className="text-xs text-slate-500 ml-2">({formattedDate})</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {day.activities.length} {day.activities.length === 1 ? 'Activity' : 'Activities'}
                </span>
              </div>

              {/* Day Activities */}
              <div className="p-5">
                {day.activities.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Free day for transit, relaxation, and local discovery.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {day.activities.map((itAct: any) => {
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
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-xs font-bold text-brand-700 shadow-2xs">
                              {itAct.start_time || '10:00'}
                            </div>
                            {act.image && (
                              <img
                                src={act.image}
                                alt={act.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900">{act.name}</h4>
                                <Badge variant="secondary" size="sm">
                                  {act.category}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{act.description}</p>
                              {itAct.notes && (
                                <p className="text-xs text-brand-800 bg-brand-50 rounded px-2 py-0.5 mt-1 font-medium">
                                  Note: {itAct.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-extrabold text-slate-900 block">{costFmt}</span>
                            <span className="text-[11px] text-slate-400">
                              {Math.round(act.duration_minutes / 60)} hrs
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
