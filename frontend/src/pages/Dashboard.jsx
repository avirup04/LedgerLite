import { useState, useEffect, useContext, useCallback } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Wallet, Banknote, TrendingDown, Loader2 } from "lucide-react"
import TransactionForm from "@/components/features/TransactionForm"
import TransactionTable from "@/components/features/TransactionTable"
import SettlementForm from "@/components/features/SettlementForm"
import SettlementTable from "@/components/features/SettlementTable"
import CycleStarterForm from "@/components/features/CycleStarterForm"
import SavingsTrackerBar from '../components/features/SavingsTrackerBar'
import SavingsHistory from '../components/features/SavingsHistory'
import CashflowSparkline from '@/components/features/CashflowSparkline'

export default function Dashboard() {
  const { user } = useContext(AuthContext)

  const [activeCycle, setActiveCycle] = useState(null)
  const [savingsHistory, setSavingsHistory] = useState([])
  const [lifetimeSavings, setLifetimeSavings] = useState(0)
  const [balances, setBalances] = useState({ live: null, projected: null })
  const [needsInit, setNeedsInit] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [sparklineData, setSparklineData] = useState([])

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

        if (data.status === "error") {
          console.error("Backend error:", data.message);
          // Do not set needsInit to true if the database just failed to connect
          return;
        }

        if (data.has_balances) {
          setBalances({ live: data.live, projected: data.projected });
          setNeedsInit(false);
        } else {
          setNeedsInit(true);
        }

        const cycleRes = await fetch(`${import.meta.env.VITE_API_URL}/ledger/get_active_cycle.php?user_id=${user.id}`)
        const cycleData = await cycleRes.json()
        if (cycleData.status === 'success') {
          setActiveCycle(cycleData.data)
        } else {
          console.error("Savings Cycle Error:", cycleData.message)
          setActiveCycle(null)
        }

        const historyRes = await fetch(`${import.meta.env.VITE_API_URL}/ledger/get_savings_history.php?user_id=${user.id}`)
        const historyData = await historyRes.json()
        if (historyData.status === 'success' && historyData.data) {
          setSavingsHistory(historyData.data.cycles || [])
          setLifetimeSavings(historyData.data.lifetime_total || 0)
        }

        const sparklineRes = await fetch(`${import.meta.env.VITE_API_URL}/ledger/get_sparkline_data.php?user_id=${user.id}`);
        const sparklineJson = await sparklineRes.json();
        if (sparklineJson.status === 'success') {
          setSparklineData(sparklineJson.data);
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

      if (data.status === "error") {
        console.error("Backend error:", data.message);
        // Do not set needsInit to true if the database just failed to connect
        return;
      }

      if (data.has_balances) {
        setBalances({ live: data.live, projected: data.projected });
        setNeedsInit(false);
      } else {
        setNeedsInit(true);
      }

      const cycleRes = await fetch(`${import.meta.env.VITE_API_URL}/ledger/get_active_cycle.php?user_id=${user.id}`)
      const cycleData = await cycleRes.json()
      if (cycleData.status === 'success') {
        setActiveCycle(cycleData.data)
      } else {
        console.error("Savings Cycle Error:", cycleData.message)
        setActiveCycle(null)
      }

      const historyRes = await fetch(`${import.meta.env.VITE_API_URL}/ledger/get_savings_history.php?user_id=${user.id}`)
      const historyData = await historyRes.json()
      if (historyData.status === 'success' && historyData.data) {
        setSavingsHistory(historyData.data.cycles || [])
        setLifetimeSavings(historyData.data.lifetime_total || 0)
      }

      const sparklineRes = await fetch(`${import.meta.env.VITE_API_URL}/ledger/get_sparkline_data.php?user_id=${user.id}`);
      const sparklineJson = await sparklineRes.json();
      if (sparklineJson.status === 'success') {
        setSparklineData(sparklineJson.data);
      }
    } catch (err) {
      console.error("Error refreshing balances:", err)
    }
  }, [user?.id])

  const triggerGlobalRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchBalances();
  };

  const getFinancialInsight = () => {
    if (!balances.live || !balances.projected) return null;
    const currentTotal = Number(balances.live.bank) + Number(balances.live.cash);
    const projectedTotal = Number(balances.projected.bank) + Number(balances.projected.cash);
    const pendingSettlements = currentTotal - projectedTotal;

    if (pendingSettlements > 0) {
      if (projectedTotal < 0) {
        return { text: `Critical: Your pending dues (₹${pendingSettlements}) exceed your available balance!`, color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-950/30", icon: "⚠️" };
      }
      if (activeCycle && activeCycle.remaining_spendable < pendingSettlements) {
         return { text: `Careful: ₹${pendingSettlements} in upcoming dues will push you over your current savings limit.`, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-950/30", icon: "⚡" };
      }
      return { text: `You have ₹${pendingSettlements} in upcoming dues safely covered by your current balance.`, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-950/30", icon: "✓" };
    }

    if (activeCycle) {
       if (activeCycle.remaining_spendable >= 0) {
          return { text: "Finances are stable. You are on track with your active savings goal.", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-950/30", icon: "🌟" };
       } else {
          return { text: "You have exceeded your planned spending budget for the current cycle.", color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-950/30", icon: "📉" };
       }
    }

    return { text: "Your balances are stable. Consider starting a new savings cycle to track your goals.", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-950/30", icon: "💡" };
  };

  const insight = getFinancialInsight();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* Main Grid Wrapper */}
      <div className="mx-auto max-w-7xl px-4 pt-6 lg:pt-10 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">

        {/* ========================================== */}
        {/* LEFT COLUMN: STICKY DASHBOARD (35% Width)  */}
        {/* ========================================== */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 mb-8 lg:mb-0 rounded-3xl bg-gradient-to-b from-emerald-100/80 via-emerald-50/40 to-white dark:from-emerald-900/40 dark:via-emerald-900/20 dark:to-slate-900/80 p-6 shadow-md ring-1 ring-emerald-200 dark:ring-emerald-600/50">

          {/* 1. Personalized Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Welcome back, <span className="text-emerald-500 dark:text-emerald-400">{user.name}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Here's your financial overview</p>
          </div>

          {/* Main Content / Loading State */}
          {isFetching ? (
            <div className="flex items-center justify-center py-8 text-slate-600 dark:text-slate-400">
              <Loader2 className="size-6 animate-spin"/>
            </div>
          ) : !balances.live ? (
            <div className="flex items-center justify-center py-8 text-slate-600 dark:text-slate-400">
              <p className="text-sm font-medium">Loading balances...</p>
            </div>
          ) : (
            <div className="space-y-5">

              {/* 2. Compact Pill Balances */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Current */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Current Balance</p>
                  <div className="flex flex-col gap-2 items-start">
                    {/* Top Row: Total */}
                    <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 shadow-sm dark:border-emerald-600/50 dark:bg-slate-800">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency((Number(balances.live.bank) + Number(balances.live.cash)))}</span>
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Total</span>
                    </div>
                    {/* Bottom Row: Bank & Cash */}
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-600 dark:bg-slate-800">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(balances.live.bank)}</span>
                        <span className="text-xs text-slate-500">Bank</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-600 dark:bg-slate-800">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(balances.live.cash)}</span>
                        <span className="text-xs text-slate-500">Cash</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Projected */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Projected Balance</p>
                  <div className="flex flex-col gap-2 items-start opacity-80">
                    {/* Top Row: Total */}
                    <div className="flex items-center gap-2 rounded-full border border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-2 dark:border-emerald-800/50 dark:bg-emerald-950/20">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency((Number(balances.projected.bank) + Number(balances.projected.cash)))}</span>
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Total</span>
                    </div>
                    {/* Bottom Row: Bank & Cash */}
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-slate-50/50 px-4 py-2 dark:border-slate-600 dark:bg-slate-800/80">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(balances.projected.bank)}</span>
                        <span className="text-xs text-slate-500">Bank</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-slate-50/50 px-4 py-2 dark:border-slate-600 dark:bg-slate-800/80">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(balances.projected.cash)}</span>
                        <span className="text-xs text-slate-500">Cash</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Financial Health Insight */}
              {insight && (
                <div className={`mt-2 flex items-start gap-3 rounded-2xl p-4 transition-colors ${insight.bg}`}>
                  <span className="text-lg leading-none">{insight.icon}</span>
                  <p className={`text-sm font-medium leading-snug ${insight.color}`}>
                    {insight.text}
                  </p>
                </div>
              )}

              {/* 4. 7-Day Sparkline */}
              {sparklineData && sparklineData.length > 0 && (
                <div className="mt-3 w-full block">
                  <CashflowSparkline data={sparklineData}/>
                </div>
              )}

              {/* 5. Active Savings Tracker Bar */}
              {activeCycle && (
                <div className="pt-2">
                  <SavingsTrackerBar cycleData={activeCycle}/>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: SCROLLING CANVAS (65% Width) */}
        {/* ========================================== */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">

          {/* ZONE 2: Features & Planning (Neutral Slate) */}
          <div id="features" className="rounded-3xl bg-gradient-to-b from-blue-50/80 to-white dark:from-blue-900/30 dark:to-slate-900/90 p-6 shadow-md ring-1 ring-blue-200 dark:ring-blue-800/60 space-y-8">

            {/* 1. Transaction Ledger */}
            <div>
              <TransactionForm currentBalances={balances.live} onTransactionAdded={triggerGlobalRefresh}/>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Future Planner & Settlements */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Future Planner & Settlements</h2>
              <SettlementForm currentBalances={balances.live} onSettlementAdded={triggerGlobalRefresh}/>
              <div className="mt-6">
                <SettlementTable onSettlementCleared={triggerGlobalRefresh} refreshTrigger={refreshTrigger}/>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 3. Savings Cycle Management */}
            <div className="space-y-6">
              <CycleStarterForm hasActiveCycle={!!activeCycle} onCycleStarted={triggerGlobalRefresh}/>
              <SavingsHistory historyData={savingsHistory} lifetimeSavings={lifetimeSavings} onRefresh={triggerGlobalRefresh}/>
            </div>

          </div>

          {/* ZONE 3: Transaction History */}
          <div id="transactions" className="rounded-3xl bg-gradient-to-b from-violet-50/80 to-white dark:from-violet-900/30 dark:to-slate-900/90 p-6 shadow-md ring-1 ring-violet-200 dark:ring-violet-800/60">
            <TransactionTable refreshTrigger={refreshTrigger}/>
          </div>

        </div>

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
                <label htmlFor="formBank" className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Bank Balance</label>
                <input id="formBank" type="number" step="any" required placeholder="0.00" value={formBank} onChange={(e) => setFormBank(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-600" />
              </div>
              <div>
                <label htmlFor="formCash" className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Cash Balance</label>
                <input id="formCash" type="number" step="any" required placeholder="0.00" value={formCash} onChange={(e) => setFormCash(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-600" />
              </div>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-full py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed" disabled={isSubmitting} type="submit">
                {isSubmitting ? <><Loader2 className="mr-2 size-4 animate-spin"/> Saving Balances…</> : "Save & Continue"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
