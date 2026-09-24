import { useState, useContext } from "react"
import { AuthContext } from "@/context/AuthContext"

export default function TransactionForm({ onTransactionAdded }) {
  const { user } = useContext(AuthContext)

  const [formData, setFormData] = useState({
    amount: "",
    particular: "",
    entry_type: "credit",
    account_type: "bank",
    transaction_date: new Date().toISOString().split("T")[0],
  })

  const [status, setStatus] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ledger/add_transaction.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ type: "success", message: "Transaction recorded successfully!" })
        setFormData({
          ...formData,
          amount: "",
          particular: "",
        })
        // Trigger dashboard balance update
        if (onTransactionAdded) {
          onTransactionAdded()
        }
        setTimeout(() => setStatus(null), 3000)
      } else {
        setStatus({ type: "error", message: data.message || "Failed to record transaction" })
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network error occurred. Check your connection." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div id="features" className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-none">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transaction Ledger</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Record your income and expenses.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
            <input
              type="date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Particular</label>
            <input
              type="text"
              name="particular"
              value={formData.particular}
              onChange={handleChange}
              placeholder="e.g., Salary, Groceries"
              required
              className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
              className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
            <select
              name="entry_type"
              value={formData.entry_type}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="credit">Credit (+)</option>
              <option value="debit">Debit (-)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Account</label>
            <select
              name="account_type"
              value={formData.account_type}
              onChange={handleChange}
              className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="bank">Bank</option>
              <option value="cash">Physical Cash</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-[42px] w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-70"
            >
              {isSubmitting ? "..." : "Add"}
            </button>
          </div>
        </form>

        {status && (
          <div
            className={`mt-4 rounded-lg p-3 text-sm font-medium ${status.type === "success"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  )
}
