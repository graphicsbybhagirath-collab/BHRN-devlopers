import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { tripService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { Calendar, Image, Sparkles } from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated?: (tripId: number) => void;
}

const PRESET_COVERS = [
  { name: 'Europe Architecture', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Tropical Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Asian Skylines', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Alpine Mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Desert Oasis', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Historical Heritage', url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80' },
];

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onTripCreated,
}) => {
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Validation Error', 'Trip name is required.');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Validation Error', 'Please choose start and end dates.');
      return;
    }
    if (endDate < startDate) {
      toast.error('Validation Error', 'End date cannot be earlier than start date.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newTrip = await tripService.createTrip({
        name: name.trim(),
        description: description.trim() || undefined,
        start_date: startDate,
        end_date: endDate,
        cover_image: coverImage,
      });

      toast.success('Trip Created!', `"${newTrip.name}" is ready for building your itinerary.`);
      onClose();
      if (onTripCreated) {
        onTripCreated(newTrip.id);
      } else {
        navigate(`/trips/${newTrip.id}/builder`);
      }
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to create trip.');
      toast.error('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Plan a New Trip"
      subtitle="Design your next multi-city personalized itinerary"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Trip Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Europe Grand Tour, Japan Blossom Odyssey, Bali Chill"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              required
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us what makes this trip special..."
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm"
          />
        </div>

        {/* Cover Image Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Select Cover Theme
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESET_COVERS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setCoverImage(preset.url)}
                className={`relative rounded-xl overflow-hidden aspect-4/3 border-2 transition-all ${
                  coverImage === preset.url
                    ? 'border-brand-600 ring-2 ring-brand-500/30 scale-95'
                    : 'border-transparent hover:opacity-80'
                }`}
              >
                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                <span className="sr-only">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Trip...' : 'Create & Build Itinerary'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
