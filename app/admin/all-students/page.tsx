"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AdminSession,
  UserProfile,
  clearAdminSession,
  formatDobForDisplay,
  getAdminSession,
  getAllStudents,
} from "../../user/auth-client";

const titleCase = (value: string) => (value ? value[0].toUpperCase() + value.slice(1) : value);

export default function AllStudentsPage() {
  const router = useRouter();
  const [session] = useState<AdminSession | null>(() => getAdminSession());
  const [students] = useState<UserProfile[]>(() => getAllStudents());

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
        <div
          className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_..."
        />
        <p className="text-sm text-slate-300">Loading students...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_14%_8%,rgba(56,189,248,0.2),transparent_33%),radial-gradient(circle_at_86%_10%,rgba(52,211,153,0.17),transparent_28%),radial-gradient(circle_at_50%_95%,rgba(96,165,250,0.15),transparent_40%)]" />
      <div className="pointer-events-none absolute -left-20 top-4 h-72 w-72 rounded-full border border-cyan-100/20 bg-cyan-300/10 blur-3xl motion-safe:animate-[pulse_7.5s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -right-12 bottom-10 h-80 w-80 rounded-full border border-emerald-100/20 bg-emerald-300/10 blur-3xl motion-safe:animate-[pulse_9.5s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-120 w-120 -translate-x-1/2 rounded-full border border-white/10 motion-safe:animate-[spin_40s_linear_infinite]" />

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
              className="rounded-full border border-white/20 px-3 py-1.5 transition hover:border-cyan-200 hover:text-cyan-100"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/all-students"
              className="rounded-full border border-cyan-200/35 bg-cyan-200/15 px-3 py-1.5 text-cyan-100 transition"
            >
              All Students
            </Link>
          </nav>
        </header>

        <section className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.55)] backdrop-blur-xl motion-safe:animate-[fade-in_700ms_ease-out]">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/85">Admin View</p>
              <h1 className="bg-linear-to-r from-cyan-100 via-white to-emerald-100 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
                All Students
              </h1>
            </div>
            <span className="rounded-full border border-emerald-200/35 bg-emerald-200/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
              Total: {students.length}
            </span>
          </div>

          {students.length === 0 ? (
            <div className="rounded-2xl border border-white/15 bg-slate-900/55 p-6 text-center text-sm text-slate-300">
              No students registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/15 bg-slate-900/45">
              <table className="min-w-190 w-full text-left text-sm">
                <thead className="bg-slate-800/65 text-xs uppercase tracking-[0.18em] text-cyan-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">DOB</th>
                    <th className="px-4 py-3 font-semibold">Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={`${student.phone}-${student.email}`}
                      className="border-t border-white/10 transition duration-300 hover:bg-cyan-200/10"
                      style={{ transitionDelay: `${index * 35}ms` }}
                    >
                      <td className="px-4 py-3 font-semibold text-white">{student.name}</td>
                      <td className="px-4 py-3 text-slate-200">{student.phone}</td>
                      <td className="px-4 py-3 text-slate-200">{student.email}</td>
                      <td className="px-4 py-3 text-slate-200">{formatDobForDisplay(student.dob)}</td>
                      <td className="px-4 py-3 text-slate-200">{titleCase(student.gender)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
