import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "@/context/AuthContext"
import { Wallet, Banknote, TrendingDown } from "lucide-react"

export default function Dashboard() {
  const { user } = useContext(AuthContext)

  // Authentication guard - redirect to home if not logged in
  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Personalized Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back, <span className="text-emerald-400">{user.name}</span>
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Here's your financial overview</p>
      </div>

      {/* Bento Grid - Financial Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Bank Balance */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900/50 dark:border-slate-800 dark:shadow-none p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Wallet className="size-5 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Bank Balance</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">$0.00</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">Connected accounts</p>
        </div>

        {/* Physical Cash */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900/50 dark:border-slate-800 dark:shadow-none p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Banknote className="size-5 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Physical Cash</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">$0.00</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">Cash on hand</p>
        </div>

        {/* Upcoming Debts */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900/50 dark:border-slate-800 dark:shadow-none p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
              <TrendingDown className="size-5 text-red-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Upcoming Debts</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">$0.00</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">Pending payments</p>
        </div>
      </div>
    </div>
  )
}
