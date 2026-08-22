import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Plus,
  Calendar,
  DollarSign,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Globe2,
  Share2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tripService, cityService, shareService } from '../services/api';
import { Trip, City } from '../types';
import { TripCard } from '../components/trips/TripCard';
import { CreateTripModal } from '../components/trips/CreateTripModal';
import { EditTripModal } from '../components/trips/EditTripModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [featuredCities, setFeaturedCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [tripsData, citiesData] = await Promise.all([
        tripService.getTrips(),
        cityService.getCities(),
      ]);
      setTrips(tripsData);
      setFeaturedCities(citiesData.slice(0, 6));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      toast.error('Error', 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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
    } catch (err: any) {
      toast.error('Error', 'Failed to delete trip.');
    }
  };

  const handleShareTrip = async (tripId: number) => {
    try {
      const res = await shareService.createShareLink(tripId);
      const fullUrl = `${window.location.origin}/shared/${res.share_token}`;
      setShareLink(fullUrl);
      setShareModalOpen(true);
    } catch (err: any) {
      toast.error('Error', 'Failed to generate share link.');
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link Copied!', 'Public itinerary URL copied to clipboard.');
  };

  const upcomingTrip = trips[0];

  const totalSpentAcrossTrips = trips.reduce((acc, t) => acc + (t.estimated_cost || 0), 0);
  const formattedTotalCost = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(totalSpentAcrossTrips);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" label="Loading your personalized dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Traveler'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Where are you going next? Design and organize your personalized itinerary.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Plan New Trip</span>
        </button>
      </div>

      {/* Featured / Upcoming Trip Spotlight */}
      {upcomingTrip ? (
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white p-6 sm:p-8 shadow-card relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Upcoming Trip</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  {upcomingTrip.name}
                </h2>
                <p className="text-xs sm:text-sm text-brand-200/90 font-medium flex items-center gap-2 mt-1.5">
                  <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{upcomingTrip.cities_summary || 'Multi-City Adventure'}</span>
                </p>
              </div>

              {upcomingTrip.description && (
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-2xl leading-relaxed">
                  {upcomingTrip.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  <span className="font-semibold text-slate-200">
                    {upcomingTrip.start_date} – {upcomingTrip.end_date}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="font-extrabold text-white text-sm">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(upcomingTrip.estimated_cost || 0)}{' '}
                    <span className="text-xs font-normal text-slate-300">estimated</span>
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Link
                  to={`/trips/${upcomingTrip.id}/builder`}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Build & Customize Itinerary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={`/trips/${upcomingTrip.id}/view`}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                >
                  View Itinerary
                </Link>
              </div>
            </div>

            {/* Right side cover preview */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="rounded-2xl overflow-hidden aspect-4/3 border-2 border-white/10 shadow-2xl">
                <img
                  src={
                    upcomingTrip.cover_image ||
                    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={upcomingTrip.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Background subtle decoration */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title="No trips planned yet"
          description="Your next adventure starts here. Design a multi-city route, pick activities, and track your budget."
          actionLabel="+ Plan Your First Trip"
          onAction={() => setCreateModalOpen(true)}
        />
      )}

      {/* Quick Budget & Activity Highlights Grid */}
      {trips.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Total Trips Planned</span>
              <p className="text-2xl font-extrabold text-slate-900">{trips.length}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Portfolio Budget</span>
              <p className="text-2xl font-extrabold text-emerald-700">{formattedTotalCost}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-slate-400">Global Destinations</span>
              <p className="text-2xl font-extrabold text-sky-700">20+ Cities</p>
            </div>
          </div>
        </div>
      )}

      {/* My Trips Grid */}
      {trips.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">Your Multi-City Trips</h2>
            <Link
              to="/trips"
              className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
            >
              <span>View All ({trips.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onEdit={handleEditTrip}
                onDelete={handleDeleteTrip}
                onShare={handleShareTrip}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recommended Destinations */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Recommended Destinations</h2>
            <p className="text-xs text-slate-500">Popular global stops ready to add to your itineraries</p>
          </div>
          <Link
            to="/cities"
            className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredCities.map((city) => (
            <div
              key={city.id}
              onClick={() => navigate('/cities')}
              className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-xs hover:shadow-card transition-all"
            >
              <div className="relative h-28 w-full overflow-hidden bg-slate-100">
                <img
                  src={city.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80'}
                  alt={city.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <h4 className="font-bold text-xs text-white truncate">{city.name}</h4>
                  <p className="text-[10px] text-slate-200 truncate">{city.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
        subtitle="Anyone with this link can view the complete read-only schedule & budget"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-slate-700 truncate select-all">
              {shareLink}
            </span>
            <button
              onClick={handleCopyShareLink}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shrink-0 transition-colors shadow-2xs"
            >
              Copy Link
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Other GlobeTrotter members can also click <strong>"Copy Trip"</strong> on your public link to clone your itinerary into their own account!
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