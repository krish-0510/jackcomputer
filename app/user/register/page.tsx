"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Gender, getSession, registerUser } from "../auth-client";

interface RegisterForm {
  name: string;
  phone: string;
  email: string;
  dob: string;
  gender: Gender;
}

const INITIAL_FORM: RegisterForm = {
  name: "",
  phone: "",
  email: "",
  dob: "",
  gender: "male",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
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
      registerUser(form);
      router.replace("/user/dashboard");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to register";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6">
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">New User</p>
          <h1 className="text-3xl font-black">Register</h1>
          <p className="text-sm text-slate-300">Create your account, then continue directly to your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm text-slate-200">Full Name</span>
            <input
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-sm outline-hidden transition focus:border-cyan-200"
              required
            />
          </label>

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
            <span className="text-sm text-slate-200">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
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

          <label className="block space-y-1">
            <span className="text-sm text-slate-200">Gender</span>
            <select
              value={form.gender}
              onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value as Gender }))}
              className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-sm outline-hidden transition focus:border-cyan-200"
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>

          {error ? (
            <p className="rounded-xl border border-rose-300/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
          <Link href="/" className="hover:text-white">
            Back to Home
          </Link>
          <Link href="/user/login" className="font-semibold text-cyan-200 hover:text-cyan-100">
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}
