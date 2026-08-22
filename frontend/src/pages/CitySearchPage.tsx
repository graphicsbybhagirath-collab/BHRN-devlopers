import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Filter, Star, Plus } from 'lucide-react';
import { cityService, tripService, stopService } from '../services/api';
import { City, Trip } from '../types';
import { CityCard } from '../components/cities/CityCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';

export const CitySearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [costFilter, setCostFilter] = useState('All');

  // Add to Trip Modal
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [stopStartDate, setStopStartDate] = useState('');
  const [stopEndDate, setStopEndDate] = useState('');
  const [addToTripModalOpen, setAddToTripModalOpen] = useState(false);
  const [isAddingStop, setIsAddingStop] = useState(false);

  useEffect(() => {
    loadCities();
  }, [regionFilter, costFilter]);

  const loadCities = async () => {
    try {
      setLoading(true);
      const data = await cityService.getCities({
        search: search.trim() || undefined,
        region: regionFilter !== 'All' ? regionFilter : undefined,
        min_cost: costFilter !== 'All' ? parseInt(costFilter, 10) : undefined,
        max_cost: costFilter !== 'All' ? parseInt(costFilter, 10) : undefined,
      });
      setCities(data);
    } catch (err) {
      console.error('Failed to load cities', err);
      toast.error('Error', 'Failed to fetch destinations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCities();
  };

  const handleOpenAddToTrip = async (city: City) => {
    if (!isAuthenticated) {
      toast.info('Sign In Required', 'Please log in to add this destination to your trip.');
      navigate('/login');
      return;
    }

    setSelectedCity(city);
    try {
      const trips = await tripService.getTrips();
      setUserTrips(trips);
      if (trips.length > 0) {
        setSelectedTripId(trips[0].id);
        setStopStartDate(trips[0].start_date);
        setStopEndDate(trips[0].end_date);
      }
      setAddToTripModalOpen(true);
    } catch (err) {
      toast.error('Error', 'Failed to retrieve your trips.');
    }
  };

  const handleConfirmAddToTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity || !selectedTripId) return;

    try {
      setIsAddingStop(true);
      await stopService.addStop(selectedTripId, {
        city_id: selectedCity.id,
        start_date: stopStartDate,
        end_date: stopEndDate,
      });

      toast.success('Added to Trip!', `${selectedCity.name} has been added to your itinerary.`);
      setAddToTripModalOpen(false);
      navigate(`/trips/${selectedTripId}/builder`);
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to add stop.');
      toast.error('Error', msg);
    } finally {
      setIsAddingStop(false);
    }
  };

  const regions = ['All', 'Europe', 'Asia', 'Middle East', 'North America', 'Oceania'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Destinations & Cities
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Discover top worldwide travel hubs, compare popularity, cost index, and activities
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city, country or region..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        {/* Region Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Region:</span>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20 font-medium"
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Cost Index Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Cost:</span>
          <select
            value={costFilter}
            onChange={(e) => setCostFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20 font-medium"
          >
            <option value="All">All Cost Levels</option>
            <option value="1">$ (Budget)</option>
            <option value="2">$$ (Moderate)</option>
            <option value="3">$$$ (Standard)</option>
            <option value="4">$$$$ (Upscale)</option>
            <option value="5">$$$$$ (Luxury)</option>
          </select>
        </div>
      </div>

      {/* City Catalog Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Searching global destinations..." />
        </div>
      ) : cities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No destinations found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your filters or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              onAddToTrip={handleOpenAddToTrip}
              onExplore={() => navigate(`/activities?city=${city.id}`)}
            />
          ))}
        </div>
      )}

      {/* Add To Trip Modal */}
      <Modal
        isOpen={addToTripModalOpen}
        onClose={() => setAddToTripModalOpen(false)}
        title={`Add ${selectedCity?.name} to Trip`}
        subtitle="Select which of your trips you'd like to add this destination to"
        maxWidth="md"
      >
        {userTrips.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-xs text-slate-600">You don't have any trips created yet.</p>
            <button
              onClick={() => {
                setAddToTripModalOpen(false);
                navigate('/trips/new');
              }}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-xs"
            >
              + Create a New Trip First
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirmAddToTrip} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Select Trip *
              </label>
              <select
                value={selectedTripId || ''}
                onChange={(e) => {
                  const tId = parseInt(e.target.value, 10);
                  setSelectedTripId(tId);
                  const found = userTrips.find((t) => t.id === tId);
                  if (found) {
                    setStopStartDate(found.start_date);
                    setStopEndDate(found.end_date);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20"
              >
                {userTrips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.start_date} – {t.end_date})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Arrival Date
                </label>
                <input
                  type="date"
                  required
                  value={stopStartDate}
                  onChange={(e) => setStopStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Departure Date
                </label>
                <input
                  type="date"
                  required
                  min={stopStartDate}
                  value={stopEndDate}
                  onChange={(e) => setStopEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddToTripModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAddingStop}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {isAddingStop ? 'Adding...' : 'Confirm & Open Builder'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
