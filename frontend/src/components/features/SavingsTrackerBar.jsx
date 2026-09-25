import React from 'react';

const SavingsTrackerBar = ({ cycleData }) => {
  if (!cycleData || !cycleData.cycle) return null;

  // 1. Extract Data
  const total_income = Number(cycleData.cycle.total_income) || 0;
  const target_savings = Number(cycleData.cycle.target_savings) || 0;
  const total_spent = Number(cycleData.total_spent) || 0;

  // 2. Calculate Variables
  const spendableLimit = total_income - target_savings;
  const currentSavings = total_income - total_spent;
  const overspentAmount = total_spent - total_income;
  const remaining_spendable = spendableLimit - total_spent;

  // 3. Determine State & UI
  let redWidth = 0;
  let greenWidth = 0;
  let message = null;

  if (total_spent <= spendableLimit) {
    // State 1 (Healthy)
    redWidth = total_income > 0 ? (target_savings / total_income) * 100 : 0;
    greenWidth = total_income > 0 ? (remaining_spendable / total_income) * 100 : 0;
    message = (
      <p className="text-slate-600 dark:text-slate-300 mb-4">
        You can only spend <strong>₹{remaining_spendable}</strong> more to hit your <strong>₹{target_savings}</strong> savings goal.
      </p>
    );
  } else if (total_spent <= total_income) {
    // State 2 (Warning)
    redWidth = total_income > 0 ? (currentSavings / total_income) * 100 : 0;
    greenWidth = 0;
    message = (
      <p className="text-amber-600 dark:text-amber-400 font-medium mb-4">
        You crossed your target limit, but your savings still stand at <strong>₹{currentSavings}</strong>.
      </p>
    );
  } else {
    // State 3 (Deficit)
    redWidth = 100;
    greenWidth = 0;
    message = (
      <p className="text-rose-600 dark:text-rose-400 font-medium mb-4">
        You are using over your starting balance by <strong>₹{overspentAmount}</strong> and have negative savings.
      </p>
    );
  }

  return (
    <div className="bg-white border border-slate-200 shadow-sm dark:bg-slate-900/50 dark:border-slate-800 p-6 rounded-xl mb-8">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Active Savings Goal</h3>
      {message}

      <div className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden mt-5">
        {/* The Untouchable Savings / Deficit Bar (Red) */}
        <div
          className="bg-rose-500 h-full transition-all duration-500"
          style={{ width: `${redWidth}%` }}
        />

        {/* The Spendable Limit Bar (Green) */}
        <div
          className="bg-emerald-500 h-full transition-all duration-500"
          style={{ width: `${greenWidth}%` }}
        />
      </div>
    </div>
  );
};

export default SavingsTrackerBar;
