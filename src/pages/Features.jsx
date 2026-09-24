import { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Features = () => {
  const { user } = useContext(AuthContext);

  // Authentication guard
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Form state management
  const [formData, setFormData] = useState({
    amount: '',
    particular: '',
    entry_type: 'credit',
    account_type: 'bank',
    transaction_date: getTodayDate()
  });

  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    try {
      const payload = {
        user_id: user.id,
        ...formData
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/ledger/add_transaction.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        // Reset only amount and particular for fast consecutive entries
        setFormData(prev => ({
          ...prev,
          amount: '',
          particular: ''
        }));

        // Clear success message after 3 seconds
        setTimeout(() => {
          setStatus('');
        }, 3000);
      } else {
        setStatus(data.message || 'Failed to record transaction');
      }
    } catch (error) {
      setStatus('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Hi {user.name.split(' ')[0]}, here are your tools
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your finances with ease.
        </p>
      </div>

      {/* Transaction Ledger Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 dark:bg-slate-900/50 dark:border-slate-800 dark:shadow-none mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Transaction Ledger
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mt-4">
          {/* Date Input */}
          <div className="md:col-span-2">
            <label htmlFor="transaction_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Date
            </label>
            <input
              type="date"
              id="transaction_date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white px-3 py-2"
            />
          </div>

          {/* Particular Input */}
          <div className="md:col-span-3">
            <label htmlFor="particular" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Particular
            </label>
            <input
              type="text"
              id="particular"
              name="particular"
              value={formData.particular}
              onChange={handleChange}
              placeholder="e.g., Salary, Groceries"
              required
              className="w-full rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white px-3 py-2"
            />
          </div>

          {/* Amount Input */}
          <div className="md:col-span-2">
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="₹0.00"
              required
              className="w-full rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white px-3 py-2"
            />
          </div>

          {/* Entry Type Select */}
          <div className="md:col-span-2">
            <label htmlFor="entry_type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Type
            </label>
            <select
              id="entry_type"
              name="entry_type"
              value={formData.entry_type}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white px-3 py-2"
            >
              <option value="credit">Credit (+)</option>
              <option value="debit">Debit (-)</option>
            </select>
          </div>

          {/* Account Type Select */}
          <div className="md:col-span-2">
            <label htmlFor="account_type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Account
            </label>
            <select
              id="account_type"
              name="account_type"
              value={formData.account_type}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-slate-950 dark:border-slate-700 dark:text-white px-3 py-2"
            >
              <option value="bank">Bank</option>
              <option value="physical_cash">Physical Cash</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '...' : '+'}
            </button>
          </div>
        </form>

        {/* Feedback UI */}
        {status && (
          <div className={`mt-6 px-4 py-3 rounded-lg ${
            status === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300'
          }`}>
            {status === 'success' ? 'Transaction recorded successfully' : status}
          </div>
        )}
      </div>
    </div>
  );
};

export default Features;
