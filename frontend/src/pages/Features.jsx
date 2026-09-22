import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "@/context/AuthContext"
import { BookOpen, TrendingDown, DownloadCloud } from "lucide-react"

export default function Features() {
  const { user } = useContext(AuthContext)

  if (!user) {
    return <Navigate to="/" replace />
  }

  const firstName = user.name ? user.name.split(" ")[0] : "User"

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Hi {firstName}, here are your tools.
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Your active modules and upcoming capabilities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-none">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <BookOpen className="size-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ledger Entry</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Log transactions across bank and physical cash quickly and accurately.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-none">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <TrendingDown className="size-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Debt Tracker</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Monitor upcoming debts and payment schedules in a centralized view.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-none">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <DownloadCloud className="size-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Export Data</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Extract your financial records as CSV or PDF for external auditing.
          </p>
        </div>
      </div>
    </div>
  )
}
