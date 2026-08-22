import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { itineraryService } from '../../services/api';
import { ItineraryActivity } from '../../types';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityItem: ItineraryActivity | null;
  onActivityUpdated: () => void;
}

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  onClose,
  activityItem,
  onActivityUpdated,
}) => {
  const toast = useToast();
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activityItem) {
      setStartTime(activityItem.start_time || '10:00');
      setNotes(activityItem.notes || '');
      setActivityDate(activityItem.activity_date);
    }
  }, [activityItem]);

  if (!activityItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await itineraryService.updateActivity(activityItem.id, {
        start_time: startTime || undefined,
        notes: notes.trim() || undefined,
        activity_date: activityDate || undefined,
      });

      toast.success('Activity Updated', 'Schedule adjustments saved.');
      onActivityUpdated();
      onClose();
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to update activity.');
      toast.error('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Activity Schedule"
      subtitle={activityItem.activity?.name}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Activity Date
          </label>
          <input
            type="date"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Notes & Details
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add reminder, meeting point, or booking reference..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
          />
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
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Adjustments'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
