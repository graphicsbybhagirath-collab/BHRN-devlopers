import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Filter, Star, Clock, DollarSign, MapPin } from 'lucide-react';
import { cityService, tripService } from '../services/api';
import { Activity, City, Trip } from '../types';
import { ActivityCard } from '../components/activities/ActivityCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['All', 'Sightseeing', 'Food', 'Culture', 'Adventure', 'Nature', 'Shopping', 'Entertainment'];

export const ActivitySearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const cityParam = searchParams.get('city');

  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(
    cityParam ? parseInt(cityParam, 10) : null
  );
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxCost, setMaxCost] = useState<string>('');

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    if (selectedCityId) {
      loadActivities(selectedCityId);
    } else if (cities.length > 0) {
      setSelectedCityId(cities[0].id);
      loadActivities(cities[0].id);
    }
  }, [selectedCityId, cities, selectedCategory]);

  const loadCities = async () => {
    try {
      const data = await cityService.getCities();
      setCities(data);
      if (!selectedCityId && data.length > 0) {
        setSelectedCityId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load cities', err);
    }
  };

  const loadActivities = async (cityId: number) => {
    try {
      setLoading(true);
      const data = await cityService.getCityActivities(cityId, {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: search.trim() || undefined,
        max_cost: maxCost ? parseFloat(maxCost) : undefined,
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
    if (selectedCityId) loadActivities(selectedCityId);
  };

  const handleCityChange = (cityId: number) => {
    setSelectedCityId(cityId);
    setSearchParams({ city: cityId.toString() });
  };

  const handleAddToItinerary = async (act: Activity) => {
    if (!isAuthenticated) {
      toast.info('Sign In Required', 'Please log in to add activities to your trip itinerary.');
      navigate('/login');
      return;
    }
    // Navigate user to my trips or itinerary builder
    toast.success('Ready to schedule', `To schedule "${act.name}", select a trip from your dashboard.`);
    navigate('/trips');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Curated Experiences & Activities
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore world-class sights, cultural tours, food tastings, and outdoor adventures
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Destination Selector */}
          <div className="flex items-center gap-2 w-full md:w-72">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            <select
              value={selectedCityId || ''}
              onChange={(e) => handleCityChange(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20 font-bold"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country}
                </option>
              ))}
            </select>
          </div>

          {/* Search text */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search experiences by name or description..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Max Cost */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Max Cost:</span>
            <input
              type="number"
              placeholder="₹ Any"
              value={maxCost}
              onChange={(e) => setMaxCost(e.target.value)}
              onBlur={() => selectedCityId && loadActivities(selectedCityId)}
              className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-slate-100 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Loading curated experiences..." />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No activities found</h3>
          <p className="text-xs text-slate-500 mt-1">Try switching categories or choosing another destination.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {activities.map((act) => (
            <ActivityCard
              key={act.id}
              activity={act}
              onAddToItinerary={handleAddToItinerary}
            />
          ))}
        </div>
      )}
    </div>
  );
};
