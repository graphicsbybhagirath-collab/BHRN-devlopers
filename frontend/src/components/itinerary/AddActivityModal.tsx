import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { cityService, itineraryService } from '../../services/api';
import { Activity, TripStop } from '../../types';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { Search, Clock, DollarSign, Star, Plus, Check } from 'lucide-react';
import { Badge } from '../common/Badge';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  stop: TripStop | null;
  targetDate: string;
  onActivityAdded: () => void;
}

const CATEGORIES = ['All', 'Sightseeing', 'Food', 'Culture', 'Adventure', 'Nature', 'Shopping', 'Entertainment'];

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  stop,
  targetDate,
  onActivityAdded,
}) => {
  const toast = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && stop) {
      fetchActivities();
      setSelectedActivity(null);
      setNotes('');
      setStartTime('10:00');
    }
  }, [isOpen, stop, category]);

  const fetchActivities = async () => {
    if (!stop) return;
    try {
      setLoading(true);
      const data = await cityService.getCityActivities(stop.city_id, {
        category: category !== 'All' ? category : undefined,
        search: search.trim() || undefined,
      });
      setActivities(data);
    } catch (err) {
      console.error('Failed to load activities', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActivities();
  };

  const handleAdd = async () => {
    if (!stop || !selectedActivity) {
      toast.error('Validation Error', 'Please select an activity first.');
      return;
    }

    try {
      setIsSubmitting(true);
      await itineraryService.addActivity(stop.id, {
        activity_id: selectedActivity.id,
        activity_date: targetDate,
        start_time: startTime || '10:00',
        notes: notes.trim() || undefined,
      });

      toast.success('Activity Added', `Added "${selectedActivity.name}" to your schedule.`);
      onActivityAdded();
      onClose();
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to add activity.');
      toast.error('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Activity in ${stop?.city?.name || 'City'}`}
      subtitle={`Schedule an experience for ${targetDate}`}
      maxWidth="3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column: Activity Browser (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          {/* Search bar & Category chips */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sights, tours, foodie walks..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  category === cat
                    ? 'bg-brand-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Activity list */}
          <div className="h-80 overflow-y-auto space-y-2.5 pr-1">
            {loading ? (
              <div className="text-center py-10 text-xs text-slate-400">Loading experiences...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">No activities found matching filters.</div>
            ) : (
              activities.map((act) => {
                const isSelected = selectedActivity?.id === act.id;
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
                    key={act.id}
                    onClick={() => setSelectedActivity(act)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <img
                      src={act.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80'}
                      alt={act.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-bold text-xs text-slate-900 truncate">{act.name}</h5>
                        <span className="text-xs font-extrabold text-brand-700 shrink-0">{costFmt}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" size="sm">
                          {act.category}
                        </Badge>
                        <span className="text-[11px] text-amber-600 font-bold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {act.rating.toFixed(1)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {Math.round(act.duration_minutes / 60)}h
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Schedule Configuration (5 cols) */}
        <div className="md:col-span-5 bg-slate-50/80 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Schedule Details
            </h4>

            {selectedActivity ? (
              <div className="p-3 rounded-lg bg-white border border-brand-200 mb-3">
                <p className="text-xs font-bold text-brand-900">{selectedActivity.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedActivity.category} • {selectedActivity.duration_minutes} mins</p>
              </div>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg mb-3">
                ← Please click an activity from the left list.
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Booking Ref (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Priority entrance, booked audio guide, dress code..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedActivity || isSubmitting}
              className="flex-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs disabled:opacity-40"
            >
              {isSubmitting ? 'Adding...' : 'Confirm & Add'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
