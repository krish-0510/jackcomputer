"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { getSession, loginUser } from "../auth-client";

interface LoginForm {
  phone: string;
  dob: string;
}

const INITIAL_FORM: LoginForm = {
  phone: "",
  dob: "",
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getSession()) {
      router.replace("/user/dashboard");
    }
  }, [router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      loginUser(form);
      router.replace("/user/dashboard");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to log in";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">User Access</p>
          <h1 className="text-3xl font-black">Log In</h1>
          <p className="text-sm text-slate-300">Use your phone and date of birth to access your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm text-slate-200">Phone (E.164)</span>
            <input
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="+911234567890"
              className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-sm outline-hidden transition focus:border-cyan-200"
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-slate-200">Date of Birth</span>
            <input
              type="date"
              value={form.dob}
              onChange={(event) => setForm((prev) => ({ ...prev, dob: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-sm outline-hidden transition focus:border-cyan-200"
              required
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-rose-300/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
          <Link href="/" className="hover:text-white">
            Back to Home
          </Link>
          <Link href="/user/register" className="font-semibold text-cyan-200 hover:text-cyan-100">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
