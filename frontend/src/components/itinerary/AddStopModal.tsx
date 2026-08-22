import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { cityService, stopService } from '../../services/api';
import { City, Trip } from '../../types';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { MapPin, Search } from 'lucide-react';

interface AddStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onStopAdded: () => void;
}

export const AddStopModal: React.FC<AddStopModalProps> = ({
  isOpen,
  onClose,
  trip,
  onStopAdded,
}) => {
  const toast = useToast();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(trip.start_date);
  const [endDate, setEndDate] = useState(trip.end_date);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCities();
      // Calculate suggested dates based on existing stops
      if (trip.stops && trip.stops.length > 0) {
        const lastStop = trip.stops[trip.stops.length - 1];
        setStartDate(lastStop.end_date);
        setEndDate(trip.end_date);
      } else {
        setStartDate(trip.start_date);
        setEndDate(trip.end_date);
      }
    }
  }, [isOpen, trip]);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const data = await cityService.getCities();
      setCities(data);
      if (data.length > 0) {
        setSelectedCityId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load cities', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityId) {
      toast.error('Validation Error', 'Please select a destination city.');
      return;
    }
    if (endDate < startDate) {
      toast.error('Validation Error', 'End date cannot be earlier than start date.');
      return;
    }

    try {
      setIsSubmitting(true);
      await stopService.addStop(trip.id, {
        city_id: selectedCityId,
        start_date: startDate,
        end_date: endDate,
      });

      const cityName = cities.find((c) => c.id === selectedCityId)?.name || 'Destination';
      toast.success('Stop Added', `Added ${cityName} to ${trip.name}.`);
      onStopAdded();
      onClose();
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to add city stop.');
      toast.error('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Destination Stop"
      subtitle={`Extend your itinerary for "${trip.name}"`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search City */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Search City / Country
          </label>
          <div className="relative mb-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to filter e.g. Paris, Tokyo, Rome, Goa..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="h-44 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading cities...</div>
            ) : filteredCities.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No cities found.</div>
            ) : (
              filteredCities.map((city) => {
                const isSelected = selectedCityId === city.id;
                return (
                  <div
                    key={city.id}
                    onClick={() => setSelectedCityId(city.id)}
                    className={`flex items-center justify-between p-2.5 cursor-pointer text-xs transition-colors ${
                      isSelected ? 'bg-brand-50 text-brand-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={city.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=100&q=80'}
                        alt={city.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div>
                        <span className="font-bold">{city.name}</span>
                        <span className="text-slate-400 ml-1.5 font-normal">{city.country}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 ring-4 ring-brand-100" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Date assignment for this stop */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Stop Start Date
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Stop End Date
            </label>
            <input
              type="date"
              required
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedCityId || isSubmitting}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Destination Stop'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
