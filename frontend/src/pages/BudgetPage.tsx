import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, DollarSign, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { tripService, budgetService } from '../services/api';
import { Trip, BudgetSummary } from '../types';
import { BudgetOverview } from '../components/budget/BudgetOverview';
import { BudgetCharts } from '../components/budget/BudgetCharts';
import { ExpenseList } from '../components/budget/ExpenseList';
import { AddExpenseModal } from '../components/budget/AddExpenseModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export const BudgetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [targetBudget, setTargetBudget] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadBudgetData(parseInt(id, 10), targetBudget);
    }
  }, [id, targetBudget]);

  const loadBudgetData = async (tripId: number, target: number) => {
    try {
      setLoading(true);
      const [tripData, budgetData] = await Promise.all([
        tripService.getTrip(tripId),
        budgetService.getBudget(tripId, target > 0 ? target : undefined),
      ]);
      setTrip(tripData);
      setBudget(budgetData);
    } catch (err) {
      console.error('Failed to load budget data', err);
      toast.error('Error', 'Failed to load budget breakdown.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (id) {
      await loadBudgetData(parseInt(id, 10), targetBudget);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!window.confirm('Delete this logged expense?')) return;
    try {
      await budgetService.deleteExpense(expenseId);
      toast.success('Expense Deleted', 'Budget updated.');
      await handleRefresh();
    } catch (err) {
      toast.error('Error', 'Failed to delete expense.');
    }
  };

  if (loading || !trip || !budget) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="Calculating real-time trip budget & analytics..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            to={`/trips/${trip.id}/builder`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Itinerary Builder</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Trip Budget & Cost Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {trip.name} • {trip.cities_summary} • {trip.start_date} to {trip.end_date}
          </p>
        </div>

        <button
          onClick={() => setAddExpenseOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Custom Expense</span>
        </button>
      </div>

      {/* KPI Overview and Alert Banner */}
      <BudgetOverview
        budget={budget}
        targetBudget={targetBudget}
        onSetTargetBudget={(val) => setTargetBudget(val)}
      />

      {/* Charts (Pie & Daily Bar) */}
      <BudgetCharts budget={budget} />

      {/* Custom Logged Expenses List */}
      <ExpenseList
        expenses={budget.expenses || []}
        onAddExpense={() => setAddExpenseOpen(true)}
        onDeleteExpense={handleDeleteExpense}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        tripId={trip.id}
        onExpenseAdded={handleRefresh}
      />
    </div>
  );
};
