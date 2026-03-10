import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

type Source = {
  _id: Id<"incomeSources">;
  name: string;
  icon: string;
  color: string;
};

export function AddEntryModal({
  onClose,
  sources
}: {
  onClose: () => void;
  sources: Source[];
}) {
  const createEntry = useMutation(api.incomeEntries.create);
  const [sourceId, setSourceId] = useState<string>(sources[0]?._id || "");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("received");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !amount) return;

    setIsLoading(true);
    try {
      await createEntry({
        sourceId: sourceId as Id<"incomeSources">,
        amount: parseFloat(amount),
        currency,
        description: description || undefined,
        date: new Date(date).getTime(),
        status,
      });
      onClose();
    } catch (error) {
      console.error("Failed to create entry:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSource = sources.find(s => s._id === sourceId);

  if (sources.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-zinc-900 border border-zinc-800 rounded-t-3xl md:rounded-2xl w-full md:max-w-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Keine Quellen vorhanden</h2>
          <p className="text-zinc-500 mb-6">Bitte erstelle zuerst eine Einnahmequelle, bevor du Einnahmen erfassen kannst.</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-all"
          >
            Verstanden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-t-3xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 rounded-t-3xl md:rounded-t-2xl">
          <h2 className="text-xl font-bold">Neue Einnahme</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Source */}
          <div>
            <label className="block text-sm font-semibold text-zinc-400 mb-2">Einnahmequelle</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {sources.map((source) => (
                <button
                  key={source._id}
                  type="button"
                  onClick={() => setSourceId(source._id)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    sourceId === source._id
                      ? "ring-2 ring-violet-500 bg-violet-500/10"
                      : "bg-zinc-800/50 hover:bg-zinc-800"
                  }`}
                >
                  <span className="text-2xl">{source.icon}</span>
                  <span className="text-xs font-medium truncate w-full text-center">{source.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-zinc-400 mb-2">Betrag</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-lg font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-2">Währung</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="CHF">CHF</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-zinc-400 mb-2">Beschreibung (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="z.B. Kampagne für Brand XY"
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-zinc-400 mb-2">Datum</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-zinc-400 mb-2">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "received", label: "Erhalten", color: "emerald" },
                { value: "pending", label: "Ausstehend", color: "amber" },
                { value: "cancelled", label: "Storniert", color: "red" },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
                    status === s.value
                      ? s.color === "emerald"
                        ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/50"
                        : s.color === "amber"
                        ? "bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/50"
                        : "bg-red-500/20 text-red-400 ring-2 ring-red-500/50"
                      : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {selectedSource && amount && (
            <div className="flex items-center gap-4 p-4 bg-zinc-800/30 border border-zinc-700/30 rounded-xl">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: selectedSource.color + "30" }}
              >
                {selectedSource.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{selectedSource.name}</p>
                <p className="text-sm text-zinc-500">{description || new Date(date).toLocaleDateString("de-DE")}</p>
              </div>
              <p className="text-lg font-bold text-emerald-400">
                +{parseFloat(amount).toLocaleString("de-DE")} {currency}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !sourceId || !amount}
            className="w-full py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Wird gespeichert..." : "Einnahme speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}
