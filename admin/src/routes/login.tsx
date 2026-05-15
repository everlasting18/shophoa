import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import { useAuthStore, type Role } from "@/stores/auth";
import pb from "@/lib/pb";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Try superuser first (owner)
      const auth = await pb.collection("_superusers").authWithPassword(email, password);
      login(auth.token, email, "owner");
      navigate({ to: "/" });
    } catch {
      try {
        // Fall back to users collection (staff/owner by role field)
        const auth = await pb.collection("users").authWithPassword(email, password);
        const role = (auth.record.role as Role) === "owner" ? "owner" : "staff";
        login(auth.token, email, role);
        navigate({ to: "/" });
      } catch {
        setError("Email hoặc mật khẩu không đúng.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-rose-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-400 to-rose-700 shadow-2xl shadow-rose-500/30 mb-5 text-3xl select-none">
            🌸
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Tiệm hoa nhà tình</h1>
          <p className="text-sm text-stone-500 mt-1">Đăng nhập để quản lý cửa hàng</p>
        </div>

        {/* Card */}
        <div className="bg-stone-900/80 backdrop-blur border border-stone-800/80 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-stone-800/80 border border-stone-700/80 rounded-xl text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-rose-500/70 focus:ring-2 focus:ring-rose-500/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 bg-stone-800/80 border border-stone-700/80 rounded-xl text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-rose-500/70 focus:ring-2 focus:ring-rose-500/10 transition-all"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-sm font-semibold transition-all disabled:opacity-60 shadow-lg shadow-rose-500/20 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
