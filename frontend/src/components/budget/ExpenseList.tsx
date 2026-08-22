import React from 'react';
import { Trash2, DollarSign, Calendar, Tag, Plus } from 'lucide-react';
import { Expense } from '../../types';
import { format, parseISO } from 'date-fns';
import { Badge } from '../common/Badge';

interface ExpenseListProps {
  expenses: Expense[];
  onAddExpense: () => void;
  onDeleteExpense: (id: number) => void;
}

const CATEGORY_STYLES: Record<string, 'primary' | 'indigo' | 'warning' | 'danger' | 'secondary'> = {
  Transport: 'primary',
  Accommodation: 'indigo',
  Activities: 'secondary',
  Meals: 'warning',
  Miscellaneous: 'secondary',
};

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Custom Logged Expenses</h3>
          <p className="text-xs text-slate-500">Transportation, hotels, dining, and other trip costs</p>
        </div>

        <button
          onClick={onAddExpense}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-2xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Expense</span>
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-8 rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <p className="text-xs font-semibold text-slate-600">No custom expenses logged</p>
          <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Add transport, hotel, or meal bookings to track budget accuracy</p>
          <button
            onClick={onAddExpense}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs"
          >
            Log First Expense
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {expenses.map((exp) => {
            const dateDisplay = exp.expense_date
              ? (() => {
                  try {
                    return format(parseISO(exp.expense_date), 'd MMM yyyy');
                  } catch {
                    return exp.expense_date;
                  }
                })()
              : 'Flexible Date';

            return (
              <div
                key={exp.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <DollarSign className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{exp.category}</span>
                      <Badge variant={CATEGORY_STYLES[exp.category] || 'secondary'} size="sm">
                        {exp.category}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {exp.description || 'No description provided'} • <span className="font-mono">{dateDisplay}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-extrabold text-sm text-slate-900">
                    {formatCurrency(exp.amount)}
                  </span>
                  <button
                    onClick={() => onDeleteExpense(exp.id)}
                    title="Delete Expense"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
