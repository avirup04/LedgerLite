import { useState, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"

export default function SavingsHistory({ historyData = [], lifetimeSavings = 0, onRefresh }) {
  const { user } = useContext(AuthContext)

  const [editingCycle, setEditingCycle] = useState(null)
  const [editIncome, setEditIncome] = useState("")
  const [editTarget, setEditTarget] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [endingCycleId, setEndingCycleId] = useState(null)

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(num)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date)
    } catch {
      return dateString
    }
  }

  const handleEditClick = (cycle) => {
    setEditingCycle(cycle)
    setEditIncome(cycle.total_income)
    setEditTarget(cycle.target_savings)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!user || !editingCycle) return

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ledger/edit_savings_cycle.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cycle_id: editingCycle.id,
            user_id: user.id,
            new_income: editIncome,
            new_target: editTarget,
          }),
        }
      )

      const data = await response.json()
      if (data.status === "success") {
        setEditingCycle(null)
        if (onRefresh) onRefresh()
      } else {
        console.error("Failed to edit cycle:", data.message)
        alert(data.message || "Failed to edit savings cycle.")
      }
    } catch (err) {
      console.error("Error editing cycle:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEndCycle = async (cycleId) => {
    if (!user) return
    const confirmed = window.confirm("Are you sure you want to end this savings cycle now?")
    if (!confirmed) return

    setEndingCycleId(cycleId)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ledger/end_savings_cycle.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cycle_id: cycleId,
            user_id: user.id,
          }),
        }
      )

      const data = await response.json()
      if (data.status === "success") {
        if (onRefresh) onRefresh()
      } else {
        console.error("Failed to end cycle:", data.message)
        alert(data.message || "Failed to end savings cycle.")
      }
    } catch (err) {
      console.error("Error ending cycle:", err)
    } finally {
      setEndingCycleId(null)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-none mb-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Savings Cycle History
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track your past and active savings goals
        </p>
      </div>

      {/* Table */}
      {historyData.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No savings cycles recorded yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Period
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Target Savings
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Actual End Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Final Saved
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((cycle) => {
                const isDeficit =
                  cycle.status === "completed" &&
                  Number(cycle.final_saved_amount) < 0

                return (
                  <tr
                    key={cycle.id}
                    className={`border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${
                      isDeficit ? "bg-rose-50 dark:bg-rose-950/20" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5 text-sm text-slate-900 dark:text-slate-200 font-medium">
                      {formatDate(cycle.start_date)} – {formatDate(cycle.end_date)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm font-semibold text-slate-900 dark:text-slate-200">
                      {formatCurrency(cycle.target_savings)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {cycle.status === "active" ? (
                        <span className="inline-block rounded-md px-2.5 py-1 text-xs font-medium capitalize bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Active
                        </span>
                      ) : isDeficit ? (
                        <span className="inline-block rounded-md px-2.5 py-1 text-xs font-medium capitalize bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                          Deficit
                        </span>
                      ) : (
                        <span className="inline-block rounded-md px-2.5 py-1 text-xs font-medium capitalize bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                          Completed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                      {cycle.status === "completed"
                        ? formatDate(cycle.actual_end_date)
                        : "-"}
                    </td>
                    <td
                      className={`px-4 py-3.5 text-right text-sm font-semibold ${
                        isDeficit
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-slate-900 dark:text-slate-200"
                      }`}
                    >
                      {cycle.status === "completed"
                        ? formatCurrency(cycle.final_saved_amount)
                        : "-"}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {cycle.status === "active" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(cycle)}
                            className="rounded px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleEndCycle(cycle.id)}
                            disabled={endingCycleId === cycle.id}
                            className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 transition-colors disabled:opacity-50"
                          >
                            {endingCycleId === cycle.id ? "Ending..." : "End Cycle"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Lifetime Saved Footer Callout */}
      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm font-medium text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300">
        Total saved through all cycles up to today is: <strong className="font-bold">₹{Number(lifetimeSavings || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
      </div>

      {/* Edit Modal */}
      {editingCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
              Edit Active Cycle
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Starting Balance / Income (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editIncome}
                  onChange={(e) => setEditIncome(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Target Savings (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCycle(null)}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-70"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
