import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const CycleStarterForm = ({ onCycleStarted, hasActiveCycle = false }) => {
  const { user } = useContext(AuthContext);

  // Calculate today's date and 30 days from now
  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    start_date: formatDate(today),
    end_date: formatDate(thirtyDaysLater),
    total_income: '',
    target_savings: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasActiveCycle) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ledger/start_savings_cycle.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setFormData({
          ...formData,
          total_income: '',
          target_savings: '',
        });
        if (onCycleStarted) onCycleStarted();
      }
    } catch (err) {
      console.error('Error starting cycle:', err);
    }
  };

  return (
    <div className={`bg-white border-slate-200 shadow-sm p-6 rounded-xl mb-8 ${hasActiveCycle ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Start Savings Cycle</h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            disabled={hasActiveCycle}
            required
            className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">End Date</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            disabled={hasActiveCycle}
            required
            className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Starting Balance (₹)</label>
          <input
            type="number"
            name="total_income"
            value={formData.total_income}
            onChange={handleChange}
            placeholder="Starting Balance (₹)"
            disabled={hasActiveCycle}
            required
            className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Target Savings (₹)</label>
          <input
            type="number"
            name="target_savings"
            value={formData.target_savings}
            onChange={handleChange}
            placeholder="0.00"
            disabled={hasActiveCycle}
            required
            className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={hasActiveCycle}
          className="flex h-[42px] items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
        >
          {hasActiveCycle ? "Cycle Currently Active" : "Start Cycle"}
        </button>
      </form>
    </div>
  );
};

export default CycleStarterForm;