import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  format,
  parseISO,
  eachDayOfInterval,
  addDays,
} from 'date-fns';
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Share2,
  Eye,
  BarChart3,
  Plus,
  ArrowLeft,
  Clock,
  Sparkles,
} from 'lucide-react';
import { tripService, stopService, itineraryService, budgetService, shareService } from '../services/api';
import { Trip, TripStop, ItineraryActivity, BudgetSummary } from '../types';
import { StopTimeline } from '../components/itinerary/StopTimeline';
import { DaySchedule } from '../components/itinerary/DaySchedule';
import { AddStopModal } from '../components/itinerary/AddStopModal';
import { AddActivityModal } from '../components/itinerary/AddActivityModal';
import { EditActivityModal } from '../components/itinerary/EditActivityModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const ItineraryBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStopId, setActiveStopId] = useState<number | null>(null);

  // Modals
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState<string>('');
  const [selectedActivityItem, setSelectedActivityItem] = useState<ItineraryActivity | null>(null);
  const [editActivityOpen, setEditActivityOpen] = useState(false);
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
      if (tripData.stops && tripData.stops.length > 0) {
        if (!activeStopId || !tripData.stops.find((s) => s.id === activeStopId)) {
          setActiveStopId(tripData.stops[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load trip', err);
      toast.error('Error', 'Failed to load trip details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (id) {
      await loadTripData(parseInt(id, 10));
    }
  };

  const handleDeleteStop = async (stopId: number) => {
    if (!window.confirm('Delete this destination stop and all its scheduled activities?')) return;
    try {
      await stopService.deleteStop(stopId);
      toast.success('Stop Removed', 'Destination removed from itinerary.');
      await handleRefresh();
    } catch (err) {
      toast.error('Error', 'Failed to delete stop.');
    }
  };

  const handleMoveStop = async (index: number, direction: 'left' | 'right') => {
    if (!trip || !trip.stops) return;
    const stopsList = [...trip.stops];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stopsList.length) return;

    // Swap order_index
    const temp = stopsList[index];
    stopsList[index] = stopsList[targetIndex];
    stopsList[targetIndex] = temp;

    const payload = stopsList.map((s, idx) => ({ id: s.id, order_index: idx }));

    try {
      await stopService.reorderStops(trip.id, payload);
      await handleRefresh();
      toast.success('Route Updated', 'Stops reordered successfully.');
    } catch (err) {
      toast.error('Error', 'Failed to reorder stops.');
    }
  };

  const handleOpenAddActivity = (dateStr: string) => {
    setSelectedDayDate(dateStr);
    setAddActivityOpen(true);
  };

  const handleOpenEditActivity = (actItem: ItineraryActivity) => {
    setSelectedActivityItem(actItem);
    setEditActivityOpen(true);
  };

  const handleDeleteActivity = async (activityId: number) => {
    if (!window.confirm('Remove this activity from your day schedule?')) return;
    try {
      await itineraryService.deleteActivity(activityId);
      toast.success('Activity Removed', 'Schedule updated.');
      await handleRefresh();
    } catch (err) {
      toast.error('Error', 'Failed to delete activity.');
    }
  };

  const handleShareTrip = async () => {
    if (!trip) return;
    try {
      const res = await shareService.createShareLink(trip.id);
      setShareLink(`${window.location.origin}/shared/${res.share_token}`);
      setShareModalOpen(true);
    } catch (err) {
      toast.error('Error', 'Failed to generate share link.');
    }
  };

  if (loading || !trip) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="Loading interactive itinerary builder..." />
      </div>
    );
  }

  // Calculate day schedules for all stops or active stop
  const stops = trip.stops || [];
  const activeStop = stops.find((s) => s.id === activeStopId) || stops[0];

  // Calculate overall day index across all stops
  let dayCounter = 1;
  const stopDayIntervals: { stop: TripStop; days: { dayNumber: number; dateStr: string; activities: ItineraryActivity[] }[] }[] = [];

  for (const stop of stops) {
    const sStart = parseISO(stop.start_date);
    const sEnd = parseISO(stop.end_date);
    const dayDates = eachDayOfInterval({ start: sStart, end: sEnd });

    const stopDays = dayDates.map((d) => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayActs = (stop.itinerary_activities || []).filter(
        (it) => it.activity_date === dateStr
      );
      const currentDayNum = dayCounter++;
      return {
        dayNumber: currentDayNum,
        dateStr,
        activities: dayActs,
      };
    });

    stopDayIntervals.push({
      stop,
      days: stopDays,
    });
  }

  const activeStopInterval = stopDayIntervals.find((item) => item.stop.id === activeStop?.id);

  const formattedTotalCost = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(budget?.total_estimated_cost || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Navigation & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <Link
            to="/trips"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Trips</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {trip.name}
            </h1>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-extrabold text-xs border border-brand-200 shadow-2xs">
              <DollarSign className="w-3.5 h-3.5 text-brand-600" />
              <span>{formattedTotalCost} Estimated</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span>{trip.cities_summary || 'Multi-City Route'}</span>
            <span className="text-slate-300">•</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{trip.start_date} to {trip.end_date}</span>
          </p>
        </div>

        {/* View Mode Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/trips/${trip.id}/budget`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Budget Breakdown</span>
          </Link>
          <Link
            to={`/trips/${trip.id}/calendar`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
          >
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>Calendar & Timeline</span>
          </Link>
          <Link
            to={`/trips/${trip.id}/view`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
          >
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>Final View</span>
          </Link>
          <button
            onClick={handleShareTrip}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Trip</span>
          </button>
        </div>
      </div>

      {/* Stop Timeline / Destination sequence */}
      <StopTimeline
        stops={stops}
        activeStopId={activeStopId}
        onSelectStop={(stopId) => setActiveStopId(stopId)}
        onAddStop={() => setAddStopOpen(true)}
        onDeleteStop={handleDeleteStop}
        onMoveStop={handleMoveStop}
      />

      {/* Day-by-day Itinerary builder area */}
      {stops.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <MapPin className="w-10 h-10 text-brand-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Add Your First Destination</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Pick a city like Paris, Amsterdam, or Rome and assign travel dates to unlock the day-by-day activity builder.
          </p>
          <button
            onClick={() => setAddStopOpen(true)}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md transition-colors"
          >
            + Add Destination Stop
          </button>
        </div>
      ) : activeStopInterval ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Itinerary for {activeStopInterval.stop.city?.name}
              </h2>
              <p className="text-xs text-slate-500">
                {activeStopInterval.stop.start_date} to {activeStopInterval.stop.end_date} • {activeStopInterval.days.length} Days
              </p>
            </div>
            <button
              onClick={() => handleOpenAddActivity(activeStopInterval.days[0]?.dateStr || activeStopInterval.stop.start_date)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Activity in {activeStopInterval.stop.city?.name}</span>
            </button>
          </div>

          <div className="space-y-5">
            {activeStopInterval.days.map((day) => (
              <DaySchedule
                key={day.dateStr}
                dayNumber={day.dayNumber}
                dateStr={day.dateStr}
                stop={activeStopInterval.stop}
                activities={day.activities}
                onAddActivity={handleOpenAddActivity}
                onEditActivity={handleOpenEditActivity}
                onDeleteActivity={handleDeleteActivity}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Modals */}
      <AddStopModal
        isOpen={addStopOpen}
        onClose={() => setAddStopOpen(false)}
        trip={trip}
        onStopAdded={handleRefresh}
      />

      <AddActivityModal
        isOpen={addActivityOpen}
        onClose={() => setAddActivityOpen(false)}
        stop={activeStop}
        targetDate={selectedDayDate}
        onActivityAdded={handleRefresh}
      />

      <EditActivityModal
        isOpen={editActivityOpen}
        onClose={() => setEditActivityOpen(false)}
        activityItem={selectedActivityItem}
        onActivityUpdated={handleRefresh}
      />

      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Your Trip Itinerary"
        subtitle="Anyone with this link can view the read-only schedule & clone it"
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
          <p className="text-xs text-slate-500">
            Share this link with friends or other travelers so they can follow your trip or copy it directly into their account.
          </p>
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
