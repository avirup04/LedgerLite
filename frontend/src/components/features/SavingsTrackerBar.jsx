import React from 'react';

const SavingsTrackerBar = ({ cycleData }) => {
  const { cycle, total_spent, remaining_spendable } = cycleData;
  const savingsWidth = (cycle.target_savings / cycle.total_income) * 100;
  const greenWidth = Math.max(0, (remaining_spendable / cycle.total_income) * 100);

  return (
    <div className="bg-white border-slate-200 shadow-sm p-6 rounded-xl mb-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Active Savings Goal</h3>
      <p className="text-slate-600 mb-4">
        You can only spend <strong>₹{remaining_spendable}</strong> more to hit your <strong>₹{cycle.target_savings}</strong> savings goal.
      </p>

      <div className="w-full h-8 bg-slate-100 rounded-full flex overflow-hidden mt-5">
        {/* The Untouchable Savings (Red) */}
        <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${savingsWidth}%` }} title={`Target: ₹${cycle.target_savings}`}></div>

        {/* The Spendable Limit (Green) */}
        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${greenWidth}%` }} title={`Remaining: ₹${remaining_spendable}`}></div>
      </div>
    </div>
  );
};

export default SavingsTrackerBar;
