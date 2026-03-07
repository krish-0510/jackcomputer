"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { getAdminSession, getSession, loginAdmin, loginUser } from "../auth-client";

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
  const adminPhone = (process.env.NEXT_PUBLIC_ADMIN_PHONE_NUMBER ?? "").trim();

  useEffect(() => {
    if (getAdminSession()) {
      router.replace("/admin/dashboard");
      return;
    }

    if (getSession()) {
      router.replace("/user/dashboard");
    }
  }, [router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const currentPhone = form.phone.trim();

      if (adminPhone && currentPhone === adminPhone) {
        loginAdmin(form);
        router.replace("/admin/dashboard");
        return;
      }

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
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-slate-100 sm:px-6">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_12%_20%,rgba(56,189,248,0.24),transparent_34%),radial-gradient(circle_at_84%_16%,rgba(167,139,250,0.2),transparent_32%),radial-gradient(circle_at_50%_85%,rgba(16,185,129,0.17),transparent_42%)]" />
      <div className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full border border-cyan-200/20 bg-cyan-300/10 blur-3xl motion-safe:animate-[pulse_7.5s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-72 w-72 rounded-full border border-violet-200/20 bg-violet-300/10 blur-3xl motion-safe:animate-[pulse_8.5s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-128 w-lg -translate-x-1/2 rounded-full border border-white/10 motion-safe:animate-[spin_42s_linear_infinite]" />

      <div className="relative mx-auto w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-6 shadow-[0_25px_80px_rgba(8,47,73,0.42)] backdrop-blur-xl sm:p-7">
        <div className="mb-6 space-y-2 text-center motion-safe:animate-[fade-in_600ms_ease-out]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Secure Access</p>
          <h1 className="bg-linear-to-r from-cyan-100 via-white to-emerald-100 bg-clip-text text-3xl font-black text-transparent">
            Student + Admin Login
          </h1>
          <p className="text-sm text-slate-300">
            Sign in with phone number and date of birth. Admin credentials redirect to the admin dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm text-slate-200">Phone Number</span>
            <input
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="+911234567890 or admin phone"
              className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-3.5 py-2.5 text-sm outline-hidden transition duration-300 focus:border-cyan-200 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.17)]"
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm text-slate-200">Date of Birth</span>
            <input
              type="date"
              value={form.dob}
              onChange={(event) => setForm((prev) => ({ ...prev, dob: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-3.5 py-2.5 text-sm outline-hidden transition duration-300 focus:border-cyan-200 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.17)]"
              required
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-rose-300/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-cyan-300 via-emerald-300 to-cyan-200 px-4 py-2.5 text-sm font-black text-slate-950 transition duration-500 hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/55 to-transparent transition duration-700 group-hover:translate-x-full" />
            <span className="relative">{isSubmitting ? "Logging in..." : "Continue"}</span>
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
          <Link href="/" className="transition hover:text-white">
            Back to Home
          </Link>
          <Link href="/user/register" className="font-semibold text-cyan-200 transition hover:text-cyan-100">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
