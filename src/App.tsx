import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Dashboard } from "./components/Dashboard";

function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch {
      setError(flow === "signIn" ? "Ungültige Anmeldedaten" : "Registrierung fehlgeschlagen");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-2xl md:text-3xl">💎</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Créator<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Flow</span>
            </h1>
          </div>
          <p className="text-zinc-500 text-sm md:text-base font-medium tracking-wide">
            Dein Influencer Revenue Dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/50 rounded-3xl p-6 md:p-10 shadow-2xl">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            {flow === "signIn" ? "Willkommen zurück" : "Account erstellen"}
          </h2>
          <p className="text-zinc-500 text-sm mb-6 md:mb-8">
            {flow === "signIn"
              ? "Melde dich an, um deine Einnahmen zu verwalten"
              : "Erstelle einen Account, um loszulegen"}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-2">E-Mail</label>
              <input
                name="email"
                type="email"
                required
                placeholder="deine@email.de"
                className="w-full px-4 py-3 md:py-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-2">Passwort</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 md:py-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-base"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 md:py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/30 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Laden...
                </span>
              ) : flow === "signIn" ? "Anmelden" : "Registrieren"}
            </button>
          </form>

          <div className="mt-6 md:mt-8 pt-6 border-t border-zinc-800/50">
            <button
              onClick={() => {
                setFlow(flow === "signIn" ? "signUp" : "signIn");
                setError(null);
              }}
              className="w-full text-center text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
            >
              {flow === "signIn"
                ? "Noch kein Account? Jetzt registrieren"
                : "Bereits registriert? Jetzt anmelden"}
            </button>
          </div>
        </div>

        {/* Anonymous login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => signIn("anonymous")}
            className="text-zinc-600 hover:text-zinc-400 text-sm font-medium transition-colors inline-flex items-center gap-2"
          >
            <span>Als Gast fortfahren</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 animate-pulse flex items-center justify-center shadow-xl shadow-violet-500/30">
          <span className="text-3xl md:text-4xl">💎</span>
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 blur-xl opacity-50 animate-pulse" />
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <SignIn />;
  return <Dashboard />;
}
