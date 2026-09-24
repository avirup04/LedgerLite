import { useState, useEffect, useContext } from "react"
import { AuthContext } from "@/context/AuthContext"

export default function TransactionTable({ refreshTrigger }) {
  const { user } = useContext(AuthContext)
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState("today")
  const [customDate, setCustomDate] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || !user.id) return

    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ledger/get_transactions.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            filter: customDate ? "custom" : filter,
            custom_date: customDate,
          }),
        })

        const data = await response.json()
        if (data.status === "success") {
          setTransactions(data.transactions)
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user, filter, customDate, refreshTrigger])

  const handleFilterClick = (newFilter) => {
    setFilter(newFilter)
    setCustomDate("")
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-none">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transaction History</h2>

        <div className="flex w-full overflow-x-auto pb-2 md:w-auto md:overflow-visible md:pb-0 gap-2">
          {["today", "week", "month"].map((f) => (
            <button
              key={f}
              onClick={() => handleFilterClick(f)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f && !customDate
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {f === "today" ? "Today" : f === "week" ? "This Week" : "This Month"}
            </button>
          ))}
          <input
            type="date"
            value={customDate}
            onChange={(e) => {
              setCustomDate(e.target.value)
              setFilter("custom")
            }}
            className={`min-w-[140px] shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              customDate
                ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-2 pb-3 font-medium">Date</th>
              <th className="px-2 pb-3 font-medium">Particular</th>
              <th className="px-2 pb-3 font-medium">Account</th>
              <th className="px-2 pb-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-500">Loading transactions...</td>
              </tr>
            ) : transactions.length > 0 ? (
              transactions.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50 last:border-0 dark:border-slate-800/50 dark:hover:bg-slate-800/20">
                  <td className="px-2 py-3 text-sm text-slate-900 dark:text-slate-300">
                    {new Date(t.transaction_date).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-2 py-3 text-sm font-medium capitalize text-slate-900 dark:text-white">
                    {t.particular}
                  </td>
                  <td className="px-2 py-3 text-sm capitalize text-slate-600 dark:text-slate-400">
                    {t.account_type}
                  </td>
                  <td className={`px-2 py-3 text-right text-sm font-bold ${t.entry_type === "credit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {t.entry_type === "credit" ? "+" : "-"}₹{parseFloat(t.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-500 dark:text-slate-400">
                  No transactions found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}