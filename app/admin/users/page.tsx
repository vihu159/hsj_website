"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = { username: string };

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [bootstrap, setBootstrap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  function load() {
    setLoading(true);
    setError("");
    fetch("/api/admin/users")
      .then((r) => {
        if (r.status === 401) {
          router.replace("/admin");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.error && !data.bootstrap) {
          setError(data.error);
          setUsers([]);
        } else {
          setUsers(data.users ?? []);
          setBootstrap(!!data.bootstrap);
        }
      })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }

  useEffect(() => load(), []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newUsername.trim() || !newPassword.trim()) {
      setError("Username and password are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername.trim(), password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to add user");
        return;
      }
      setNewUsername("");
      setNewPassword("");
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(username: string) {
    if (!confirm(`Remove user "${username}"? They will no longer be able to sign in.`)) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/users?username=${encodeURIComponent(username)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to remove user");
        return;
      }
      load();
    } catch {
      setError("Failed to remove user");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-brand-cream/70">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/admin/dashboard" className="text-sm text-brand-gold hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-6 font-serif text-2xl font-semibold text-brand-gold">
        Admin users
      </h1>
      <p className="mt-2 text-sm text-brand-cream/70">
        Manage who can sign in to the backend. Passwords are stored securely (hashed) and cannot be viewed. When creating a user, save the password somewhere safe — you won’t be able to see it again.
      </p>

      {bootstrap && (
        <div className="mt-4 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          No users yet. Create the first admin user below. After that, login will be required if <code className="rounded bg-black/30 px-1">REQUIRE_ADMIN_AUTH=true</code> is set.
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}

      <section className="mt-8 rounded-xl border border-brand-charcoal/40 bg-brand-black/40 p-6">
        <h2 className="font-medium text-brand-ivory">Add user</h2>
        <form onSubmit={handleAdd} className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="new-username" className="block text-xs text-brand-cream/70">Username</label>
            <input
              id="new-username"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="mt-1 w-48 rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
              placeholder="e.g. admin"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-xs text-brand-cream/70">Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-48 rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-brand-gold px-4 py-2 text-sm font-medium text-brand-black hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Adding…" : "Add user"}
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-xl border border-brand-charcoal/40 bg-brand-black/40 p-6">
        <h2 className="font-medium text-brand-ivory">Users</h2>
        <p className="mt-1 text-xs text-brand-cream/60">Usernames that can sign in. Passwords are not shown (stored securely).</p>
        {users.length === 0 ? (
          <p className="mt-4 text-sm text-brand-cream/60">No users yet. Add one above.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {users.map((u) => (
              <li
                key={u.username}
                className="flex items-center justify-between rounded border border-brand-charcoal/40 bg-brand-black/50 px-4 py-3"
              >
                <span className="font-medium text-brand-ivory">{u.username}</span>
                <span className="text-xs text-brand-cream/50">Password: ••••••••</span>
                <button
                  type="button"
                  onClick={() => handleRemove(u.username)}
                  className="text-sm text-red-400 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs text-brand-cream/50">
        To require login for the admin area, set <code className="rounded bg-black/30 px-1">REQUIRE_ADMIN_AUTH=true</code> in your environment (e.g. <code className="rounded bg-black/30 px-1">.env.local</code>).
      </p>
    </div>
  );
}
