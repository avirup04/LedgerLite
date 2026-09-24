import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"

export default function SettlementTable({ refreshTrigger, onSettlementCleared }) {
  const { user } = useContext(AuthContext)

  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(false)
  const [clearingId, setClearingId] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch settlements
  useEffect(() => {
    if (!user) return

    const fetchSettlements = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/ledger/get_settlements.php`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.id,
            }),
          }
        )

        const data = await response.json()

        if (response.ok && Array.isArray(data.settlements)) {
          setSettlements(data.settlements)
        } else {
          setSettlements([])
        }
      } catch (err) {
        console.error("Error fetching settlements:", err)
        setSettlements([])
      } finally {
        setLoading(false)
      }
    }

    fetchSettlements()
  }, [user, refreshTrigger])

  const handleClearSettlement = async (settlementId) => {
    if (!user) return

    setClearingId(settlementId)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ledger/clear_settlement.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            settlement_id: settlementId,
            user_id: user.id,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        // Remove from local state
        setSettlements((prev) => prev.filter((s) => s.id !== settlementId))
        // Trigger parent refresh
        if (onSettlementCleared) {
          onSettlementCleared()
        }
      } else {
        console.error("Failed to clear settlement:", data.message)
      }
    } catch (err) {
      console.error("Error clearing settlement:", err)
    } finally {
      setClearingId(null)
    }
  }

  const handleEditClick = (settlement) => {
    setEditingItem(settlement)
  }

  const handleEditFormChange = (e) => {
    setEditingItem({ ...editingItem, [e.target.name]: e.target.value })
  }

  const handleSaveChanges = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ledger/edit_settlement.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editingItem, user_id: user.id }),
        }
      )

      const data = await response.json()

      if (data.status === "success") {
        // Update local state
        setSettlements((prev) =>
          prev.map((s) => (s.id === editingItem.id ? editingItem : s))
        )
        setEditingItem(null)
        // Trigger parent refresh
        if (onSettlementCleared) {
          onSettlementCleared()
        }
      } else {
        console.error("Failed to update settlement:", data.message)
      }
    } catch (error) {
      console.error("Edit failed:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(num)
  }

  const formatDate = (dateString) => {
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-6 shadow-sm dark:shadow-none">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Pending Settlements
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upcoming dues and receivables to clear
          </p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Loading settlements...
            </p>
          </div>
        ) : settlements.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No pending settlements found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Target Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Particular
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Account
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((settlement) => (
                  <tr
                    key={settlement.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 text-sm text-slate-900 dark:text-slate-200">
                      {formatDate(settlement.target_date)}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-900 dark:text-slate-200">
                      {settlement.particular}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                      <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 capitalize">
                        {settlement.account_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                      <span
                        className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium capitalize ${
                          settlement.entry_type === "credit"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {settlement.entry_type === "credit" ? "Receivable" : "Due"}
                      </span>
                    </td>
                    <td className={`px-4 py-3.5 text-right text-sm font-semibold ${
                      settlement.entry_type === "credit"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {formatCurrency(settlement.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(settlement)}
                          className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleClearSettlement(settlement.id)}
                          disabled={clearingId === settlement.id}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            settlement.entry_type === "debit"
                              ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                          } disabled:opacity-50`}
                        >
                          {clearingId === settlement.id
                            ? "..."
                            : settlement.entry_type === "debit"
                            ? "Pay"
                            : "Collect"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
              Edit Settlement
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Particular
                </label>
                <input
                  type="text"
                  name="particular"
                  value={editingItem?.particular || ""}
                  onChange={handleEditFormChange}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0"
                  value={editingItem?.amount || ""}
                  onChange={handleEditFormChange}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Type
                </label>
                <select
                  name="entry_type"
                  value={editingItem?.entry_type || "debit"}
                  onChange={handleEditFormChange}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="debit">Upcoming Due</option>
                  <option value="credit">Receivable</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Account
                </label>
                <select
                  name="account_type"
                  value={editingItem?.account_type || "bank"}
                  onChange={handleEditFormChange}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Target Date
                </label>
                <input
                  type="date"
                  name="target_date"
                  value={editingItem?.target_date || ""}
                  onChange={handleEditFormChange}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
