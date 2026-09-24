import { useState, useEffect, useContext, useCallback } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Wallet, Banknote, TrendingDown, Loader2 } from "lucide-react"
import TransactionForm from "@/components/features/TransactionForm"
import TransactionTable from "@/components/features/TransactionTable"
import SettlementForm from "@/components/features/SettlementForm"
import SettlementTable from "@/components/features/SettlementTable"

export default function Dashboard() {
  const { user } = useContext(AuthContext)

  const [balances, setBalances] = useState({ live: null, projected: null })
  const [needsInit, setNeedsInit] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const [formCash, setFormCash] = useState("")
  const [formBank, setFormBank] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch initial balances
  useEffect(() => {
    if (!user?.id) return

    const fetchBalances = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ledger/get_balances.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        })

        const data = await response.json()

        if (data.has_balances) {
          setBalances({ live: data.live, projected: data.projected })
        } else {
          setNeedsInit(true)
        }
      } catch (err) {
        console.error("Error fetching balances:", err)
      } finally {
        setIsFetching(false)
      }
    }

    fetchBalances()
  }, [user?.id])

  // Authentication guard - redirect to home if not logged in
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Handle modal opening balance submission
  const handleBalanceSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ledger/update_balances.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          cash_opening: formCash,
          bank_opening: formBank,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setBalances({ cash: formCash, bank: formBank, live: { cash: formCash, bank: formBank }, projected: { cash: formCash, bank: formBank } })
        setNeedsInit(false)
        setFormCash("")
        setFormBank("")
      }
    } catch (err) {
      console.error("Error updating balances:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(num)
  }

  // Expose fetchBalances for callback from TransactionForm
  const fetchBalances = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ledger/get_balances.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      })

      const data = await response.json()

      if (data.has_balances) {
        setBalances({ live: data.live, projected: data.projected })
      }
    } catch (err) {
      console.error("Error refreshing balances:", err)
    }
  }, [user?.id])

  const triggerGlobalRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchBalances();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Personalized Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back, <span className="text-emerald-400">{user.name}</span>
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Here's your financial overview</p>
      </div>

      {/* Main Content / Loading State */}
      {isFetching ? (
        <div className="flex items-center justify-center py-16 text-slate-600 dark:text-slate-400">
          <p className="text-lg font-medium">Loading your ledger...</p>
        </div>
      ) : !balances.live ? (
        <div className="flex items-center justify-center py-16 text-slate-600 dark:text-slate-400">
          <p className="text-lg font-medium">Loading balances...</p>
        </div>
      ) : (
        <>
          {/* Current Balance Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Current Balance</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Total Balance */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900/50 dark:border-slate-800 dark:shadow-none p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Wallet className="size-5 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Balance</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency((Number(balances.live.bank) + Number(balances.live.cash)))}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">Combined wealth</p>
              </div>

              {/* Total Bank Balance */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900/50 dark:border-slate-800 dark:shadow-none p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Wallet className="size-5 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Bank Balance</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(balances.live.bank)}
                </p>
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
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(balances.live.cash)}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">Cash on hand</p>
              </div>
            </div>
          </div>

          {/* Projected Balance Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Projected Balance</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">After pending settlements clear.</p>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Projected Total */}
              <div className="rounded-xl border-dashed border-2 border-slate-200 bg-slate-50/50 dark:bg-slate-950/50 dark:border-slate-700 opacity-90 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Wallet className="size-5 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Projected Total</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency((Number(balances.projected.bank) + Number(balances.projected.cash)))}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">Future wealth</p>
              </div>

              {/* Projected Bank */}
              <div className="rounded-xl border-dashed border-2 border-slate-200 bg-slate-50/50 dark:bg-slate-950/50 dark:border-slate-700 opacity-90 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Wallet className="size-5 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Projected Bank</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(balances.projected.bank)}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">Future bank</p>
              </div>

              {/* Projected Cash */}
              <div className="rounded-xl border-dashed border-2 border-slate-200 bg-slate-50/50 dark:bg-slate-950/50 dark:border-slate-700 opacity-90 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Banknote className="size-5 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Projected Cash</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(balances.projected.cash)}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">Future cash</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Features Section - Grouped */}
      <div id="features" className="mt-12 space-y-12">
        {/* Transaction Ledger Section */}
        <div>
          <TransactionForm onTransactionAdded={triggerGlobalRefresh} />
        </div>

        {/* Future Planner & Settlements Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Future Planner & Settlements</h2>
          <SettlementForm onSettlementAdded={triggerGlobalRefresh} />
          <div className="mt-8">
            <SettlementTable refreshTrigger={refreshTrigger} onSettlementCleared={triggerGlobalRefresh} />
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div id="transactions" className="mt-12">
        <TransactionTable refreshTrigger={refreshTrigger} />
      </div>

      {/* Opening Balances Modal */}
      {needsInit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/80">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Set Opening Balances</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Please enter your initial bank and cash balances to set up your ledger.
              </p>
            </div>

            <form onSubmit={handleBalanceSubmit} className="space-y-4">
              <div>
                <label htmlFor="formBank" className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Bank Balance
                </label>
                <input
                  id="formBank"
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={formBank}
                  onChange={(e) => setFormBank(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-600"
                />
              </div>

              <div>
                <label htmlFor="formCash" className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cash Balance
                </label>
                <input
                  id="formCash"
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={formCash}
                  onChange={(e) => setFormCash(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-600"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-full py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving Balances…
                  </>
                ) : (
                  "Save & Continue"
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
