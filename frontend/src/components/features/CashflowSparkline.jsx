import React from 'react';

export default function CashflowSparkline({ data }) {
  if (!data || data.length === 0) return null;

  const maxAmount = Math.max(...data.map(d => d.amount), 100);

  return (
    <div className="w-full mt-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">7-Day Spend Trend</h3>
        <span className="text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Total: ₹{data.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
        </span>
      </div>

      {/* Fixed: h-24 wrapper, explicitly stretched children */}
      <div className="flex justify-between items-end h-24 w-full gap-1 sm:gap-2 mt-4">
        {data.map((day, index) => {
          // Calculate height, ensuring a small minimum height for 0 values so the bar track is visible
          const heightPercent = day.amount > 0 ? Math.max((day.amount / maxAmount) * 100, 8) : 2;

          return (
            <div key={index} className="flex flex-col items-center justify-end flex-1 h-full gap-2 group cursor-default">
              <div className="w-full relative flex justify-center items-end flex-1">
                {/* Tooltip */}
                <div className="absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  ₹{day.amount.toFixed(0)}
                </div>
                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[14px] rounded-t-sm bg-emerald-500/40 dark:bg-emerald-500/30 group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400 transition-all duration-300"
                />
              </div>
              <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase">{day.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}