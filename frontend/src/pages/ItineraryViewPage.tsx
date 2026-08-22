import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, parseISO, eachDayOfInterval } from 'date-fns';
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Share2,
  Printer,
  ArrowLeft,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { tripService, budgetService, shareService } from '../services/api';
import { Trip, BudgetSummary } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const ItineraryViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Share modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    if (id) {
      loadTripData(parseInt(id, 10));
    }
  }, [id]);

  const loadTripData = async (tripId: number) => {
    try {
      setLoading(true);
      const [tripData, budgetData] = await Promise.all([
        tripService.getTrip(tripId),
        budgetService.getBudget(tripId),
      ]);
      setTrip(tripData);
      setBudget(budgetData);
    } catch (err) {
      console.error('Failed to load trip', err);
      toast.error('Error', 'Failed to load trip itinerary.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!trip) return;
    try {
      const res = await shareService.createShareLink(trip.id);
      setShareLink(`${window.location.origin}/shared/${res.share_token}`);
      setShareModalOpen(true);
    } catch (err) {
      toast.error('Error', 'Failed to generate share link.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !trip) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="Generating final itinerary..." />
      </div>
    );
  }

  const formattedCost = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(budget?.total_estimated_cost || 0);

  // Group days chronologically across stops
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:space-y-4">
      {/* Back and Action Buttons */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to={`/trips/${trip.id}/builder`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Builder</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Itinerary</span>
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Trip</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-card border border-slate-200/80 bg-slate-900 text-white">
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
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-300">
              Personalized Travel Itinerary
            </span>
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

      {/* Description Snippet */}
      {trip.description && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs sm:text-sm leading-relaxed shadow-xs">
          <p>{trip.description}</p>
        </div>
      )}

      {/* Day by Day Presentation */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Day-by-Day Schedule
        </h2>

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

              {/* Day Content */}
              <div className="p-5">
                {day.activities.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Free day for leisure exploration, transit, and spontaneous sights.
                  </p>
                ) : (
                  <div className="space-y-4">
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
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80"
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
                            <span className="text-sm font-extrabold text-slate-900 block">
                              {costFmt}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {Math.round(act.duration_minutes / 60)} hrs duration
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

      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Your Trip Itinerary"
        subtitle="Anyone with this link can view the read-only schedule & copy to their account"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-slate-700 truncate select-all">
              {shareLink}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                toast.success('Link Copied!', 'Share link copied to clipboard.');
              }}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shrink-0 transition-colors shadow-2xs"
            >
              Copy Link
            </button>
          </div>
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShareModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
