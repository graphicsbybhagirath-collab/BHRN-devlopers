import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, Calendar, DollarSign, Compass, ArrowUpDown } from 'lucide-react';
import { tripService, shareService } from '../services/api';
import { Trip } from '../types';
import { TripCard } from '../components/trips/TripCard';
import { CreateTripModal } from '../components/trips/CreateTripModal';
import { EditTripModal } from '../components/trips/EditTripModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const MyTripsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'name'>('date');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTrips();
      setTrips(data);
    } catch (err) {
      console.error('Failed to load trips', err);
      toast.error('Error', 'Failed to load your trips.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setEditModalOpen(true);
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (!window.confirm('Are you sure you want to delete this trip and its itinerary?')) return;
    try {
      await tripService.deleteTrip(tripId);
      toast.success('Trip Deleted', 'Trip removed successfully.');
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err) {
      toast.error('Error', 'Failed to delete trip.');
    }
  };

  const handleShareTrip = async (tripId: number) => {
    try {
      const res = await shareService.createShareLink(tripId);
      setShareLink(`${window.location.origin}/shared/${res.share_token}`);
      setShareModalOpen(true);
    } catch (err) {
      toast.error('Error', 'Failed to generate share link.');
    }
  };

  const filteredTrips = trips
    .filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
        (t.cities_summary && t.cities_summary.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      if (sortBy === 'cost') return (b.estimated_cost || 0) - (a.estimated_cost || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" label="Loading all trips..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Planned Trips
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your past, current, and upcoming multi-city itineraries
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Plan New Trip</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by trip name or city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20 font-medium"
          >
            <option value="date">Trip Date (Newest first)</option>
            <option value="cost">Estimated Budget (Highest)</option>
            <option value="name">Alphabetical (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <EmptyState
          icon={Compass}
          title={search ? 'No trips match your search' : 'No trips yet'}
          description={
            search
              ? 'Try changing your search query or clear the filter.'
              : 'Create your first multi-city trip to start planning day-wise itineraries and estimated costs.'
          }
          actionLabel="+ Plan Your First Trip"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onEdit={handleEditTrip}
              onDelete={handleDeleteTrip}
              onShare={handleShareTrip}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateTripModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTripCreated={(tripId) => navigate(`/trips/${tripId}/builder`)}
      />

      <EditTripModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        trip={selectedTrip}
        onTripUpdated={(updated) => {
          setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        }}
      />

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
