import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { budgetService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: number;
  onExpenseAdded: () => void;
}

const CATEGORIES = ['Transport', 'Accommodation', 'Activities', 'Meals', 'Miscellaneous'];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  tripId,
  onExpenseAdded,
}) => {
  const toast = useToast();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Validation Error', 'Please enter a valid amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      await budgetService.addExpense(tripId, {
        category,
        amount: parsedAmount,
        expense_date: expenseDate || undefined,
        description: description.trim() || undefined,
      });

      toast.success('Expense Logged', `Added ₹${parsedAmount.toLocaleString('en-IN')} to ${category}.`);
      onExpenseAdded();
      onClose();
      // Reset form
      setAmount('');
      setDescription('');
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to add expense.');
      toast.error('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Custom Expense"
      subtitle="Log transportation, accommodation, or food costs"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Expense Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Amount (INR ₹) *
          </label>
          <input
            type="number"
            required
            step="any"
            min="1"
            placeholder="e.g. 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Expense Date (Optional)
          </label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. High-speed rail ticket Paris to Amsterdam..."
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
            {isSubmitting ? 'Logging...' : 'Save Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
