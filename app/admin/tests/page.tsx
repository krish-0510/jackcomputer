"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
    AdminSession,
    Test,
    clearAdminSession,
    createTest,
    deleteTest,
    getAdminSession,
    getTests,
} from "../../user/auth-client";

export default function AdminTestsPage() {
    const router = useRouter();
    const [session, setSession] = useState<AdminSession | null>(null);
    const [tests, setTests] = useState<Test[]>([]);
    const [isClient, setIsClient] = useState(false);

    // Filters State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "active" | "completed">("all");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTest, setNewTest] = useState<Omit<Test, 'id'>>({
        name: "",
        date: "",
        duration: 60,
        status: "upcoming",
        centers: [],
        subjects: [],
        hasFee: false,
        fee: 0,
        mode: "offline",
        isRegistrationOpen: false,
    });

    useEffect(() => {
        setIsClient(true);
        const sess = getAdminSession();
        if (!sess) {
            router.replace("/user/login");
        } else {
            setSession(sess);
            setTests(getTests());
        }
    }, [router]);

    const handleLogout = () => {
        clearAdminSession();
        router.replace("/user/login");
    };

    const handleCreateTest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTest.name || !newTest.date || newTest.centers.length === 0 || newTest.subjects.length === 0) return;

        createTest(newTest);
        setTests(getTests());
        setIsModalOpen(false);
        setNewTest({
            name: "",
            date: "",
            duration: 60,
            status: "upcoming",
            centers: [],
            subjects: [],
            hasFee: false,
            fee: 0,
            mode: "offline",
            isRegistrationOpen: false,
        });
    };

    const handleDeleteTest = (id: string, testName: string) => {
        if (window.confirm(`Are you sure you want to delete the test "${testName}"?`)) {
            deleteTest(id);
            setTests(getTests());
        }
    };

    // Derived state for filtering
    const filteredTests = tests.filter((test) => {
        const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.subjects?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "all" || test.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (!isClient || !session) {
        return (
            <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
                <p className="text-sm text-slate-300">Loading tests...</p>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
            {/* Background Effects */}
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_14%_8%,rgba(56,189,248,0.2),transparent_33%),radial-gradient(circle_at_86%_10%,rgba(168,85,247,0.17),transparent_28%),radial-gradient(circle_at_50%_95%,rgba(96,165,250,0.15),transparent_40%)]" />
            <div className="pointer-events-none absolute -left-20 top-4 h-72 w-72 rounded-full border border-cyan-100/20 bg-cyan-300/10 blur-3xl motion-safe:animate-[pulse_7.5s_ease-in-out_infinite]" />
            <div className="pointer-events-none absolute -right-12 bottom-10 h-80 w-80 rounded-full border border-purple-100/20 bg-purple-300/10 blur-3xl motion-safe:animate-[pulse_9.5s_ease-in-out_infinite]" />

            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
                {/* Header */}
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
                            className="rounded-full border border-white/20 px-3 py-1.5 transition hover:border-cyan-200 hover:text-cyan-100"
                        >
                            All Students
                        </Link>
                        <Link
                            href="/admin/tests"
                            className="rounded-full border border-purple-200/35 bg-purple-200/15 px-3 py-1.5 text-purple-100 transition"
                        >
                            Tests
                        </Link>
                    </nav>
                </header>

                {/* Action Bar & Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between motion-safe:animate-[fade-in_700ms_ease-out]">
                    <div className="flex flex-1 items-center gap-3">
                        <input
                            type="text"
                            placeholder="Search tests by name or subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-400 outline-none backdrop-blur-md transition hover:border-white/20 focus:border-cyan-300 focus:bg-white/10"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white outline-none backdrop-blur-md transition hover:border-white/20 focus:border-cyan-300 focus:bg-slate-800"
                        >
                            <option value="all">All Statuses</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="shrink-0 rounded-xl bg-cyan-400/20 border border-cyan-300/30 px-5 py-2 text-sm font-bold text-cyan-50 transition-all hover:bg-cyan-400/30 hover:border-cyan-300/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                    >
                        + Create Test
                    </button>
                </div>

                {/* Tests Table */}
                <section className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.55)] backdrop-blur-xl motion-safe:animate-[fade-in_800ms_ease-out]">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-purple-200/85">Evaluation</p>
                            <h1 className="bg-linear-to-r from-cyan-100 via-white to-purple-100 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
                                Test Management
                            </h1>
                        </div>
                        <span className="rounded-full border border-purple-200/35 bg-purple-200/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-purple-100">
                            Total Tests: {filteredTests.length}
                        </span>
                    </div>

                    {filteredTests.length === 0 ? (
                        <div className="rounded-2xl border border-white/15 bg-slate-900/55 p-10 text-center text-sm text-slate-300">
                            No tests found. Click the button above to create one.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredTests.map((test) => (
                                <div
                                    key={test.id}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-purple-300/40 hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)]"
                                >
                                    <div className="mb-4">
                                        <div className="flex items-start justify-between">
                                            <h3 className="line-clamp-1 text-lg font-bold text-white">{test.name}</h3>
                                            <span
                                                className={`ml-2 shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${test.status === "upcoming"
                                                    ? "border-blue-300/30 bg-blue-400/10 text-blue-200"
                                                    : test.status === "active"
                                                        ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                                                        : "border-slate-500/30 bg-slate-500/10 text-slate-300"
                                                    }`}
                                            >
                                                {test.status}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm font-medium text-purple-200/80">{test.subjects?.join(', ') || 'N/A'}</p>
                                    </div>

                                    <div className="mb-6 grid grid-cols-2 gap-y-2 text-xs text-slate-300">
                                        <div>
                                            <span className="block text-slate-500">Date</span>
                                            <strong className="font-semibold text-slate-200">{test.date}</strong>
                                        </div>
                                        <div>
                                            <span className="block text-slate-500">Duration</span>
                                            <strong className="font-semibold text-slate-200">{test.duration} mins</strong>
                                        </div>
                                        <div>
                                            <span className="block text-slate-500">Mode</span>
                                            <strong className="font-semibold capitalize text-slate-200">{test.mode}</strong>
                                        </div>
                                        <div>
                                            <span className="block text-slate-500">Fee</span>
                                            <strong className="font-semibold text-slate-200">{test.hasFee ? `₹${test.fee}` : 'Free'}</strong>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 border-t border-white/10 pt-4">
                                        <Link
                                            href={`/admin/tests/${test.id}`}
                                            className="flex-1 rounded-lg bg-white/5 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                                        >
                                            View Details
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteTest(test.id, test.name)}
                                            className="rounded-lg bg-red-500/10 fill-red-400 px-3 py-2 text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                                            title="Delete Test"
                                        >
                                            Del
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Create Test Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm motion-safe:animate-[fade-in_200ms_ease-out]">
                        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-slate-900 p-6 shadow-2xl">
                            <h2 className="mb-6 text-xl font-bold text-white">Create New Test</h2>
                            <form onSubmit={handleCreateTest} className="flex flex-col gap-4">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-300">Test Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTest.name}
                                        onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                                        placeholder="e.g. Midterm Advanced JS"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-300">Subjects (comma separated)</label>
                                        <input
                                            type="text"
                                            required
                                            value={newTest.subjects.join(", ")}
                                            onChange={(e) => setNewTest({ ...newTest, subjects: e.target.value.split(",").map(v => v.trim()).filter(Boolean) })}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                                            placeholder="e.g. CCC, Programming"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-300">Centers (comma separated)</label>
                                        <input
                                            type="text"
                                            required
                                            value={newTest.centers.join(", ")}
                                            onChange={(e) => setNewTest({ ...newTest, centers: e.target.value.split(",").map(v => v.trim()).filter(Boolean) })}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                                            placeholder="e.g. chandkheda, kalol"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-300">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={newTest.date}
                                            onChange={(e) => setNewTest({ ...newTest, date: e.target.value })}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300 [&::-webkit-calendar-picker-indicator]:invert"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-300">Mode</label>
                                        <select
                                            value={newTest.mode}
                                            onChange={(e) => setNewTest({ ...newTest, mode: e.target.value })}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                                        >
                                            <option className="bg-slate-900" value="offline">Offline</option>
                                            <option className="bg-slate-900" value="online">Online</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-300">Duration (mins)</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={newTest.duration}
                                            onChange={(e) => setNewTest({ ...newTest, duration: Number(e.target.value) })}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 mt-4">
                                        <input
                                            type="checkbox"
                                            id="hasFee"
                                            checked={newTest.hasFee}
                                            onChange={(e) => setNewTest({ ...newTest, hasFee: e.target.checked, fee: e.target.checked ? newTest.fee : 0 })}
                                            className="h-4 w-4 rounded border-white/10 bg-white/5 accent-cyan-500"
                                        />
                                        <label htmlFor="hasFee" className="text-sm font-semibold text-slate-300">Has Fee?</label>
                                    </div>
                                    {newTest.hasFee && (
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-slate-300">Fee Amount</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={newTest.fee}
                                                onChange={(e) => setNewTest({ ...newTest, fee: Number(e.target.value) })}
                                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 mt-4">
                                        <input
                                            type="checkbox"
                                            id="isRegistrationOpen"
                                            checked={newTest.isRegistrationOpen}
                                            onChange={(e) => setNewTest({ ...newTest, isRegistrationOpen: e.target.checked })}
                                            className="h-4 w-4 rounded border-white/10 bg-white/5 accent-cyan-500"
                                        />
                                        <label htmlFor="isRegistrationOpen" className="text-sm font-semibold text-slate-300">Registration Open?</label>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-300">Status</label>
                                        <select
                                            value={newTest.status}
                                            onChange={(e) => setNewTest({ ...newTest, status: e.target.value as any })}
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300"
                                        >
                                            <option className="bg-slate-900" value="upcoming">Upcoming</option>
                                            <option className="bg-slate-900" value="active">Active</option>
                                            <option className="bg-slate-900" value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end gap-3 border-t border-white/10 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-cyan-500 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                                    >
                                        Create Test
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
