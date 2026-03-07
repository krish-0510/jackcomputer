"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
    AdminSession,
    Test,
    UserProfile,
    clearAdminSession,
    deleteTest,
    formatDobForDisplay,
    getAdminSession,
    getAllStudents,
    getRegistrations,
    getTests,
    updateTest,
} from "../../../user/auth-client";

export default function SingleTestAdminPage() {
    const router = useRouter();
    const params = useParams();
    const testId = typeof params?.testId === "string" ? params.testId : "";

    const [session, setSession] = useState<AdminSession | null>(null);
    const [test, setTest] = useState<Test | null>(null);
    const [registrations, setRegistrations] = useState<UserProfile[]>([]);
    const [isClient, setIsClient] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Test>>({});

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setIsClient(true);
        const sess = getAdminSession();
        if (!sess) {
            router.replace("/user/login");
            return;
        }
        setSession(sess);

        const allTests = getTests();
        const currentTest = allTests.find((t) => t.id === testId);

        if (currentTest) {
            setTest(currentTest);
            setEditFormData(currentTest);

            // Fetch registrations handling backwards compatibility if email missing
            const testRegs = getRegistrations().filter((r) => r.testId === testId);
            const allStudents = getAllStudents();

            const registeredStudents = testRegs
                .map((reg) => allStudents.find((s) => s.phone === reg.userPhone || s.email === reg.userEmail))
                .filter(Boolean) as UserProfile[];

            setRegistrations(registeredStudents);
        }
    }, [router, testId]);

    const handleLogout = () => {
        clearAdminSession();
        router.replace("/user/login");
    };

    const handleDeleteTest = () => {
        if (window.confirm(`Are you sure you want to delete this test?`)) {
            deleteTest(testId);
            router.replace("/admin/tests");
        }
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editFormData.name && editFormData.date && editFormData.centers?.length && editFormData.subjects?.length) {
            const updated = updateTest(testId, editFormData);
            setTest(updated);
            setIsEditing(false);
        }
    };

    const filteredRegistrations = registrations.filter(
        (student) =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.phone.includes(searchQuery)
    );

    if (!isClient || !session) {
        return (
            <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
                <p className="text-sm text-slate-300">Loading test data...</p>
            </main>
        );
    }

    if (!test && isClient) {
        return (
            <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-bold">Test Not Found</h1>
                    <Link href="/admin/tests" className="text-cyan-400 hover:underline">
                        ← Back to Tests
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
            {/* Background Effects */}
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_86%_10%,rgba(168,85,247,0.15),transparent_33%),radial-gradient(circle_at_14%_8%,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_50%_95%,rgba(96,165,250,0.1),transparent_40%)]" />
            <div className="pointer-events-none absolute left-1/2 top-40 h-120 w-120 -translate-x-1/2 rounded-full border border-white/5 motion-safe:animate-[spin_40s_linear_infinite]" />

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
                            className="rounded-full border border-purple-200/35 bg-purple-200/15 px-3 py-1.5 text-purple-100 transition hover:bg-purple-200/25"
                        >
                            Tests
                        </Link>
                    </nav>
                </header>

                {/* Test Highlights & Actions */}
                <section className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.55)] backdrop-blur-xl motion-safe:animate-[fade-in_700ms_ease-out]">
                    {isEditing ? (
                        <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h2 className="text-2xl font-black text-white">Edit Test Details</h2>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditFormData(test!);
                                        }}
                                        className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-cyan-500 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-300">Name</label>
                                    <input
                                        type="text"
                                        value={editFormData.name || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-300">Subjects (comma separated)</label>
                                        <input
                                            type="text"
                                            value={editFormData.subjects?.join(", ") || ""}
                                            onChange={(e) => setEditFormData({ ...editFormData, subjects: e.target.value.split(",").map(v => v.trim()).filter(Boolean) })}
                                            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-300">Centers (comma separated)</label>
                                        <input
                                            type="text"
                                            value={editFormData.centers?.join(", ") || ""}
                                            onChange={(e) => setEditFormData({ ...editFormData, centers: e.target.value.split(",").map(v => v.trim()).filter(Boolean) })}
                                            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-300">Date</label>
                                    <input
                                        type="date"
                                        value={editFormData.date || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                                        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white [&::-webkit-calendar-picker-indicator]:invert"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-300">Mode</label>
                                    <select
                                        value={editFormData.mode || "offline"}
                                        onChange={(e) => setEditFormData({ ...editFormData, mode: e.target.value })}
                                        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                                    >
                                        <option className="bg-slate-900" value="offline">Offline</option>
                                        <option className="bg-slate-900" value="online">Online</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-300">Duration (mins)</label>
                                    <input
                                        type="number"
                                        value={editFormData.duration || 0}
                                        onChange={(e) => setEditFormData({ ...editFormData, duration: Number(e.target.value) })}
                                        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 mt-4">
                                        <input
                                            type="checkbox"
                                            id="editHasFee"
                                            checked={!!editFormData.hasFee}
                                            onChange={(e) => setEditFormData({ ...editFormData, hasFee: e.target.checked, fee: e.target.checked ? editFormData.fee : 0 })}
                                            className="h-4 w-4 rounded border-white/10 bg-black/20 accent-cyan-500"
                                        />
                                        <label htmlFor="editHasFee" className="text-sm font-semibold text-slate-300">Has Fee?</label>
                                    </div>
                                    {editFormData.hasFee && (
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-slate-300">Fee Amount</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={editFormData.fee || 0}
                                                onChange={(e) => setEditFormData({ ...editFormData, fee: Number(e.target.value) })}
                                                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-300">Status</label>
                                    <select
                                        value={editFormData.status || "upcoming"}
                                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                                        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                                    >
                                        <option className="bg-slate-900" value="upcoming">Upcoming</option>
                                        <option className="bg-slate-900" value="active">Active</option>
                                        <option className="bg-slate-900" value="completed">Completed</option>
                                    </select>
                                </div>
                                <div className="col-span-1 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="editIsRegistrationOpen"
                                        checked={!!editFormData.isRegistrationOpen}
                                        onChange={(e) => setEditFormData({ ...editFormData, isRegistrationOpen: e.target.checked })}
                                        className="h-4 w-4 rounded border-white/10 bg-black/20 accent-cyan-500"
                                    />
                                    <label htmlFor="editIsRegistrationOpen" className="text-sm font-semibold text-slate-300">Registration Open?</label>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <Link href="/admin/tests" className="text-slate-400 hover:text-white transition">←</Link>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-200/85">
                                            {test!.subjects?.join(', ') || 'N/A'}
                                        </p>
                                    </div>
                                    <h1 className="mt-1 bg-linear-to-r from-cyan-100 via-white to-purple-100 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
                                        {test!.name}
                                    </h1>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-50 transition-all hover:bg-cyan-400/20"
                                    >
                                        Edit Test
                                    </button>
                                    <button
                                        onClick={handleDeleteTest}
                                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
                                    >
                                        Delete Test
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                <article className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date</p>
                                    <p className="mt-1 text-lg font-bold text-white">{test!.date}</p>
                                </article>
                                <article className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</p>
                                    <p className="mt-1 text-lg font-bold capitalize text-white">{test!.status}</p>
                                </article>
                                <article className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Duration</p>
                                    <p className="mt-1 text-lg font-bold text-white">{test!.duration} mins</p>
                                </article>
                                <article className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mode</p>
                                    <p className="mt-1 text-lg font-bold capitalize text-white">{test!.mode}</p>
                                </article>
                                <article className="rounded-2xl border border-white/5 bg-slate-900/40 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fee</p>
                                    <p className="mt-1 text-lg font-bold text-white">{test!.hasFee ? `₹${test!.fee}` : 'Free'}</p>
                                </article>
                            </div>
                        </>
                    )}
                </section>

                {/* Registrations List */}
                <section className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.55)] backdrop-blur-xl motion-safe:animate-[fade-in_800ms_ease-out]">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/85">View Roster</p>
                            <h2 className="text-2xl font-black text-white">Registered Students</h2>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full min-w-[200px] rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-400 outline-none backdrop-blur-md transition hover:border-white/20 focus:border-cyan-300 focus:bg-white/10"
                            />
                            <span className="shrink-0 rounded-full border border-cyan-200/35 bg-cyan-200/15 px-3 py-1.5 text-xs font-bold text-cyan-100">
                                {filteredRegistrations.length} Registers
                            </span>
                        </div>
                    </div>

                    {filteredRegistrations.length === 0 ? (
                        <div className="rounded-2xl border border-white/15 bg-slate-900/55 p-10 text-center text-sm text-slate-300">
                            No registered students found for this test.
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-white/15 bg-slate-900/45">
                            <table className="min-w-190 w-full text-left text-sm">
                                <thead className="bg-slate-800/65 text-xs uppercase tracking-[0.18em] text-purple-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Name</th>
                                        <th className="px-4 py-3 font-semibold">Email</th>
                                        <th className="px-4 py-3 font-semibold">Phone</th>
                                        <th className="px-4 py-3 font-semibold">Gender</th>
                                        <th className="px-4 py-3 font-semibold">DOB</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRegistrations.map((student, index) => (
                                        <tr
                                            key={student.phone}
                                            className="border-t border-white/10 transition duration-300 hover:bg-purple-200/10"
                                            style={{ transitionDelay: `${index * 35}ms` }}
                                        >
                                            <td className="px-4 py-3 font-semibold text-white">{student.name}</td>
                                            <td className="px-4 py-3 text-slate-200">{student.email}</td>
                                            <td className="px-4 py-3 text-slate-200">{student.phone}</td>
                                            <td className="px-4 py-3 text-slate-200 capitalize">{student.gender}</td>
                                            <td className="px-4 py-3 text-slate-200">{formatDobForDisplay(student.dob)}</td>
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
