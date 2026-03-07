"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminSession, clearAdminSession, formatDobForDisplay, getAdminSession } from "../../user/auth-client";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [session] = useState<AdminSession | null>(() => getAdminSession());

  useEffect(() => {
    if (!session) {
      router.replace("/user/login");
    }
  }, [router, session]);

  const handleLogout = () => {
    clearAdminSession();
    router.replace("/user/login");
  };

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-300">Loading admin dashboard...</p>
      </main>
    );
  }

  const { admin } = session;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.22),transparent_32%),radial-gradient(circle_at_82%_0%,rgba(45,212,191,0.18),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.14),transparent_40%)]" />
      <div className="pointer-events-none absolute -left-20 top-8 h-72 w-72 rounded-full border border-cyan-100/20 bg-cyan-300/10 blur-3xl motion-safe:animate-[pulse_7s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -right-12 bottom-8 h-80 w-80 rounded-full border border-teal-100/20 bg-teal-300/10 blur-3xl motion-safe:animate-[pulse_9s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-112 w-md -translate-x-1/2 rounded-full border border-white/10 motion-safe:animate-[spin_34s_linear_infinite]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl motion-safe:animate-[fade-in_600ms_ease-out]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="text-lg font-black tracking-tight text-cyan-200 transition hover:text-cyan-100">
              Jack Computer
            </Link>
            <button
              onClick={handleLogout}
              type="button"
              className="rounded-lg border border-white/25 px-3 py-1.5 text-sm font-semibold text-white transition-all duration-300 hover:border-cyan-200 hover:text-cyan-100"
            >
              Log Out
            </button>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
            <Link
              href="/admin/dashboard"
              className="rounded-full border border-cyan-200/35 bg-cyan-200/15 px-3 py-1.5 text-cyan-100 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/all-students"
              className="rounded-full border border-white/20 px-3 py-1.5 transition hover:border-cyan-200 hover:text-cyan-100"
            >
              All Students
            </Link>
          </nav>
        </header>

        <section className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.55)] backdrop-blur-xl motion-safe:animate-[fade-in_700ms_ease-out]">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/85">Admin Control</p>
              <h1 className="bg-linear-to-r from-cyan-100 via-white to-teal-100 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
                Admin Dashboard
              </h1>
            </div>
            <span className="rounded-full border border-cyan-200/35 bg-cyan-200/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-100 motion-safe:animate-[pulse_2.5s_ease-in-out_infinite]">
              Active Session
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="group relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900/65 p-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-cyan-200/50">
              <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl transition-all duration-500 group-hover:bg-cyan-300/35" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Admin Phone Number</p>
              <p className="mt-3 text-2xl font-black text-white">{admin.phone}</p>
            </article>

            <article className="group relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900/65 p-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-teal-200/50">
              <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-teal-300/20 blur-2xl transition-all duration-500 group-hover:bg-teal-300/35" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Admin Birth Date</p>
              <p className="mt-3 text-2xl font-black text-white">{formatDobForDisplay(admin.dob)}</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
