import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center px-4 py-32 text-center md:py-48">
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-6xl">
          Financial clarity, simplified.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Track cashflow, monitor debts, and stay grounded. No clutter, just your numbers.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-emerald-500 hover:bg-emerald-400 px-8 py-6 text-base font-medium text-slate-950 transition-colors"
          >
            <Link to="/register">Get Started</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="rounded-full border border-slate-200 dark:border-white/10 px-8 py-6 text-base text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <Link to="/login">
              Log In <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── About PWA ── */}
      <section id="pwa" className="mx-auto max-w-5xl px-4 py-24 border-t border-slate-200 dark:border-slate-800/50">
        <div className="mb-16 md:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Built for speed. Works everywhere.
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            LedgerLite is a Progressive Web App. Install it directly to your home screen. No app store required.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-none">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Offline Capable</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Logs sync when you reconnect.
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-none">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Zero Footprint</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Doesn't drain storage or battery.
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-none">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Always Updated</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              You always have the latest version seamlessly.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
