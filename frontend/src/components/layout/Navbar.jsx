import { useState, useEffect, useCallback, useContext } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { AuthContext } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Wallet, Sun, Moon, Menu, X, ArrowRight, LogOut } from "lucide-react"

function getInitialTheme() {
  if (typeof window === "undefined") return true
  const saved = localStorage.getItem("theme")
  if (saved) return saved === "dark"
  // Default to dark mode for this app (it's designed dark-first)
  return true
}

export default function Navbar() {
  const [isDark, setIsDark] = useState(getInitialTheme)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)

  // Dynamic navigation links based on auth state
  const navLinks = !user
    ? [
        { label: "Home", to: "/", isAnchor: false },
        { label: "About PWA", to: "/#pwa", isAnchor: true },
      ]
    : [
        { label: "Dashboard", to: "/dashboard", isAnchor: false },
        { label: "Features", to: "/dashboard#features", isAnchor: true },
        { label: "Transactions", to: "#transactions", isAnchor: true },
      ]

  const handleLogout = useCallback(() => {
    logout()
    setIsMobileMenuOpen(false)
    navigate("/")
  }, [logout, navigate])

  const handleScrollToTop = (e) => {
    setIsMobileMenuOpen(false)
    if (location.pathname === "/dashboard") {
      if (e && e.preventDefault) {
        e.preventDefault()
      }
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Apply theme on mount and changes
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      root.classList.remove("light")
      root.style.colorScheme = "dark"
    } else {
      root.classList.remove("dark")
      root.classList.add("light")
      root.style.colorScheme = "light"
    }
  }, [isDark])

  // Listen for system theme changes when no explicit preference is set
  useEffect(() => {
    if (localStorage.getItem("theme")) return
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e) => {
      setIsDark(e.matches)
    }
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const toggleDarkMode = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      localStorage.setItem("theme", next ? "dark" : "light")
      return next
    })
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/75 border-b border-slate-200 dark:bg-slate-950/75 dark:border-white/10">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label="LedgerLite home"
          onClick={handleScrollToTop}
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-inner shadow-emerald-400/30">
            <Wallet className="size-5 text-slate-950" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-slate-900 dark:text-white">Ledger</span>
            <span className="text-emerald-400">Lite</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Button
              key={link.label}
              asChild
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5 rounded-lg px-3 transition-colors"
            >
              {link.isAnchor ? (
                <a href={link.to}>{link.label}</a>
              ) : (
                <Link
                  to={link.to}
                  onClick={link.label === "Dashboard" ? handleScrollToTop : undefined}
                >
                  {link.label}
                </Link>
              )}
            </Button>
          ))}
        </div>

        {/* Desktop controls */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5 rounded-lg px-3"
              onClick={handleLogout}
            >
              <LogOut className="mr-1.5 size-3.5" />
              Logout
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5 rounded-lg px-3"
              >
                <Link to="/login">Log In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-full px-4 transition-colors"
              >
                <Link to="/register">
                  Get Started <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={toggleDarkMode}
            className="ml-1 size-9 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={toggleDarkMode}
            className="size-9 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="size-9 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-out border-t border-slate-200 dark:border-white/5",
          isMobileMenuOpen ? "max-h-[60vh] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Button
                key={link.label}
                asChild
                variant="ghost"
                size="lg"
                className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/5 rounded-lg px-4"
              >
                {link.isAnchor ? (
                  <a href={link.to} onClick={closeMobileMenu}>
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.to}
                    onClick={link.label === "Dashboard" ? handleScrollToTop : closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                )}
              </Button>
            ))}
            <div className="my-1 h-px bg-slate-200 dark:bg-white/10" />
            {user ? (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/5 rounded-lg px-4"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 size-4" />
                Logout
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/5 rounded-lg px-4"
                >
                  <Link to="/login" onClick={closeMobileMenu}>
                    Log In
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="w-full justify-between bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium rounded-lg px-4 transition-colors"
                >
                  <Link to="/register" onClick={closeMobileMenu}>
                    Get Started <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
