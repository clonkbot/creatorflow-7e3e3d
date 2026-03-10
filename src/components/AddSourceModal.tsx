import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

const ICONS = ["📺", "📸", "🎵", "🎮", "💼", "🛍️", "🎁", "💳", "🎬", "📱", "🖥️", "🎤"];
const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#14b8a6", "#06b6d4",
  "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#d946ef", "#ec4899", "#f43f5e"
];
const TYPES = [
  { value: "sponsorship", label: "Sponsoring" },
  { value: "adsense", label: "AdSense / Werbung" },
  { value: "affiliate", label: "Affiliate" },
  { value: "merchandise", label: "Merchandise" },
  { value: "subscription", label: "Abo / Mitgliedschaft" },
  { value: "other", label: "Sonstige" },
];

export function AddSourceModal({ onClose }: { onClose: () => void }) {
  const createSource = useMutation(api.incomeSources.create);
  const [name, setName] = useState("");
  const [type, setType] = useState("sponsorship");
  const [icon, setIcon] = useState("📺");
  const [color, setColor] = useState("#8b5cf6");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await createSource({ name, type, icon, color });
      onClose();
    } catch (error) {
      console.error("Failed to create source:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-t-3xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 rounded-t-3xl md:rounded-t-2xl">
          <h2 className="text-xl font-bold">Neue Einnahmequelle</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: color + "30" }}
            >
              {icon}
            </div>
            <div>
              <p className="font-bold">{name || "Name der Quelle"}</p>
              <p className="text-sm text-zinc-500">{TYPES.find(t => t.value === type)?.label}</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-zinc-400 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. YouTube, Instagram, TikTok..."
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-zinc-400 mb-2">Art der Einnahme</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-semibold text-zinc-400 mb-2">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-full aspect-square rounded-xl text-xl flex items-center justify-center transition-all ${
                    icon === i
                      ? "bg-violet-600 ring-2 ring-violet-400"
                      : "bg-zinc-800/50 hover:bg-zinc-800"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-semibold text-zinc-400 mb-2">Farbe</label>
            <div className="grid grid-cols-8 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-full aspect-square rounded-lg transition-all ${
                    color === c ? "ring-2 ring-white scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-violet-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Wird erstellt..." : "Quelle erstellen"}
          </button>
        </form>
      </div>
    </div>
  );
}
