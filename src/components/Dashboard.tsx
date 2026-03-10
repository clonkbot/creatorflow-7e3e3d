import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { AddSourceModal } from "./AddSourceModal";
import { AddEntryModal } from "./AddEntryModal";
import { Id } from "../../convex/_generated/dataModel";

type IncomeSource = {
  _id: Id<"incomeSources">;
  _creationTime: number;
  userId: Id<"users">;
  name: string;
  type: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: number;
};

type IncomeEntry = {
  _id: Id<"incomeEntries">;
  _creationTime: number;
  userId: Id<"users">;
  sourceId: Id<"incomeSources">;
  amount: number;
  currency: string;
  description?: string;
  date: number;
  status: string;
  createdAt: number;
};

type MonthlyBreakdownItem = {
  month: string;
  sources: Record<string, number>;
  total: number;
};

const formatCurrency = (amount: number, currency = "EUR") => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (timestamp: number) => {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
};

export function Dashboard() {
  const { signOut } = useAuthActions();
  const sources = useQuery(api.incomeSources.list) as IncomeSource[] | undefined;
  const entries = useQuery(api.incomeEntries.list) as IncomeEntry[] | undefined;
  const stats = useQuery(api.incomeEntries.getStats);
  const monthlyBreakdown = useQuery(api.incomeEntries.getMonthlyBreakdown) as MonthlyBreakdownItem[] | undefined;

  const [showAddSource, setShowAddSource] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const deleteEntry = useMutation(api.incomeEntries.remove);
  const updateEntry = useMutation(api.incomeEntries.update);

  const isLoading = sources === undefined || entries === undefined || stats === undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const sourceMap = new Map(sources.map((s: IncomeSource) => [s._id, s]));
  const recentEntries = entries.slice(0, 10);

  // Calculate source totals for this month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const sourceStats = sources.map((source: IncomeSource) => {
    const sourceEntries = entries.filter((e: IncomeEntry) =>
      e.sourceId === source._id &&
      e.status === "received" &&
      new Date(e.date).getMonth() === currentMonth &&
      new Date(e.date).getFullYear() === currentYear
    );
    const total = sourceEntries.reduce((sum: number, e: IncomeEntry) => sum + e.amount, 0);
    return { ...source, monthlyTotal: total };
  }).sort((a: { monthlyTotal: number }, b: { monthlyTotal: number }) => b.monthlyTotal - a.monthlyTotal);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="text-xl">💎</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              Créator<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Flow</span>
            </h1>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setShowAddSource(true)}
              className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm font-semibold transition-all hover:border-zinc-600"
            >
              + Quelle
            </button>
            <button
              onClick={() => setShowAddEntry(true)}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/20"
            >
              + Einnahme
            </button>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-zinc-500 hover:text-white text-sm font-medium transition-colors"
            >
              Abmelden
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-800/50 bg-zinc-900/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-2">
              <button
                onClick={() => { setShowAddSource(true); setMobileMenuOpen(false); }}
                className="w-full px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl text-sm font-semibold transition-all text-left"
              >
                + Neue Quelle hinzufügen
              </button>
              <button
                onClick={() => { setShowAddEntry(true); setMobileMenuOpen(false); }}
                className="w-full px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-sm font-semibold transition-all text-left"
              >
                + Neue Einnahme hinzufügen
              </button>
              <button
                onClick={() => signOut()}
                className="w-full px-4 py-3 text-zinc-500 hover:text-white text-sm font-medium transition-colors text-left"
              >
                Abmelden
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="relative flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <StatCard
            label="Diesen Monat"
            value={formatCurrency(stats?.thisMonthTotal || 0)}
            trend={stats?.percentChange || 0}
            icon="📈"
          />
          <StatCard
            label="Letzten Monat"
            value={formatCurrency(stats?.lastMonthTotal || 0)}
            icon="📅"
          />
          <StatCard
            label="Ausstehend"
            value={formatCurrency(stats?.pendingTotal || 0)}
            icon="⏳"
            highlight
          />
          <StatCard
            label="Gesamt"
            value={formatCurrency(stats?.totalAllTime || 0)}
            icon="💰"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Recent Transactions */}
            <section className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between">
                <h2 className="text-base md:text-lg font-bold">Letzte Einnahmen</h2>
                <span className="text-xs md:text-sm text-zinc-500">{entries.length} Einträge</span>
              </div>

              {recentEntries.length === 0 ? (
                <div className="p-8 md:p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
                    <span className="text-3xl">📝</span>
                  </div>
                  <p className="text-zinc-500 mb-4">Noch keine Einnahmen erfasst</p>
                  <button
                    onClick={() => setShowAddEntry(true)}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-semibold transition-all"
                  >
                    Erste Einnahme hinzufügen
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {recentEntries.map((entry: IncomeEntry) => {
                    const source = sourceMap.get(entry.sourceId);
                    return (
                      <div key={entry._id} className="px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 hover:bg-zinc-800/20 transition-colors group">
                        <div
                          className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0"
                          style={{ backgroundColor: (source?.color || "#71717a") + "20" }}
                        >
                          {source?.icon || "💵"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm md:text-base truncate">{source?.name || "Unbekannt"}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                              entry.status === "received"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : entry.status === "pending"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-red-500/20 text-red-400"
                            }`}>
                              {entry.status === "received" ? "Erhalten" : entry.status === "pending" ? "Ausstehend" : "Storniert"}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm text-zinc-500 truncate">
                            {entry.description || formatDate(entry.date)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-sm md:text-base text-emerald-400">
                            +{formatCurrency(entry.amount, entry.currency)}
                          </p>
                          <p className="text-xs text-zinc-600 hidden md:block">{formatDate(entry.date)}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {entry.status === "pending" && (
                            <button
                              onClick={() => updateEntry({ id: entry._id, status: "received" })}
                              className="p-1.5 md:p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                              title="Als erhalten markieren"
                            >
                              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => deleteEntry({ id: entry._id })}
                            className="p-1.5 md:p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Löschen"
                          >
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Monthly Breakdown */}
            {monthlyBreakdown && monthlyBreakdown.length > 0 && (
              <section className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden">
                <div className="px-4 md:px-6 py-4 border-b border-zinc-800/50">
                  <h2 className="text-base md:text-lg font-bold">Monatliche Übersicht</h2>
                </div>
                <div className="p-4 md:p-6 space-y-4">
                  {monthlyBreakdown.map((month: MonthlyBreakdownItem) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-400">
                          {new Date(month.month + "-01").toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
                        </span>
                        <span className="font-bold">{formatCurrency(month.total)}</span>
                      </div>
                      <div className="h-3 bg-zinc-800/50 rounded-full overflow-hidden flex">
                        {Object.entries(month.sources).map(([sourceName, amount]: [string, number], i: number) => {
                          const source = sources.find((s: IncomeSource) => s.name === sourceName);
                          const percentage = (amount / month.total) * 100;
                          return (
                            <div
                              key={i}
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: source?.color || "#8b5cf6",
                              }}
                              title={`${sourceName}: ${formatCurrency(amount)}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Income Sources */}
            <section className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between">
                <h2 className="text-base md:text-lg font-bold">Einnahmequellen</h2>
                <button
                  onClick={() => setShowAddSource(true)}
                  className="text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors"
                >
                  + Neu
                </button>
              </div>

              {sources.length === 0 ? (
                <div className="p-6 md:p-8 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <p className="text-zinc-500 text-sm mb-3">Keine Quellen vorhanden</p>
                  <button
                    onClick={() => setShowAddSource(true)}
                    className="text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors"
                  >
                    Quelle hinzufügen
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {sourceStats.map((source: IncomeSource & { monthlyTotal: number }) => (
                    <SourceItem key={source._id} source={source} />
                  ))}
                </div>
              )}
            </section>

            {/* Quick Tips */}
            <section className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20 rounded-2xl p-4 md:p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💡</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">Tipp des Tages</h3>
                  <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                    Erfasse deine Einnahmen zeitnah, um einen genauen Überblick über deine Finanzen zu behalten.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-zinc-800/50 bg-zinc-900/20 backdrop-blur-xl mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 text-center">
          <p className="text-zinc-600 text-xs">
            Requested by @web-user · Built by @clonkbot
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showAddSource && <AddSourceModal onClose={() => setShowAddSource(false)} />}
      {showAddEntry && <AddEntryModal onClose={() => setShowAddEntry(false)} sources={sources} />}
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  icon,
  highlight
}: {
  label: string;
  value: string;
  trend?: number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 md:p-6 rounded-2xl border transition-all ${
      highlight
        ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20"
        : "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700/50"
    }`}>
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <span className="text-xl md:text-2xl">{icon}</span>
        {trend !== undefined && trend !== 0 && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend > 0
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          }`}>
            {trend > 0 ? "+" : ""}{trend.toFixed(0)}%
          </span>
        )}
      </div>
      <p className="text-xl md:text-2xl font-black mb-0.5 md:mb-1 truncate">{value}</p>
      <p className="text-xs md:text-sm text-zinc-500 truncate">{label}</p>
    </div>
  );
}

function SourceItem({
  source
}: {
  source: {
    _id: Id<"incomeSources">;
    name: string;
    icon: string;
    color: string;
    type: string;
    monthlyTotal: number;
  };
}) {
  const deleteSource = useMutation(api.incomeSources.remove);

  return (
    <div className="px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 hover:bg-zinc-800/20 transition-colors group">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: source.color + "30" }}
      >
        {source.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{source.name}</p>
        <p className="text-xs text-zinc-500 capitalize">{source.type}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-sm text-emerald-400">
          {formatCurrency(source.monthlyTotal)}
        </p>
        <p className="text-xs text-zinc-600">diesen Monat</p>
      </div>
      <button
        onClick={() => deleteSource({ id: source._id })}
        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all"
        title="Löschen"
      >
        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
