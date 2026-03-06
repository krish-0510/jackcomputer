"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthSession, clearSession, formatDobForDisplay, getSession } from "../auth-client";

const titleCase = (value: string) => (value ? value[0].toUpperCase() + value.slice(1) : value);

export default function DashboardPage() {
  const router = useRouter();
  const [session] = useState<AuthSession | null>(() => getSession());

  useEffect(() => {
    if (!session) {
      router.replace("/user/login");
    }
  }, [router, session]);

  const handleLogout = () => {
    clearSession();
    router.replace("/user/login");
  };

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-300">Loading dashboard...</p>
      </main>
    );
  }

  const { user } = session;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="text-lg font-black tracking-tight text-cyan-200">
              Jack Computer
            </Link>
            <button
              onClick={handleLogout}
              type="button"
              className="rounded-lg border border-white/25 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-cyan-200 hover:text-cyan-100"
            >
              Log Out
            </button>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
            <a
              href="#my-profile"
              className="rounded-full border border-white/20 px-3 py-1.5 transition hover:border-cyan-200 hover:text-cyan-100"
            >
              My Profile
            </a>
            <a
              href="#my-tests"
              className="rounded-full border border-white/20 px-3 py-1.5 transition hover:border-cyan-200 hover:text-cyan-100"
            >
              My Tests
            </a>
            <a
              href="#upcoming-tests"
              className="rounded-full border border-white/20 px-3 py-1.5 transition hover:border-cyan-200 hover:text-cyan-100"
            >
              Upcoming Tests
            </a>
            <a
              href="#resources"
              className="rounded-full border border-white/20 px-3 py-1.5 transition hover:border-cyan-200 hover:text-cyan-100"
            >
              Resources
            </a>
          </nav>
        </header>

        <section id="my-profile" className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-2xl font-black">My Profile</h1>
          <p className="mt-1 text-sm text-slate-300">Welcome back, {user.name}.</p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Name</dt>
              <dd className="mt-1 text-base font-semibold">{user.name}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Phone</dt>
              <dd className="mt-1 text-base font-semibold">{user.phone}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</dt>
              <dd className="mt-1 text-base font-semibold">{user.email}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Date of Birth</dt>
              <dd className="mt-1 text-base font-semibold">{formatDobForDisplay(user.dob)}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 sm:col-span-2">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Gender</dt>
              <dd className="mt-1 text-base font-semibold">{titleCase(user.gender)}</dd>
            </div>
          </dl>
        </section>

        <section id="my-tests" className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-black">My Tests</h2>
          <ul className="mt-4 space-y-3">
            <li className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-sm font-semibold text-cyan-100">CCC Practice Test</p>
              <p className="mt-1 text-sm text-slate-300">Status: In progress</p>
            </li>
            <li className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-sm font-semibold text-cyan-100">Programming Fundamentals Quiz</p>
              <p className="mt-1 text-sm text-slate-300">Status: Completed</p>
            </li>
          </ul>
        </section>

        <section id="upcoming-tests" className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-black">Upcoming Tests</h2>
          <ul className="mt-4 space-y-3">
            <li className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-sm font-semibold text-cyan-100">Graphic Designing Mock - 20 Mar 2026</p>
              <p className="mt-1 text-sm text-slate-300">Mode: Online</p>
            </li>
            <li className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-sm font-semibold text-cyan-100">CCC Final Revision Test - 27 Mar 2026</p>
              <p className="mt-1 text-sm text-slate-300">Mode: Center Lab</p>
            </li>
          </ul>
        </section>

        <section id="resources" className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-black">Resources</h2>
          <p className="mt-2 text-sm text-slate-300">
            Use the navigation above to jump to profile and test sections. Additional study material links can be
            added here next.
          </p>
        </section>
      </div>
    </main>
  );
}
