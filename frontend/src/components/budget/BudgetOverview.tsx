import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { BudgetSummary } from '../../types';

interface BudgetOverviewProps {
  budget: BudgetSummary;
  targetBudget: number;
  onSetTargetBudget: (amount: number) => void;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  budget,
  targetBudget,
  onSetTargetBudget,
}) => {
  const [editingBudget, setEditingBudget] = useState(false);
  const [newTarget, setNewTarget] = useState(targetBudget ? targetBudget.toString() : '');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newTarget);
    if (!isNaN(val) && val >= 0) {
      onSetTargetBudget(val);
      setEditingBudget(false);
    }
  };

  const isOver = targetBudget > 0 && budget.total_estimated_cost > targetBudget;
  const difference = Math.abs(budget.total_estimated_cost - targetBudget);

  return (
    <div className="space-y-4">
      {/* Alert Banner if over budget */}
      {targetBudget > 0 && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
            isOver
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {isOver ? (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold">
              {isOver ? '⚠ Budget Alert: Over Budget' : '✓ Good News: Within Target Budget'}
            </h4>
            <p className="text-xs mt-0.5 opacity-90">
              {isOver
                ? `You are ${formatCurrency(difference)} over your target limit of ${formatCurrency(targetBudget)}.`
                : `You have ${formatCurrency(difference)} remaining from your target limit of ${formatCurrency(targetBudget)}.`}
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Cost */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Estimated Cost</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-brand-700">
            {formatCurrency(budget.total_estimated_cost)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Calculated dynamically across all stops & activities</p>
        </div>

        {/* Avg Per Day */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Per Day</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatCurrency(budget.average_per_day)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Across {budget.total_days} total journey days</p>
        </div>

        {/* Target Budget Setting */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Target Budget</span>
              <button
                onClick={() => setEditingBudget(!editingBudget)}
                className="text-xs text-brand-600 hover:text-brand-800 font-bold"
              >
                {editingBudget ? 'Cancel' : targetBudget > 0 ? 'Edit Limit' : '+ Set Limit'}
              </button>
            </div>
            {editingBudget ? (
              <form onSubmit={handleSaveBudget} className="flex gap-2 mt-1">
                <input
                  type="number"
                  placeholder="e.g. 100000"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-3 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700"
                >
                  Save
                </button>
              </form>
            ) : (
              <p className="text-2xl font-extrabold text-slate-900">
                {targetBudget > 0 ? formatCurrency(targetBudget) : 'No Limit Set'}
              </p>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Receive automated warnings if spend exceeds target</p>
        </div>
      </div>
    </div>
  );
};
