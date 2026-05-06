import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, LockKeyhole, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import sunnyLogo from "@assets/image_1775118121182.png";

export default function AdminLogin() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        body: JSON.stringify({ password, username }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Admin login failed");
        return;
      }

      window.location.href = "/spa-admin";
    } catch {
      setError("Admin API is not reachable. Start the API server before logging in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-10 w-auto" />
            <div className="leading-tight">
              <div className="font-display text-lg font-bold">Sunny Electronics Corp.</div>
              <div className="text-xs font-medium text-slate-500">Admin Login</div>
            </div>
          </Link>
          <Link href="/">
            <Button variant="outline" className="h-10 gap-2 bg-white">
              <ArrowLeft className="h-4 w-4" />
              Back to site
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1fr_420px] lg:items-start">
        <section>
          <div className="mb-4 inline-flex items-center gap-2 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            <ShieldCheck className="h-4 w-4" />
            Sunny Internal Only
          </div>
          <h1 className="mb-4 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">
            Admin access for quote logs, sourcing cost, margin, and private operations.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            This area is for Sunny/SunnyKR staff only. Vendor-facing SPA views must stay separate
            from admin-only files such as sourcing cost, quoted unit price, and sales profit margin logs.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              "RFQ quote tracking",
              "Sourcing cost reference",
              "Admin-only templates",
            ].map((item) => (
              <div key={item} className="border border-slate-200 bg-white p-4 shadow-sm">
                <LockKeyhole className="mb-3 h-5 w-5 text-rose-700" />
                <div className="font-semibold">{item}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-primary/10 text-primary">
              <LogIn className="h-7 w-7" />
            </div>
            <h2 className="font-display text-2xl font-bold">Admin Login</h2>
            <p className="mt-2 text-sm text-slate-600">
              Use credentials configured on the API server.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                data-testid="input-admin-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                data-testid="input-admin-password"
              />
            </div>

            {error && (
              <div className="border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full gap-2"
              disabled={loading || !username || !password}
              data-testid="button-admin-login"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Checking..." : "Log In"}
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}
