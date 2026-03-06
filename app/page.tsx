import Link from "next/link";

const corePrograms = [
  {
    name: "CCC",
    tagline: "Digital literacy for real-world confidence.",
    details:
      "Master practical computer fundamentals, internet workflow, e-governance tools, and office productivity with an exam-focused structure.",
    points: ["NIELIT-aligned roadmap", "Smart revision cycles", "Hands-on daily labs"],
    gradient: "from-cyan-300/25 via-cyan-300/5 to-transparent",
    chip: "bg-cyan-300/20 text-cyan-200 border-cyan-200/30",
  },
  {
    name: "Programming",
    tagline: "Build logic, apps, and future-ready skills.",
    details:
      "Learn coding through structured projects, algorithmic thinking, and modern development practices that prepare you for industry paths.",
    points: ["Project-first learning", "Clean code habits", "Interview-ready concepts"],
    gradient: "from-indigo-300/25 via-indigo-300/5 to-transparent",
    chip: "bg-indigo-300/20 text-indigo-200 border-indigo-200/30",
  },
  {
    name: "Graphic Designing",
    tagline: "Design visuals that command attention.",
    details:
      "From branding to social creatives, learn composition, color systems, typography, and production-ready workflows with creative mentorship.",
    points: ["Portfolio-driven output", "Design thinking drills", "Tool mastery sessions"],
    gradient: "from-fuchsia-300/25 via-fuchsia-300/5 to-transparent",
    chip: "bg-fuchsia-300/20 text-fuchsia-200 border-fuchsia-200/30",
  },
] as const;

const successMetrics = [
  { label: "Focused Tracks", value: "3" },
  { label: "Lab-Based Practice", value: "100%" },
  { label: "Mentor Attention", value: "Small Batches" },
  { label: "Learning Approach", value: "Concept + Project" },
] as const;

const learningFlow = [
  {
    step: "01",
    title: "Concept Boot-Up",
    copy: "Build core understanding with guided explanations and rapid practice loops.",
  },
  {
    step: "02",
    title: "Skill Deep Dive",
    copy: "Work through real tasks, mini-projects, and challenge-based learning sessions.",
  },
  {
    step: "03",
    title: "Performance Lift",
    copy: "Refine speed, accuracy, and creativity through mentor feedback and mock drills.",
  },
] as const;

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-cyan-300/30">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_20%_18%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.14),transparent_36%),radial-gradient(circle_at_80%_80%,rgba(244,114,182,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl motion-safe:animate-[pulse_7s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-violet-300/15 blur-3xl motion-safe:animate-[pulse_9s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
      <div className="pointer-events-none absolute left-1/2 top-28 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full border border-white/10 [mask-image:radial-gradient(transparent_57%,black_60%)] motion-safe:animate-[spin_36s_linear_infinite]" />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-16 pt-8 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-300 text-sm font-black text-slate-900 shadow-[0_0_30px_rgba(34,211,238,0.45)]">
              JC
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">Jack Computer</p>
              <p className="text-sm font-semibold text-white/90 sm:text-base">Infotech Learning Hub</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#programs"
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 transition-all duration-500 hover:border-cyan-200/60 hover:bg-cyan-200/10 hover:text-cyan-100"
            >
              Explore Courses
            </a>
            <Link
              href="/user/login"
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 transition-all duration-500 hover:border-cyan-200/60 hover:bg-cyan-200/10 hover:text-cyan-100"
            >
              Log In
            </Link>
            <Link
              href="/user/register"
              className="rounded-full bg-cyan-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 transition-all duration-500 hover:bg-white"
            >
              Register
            </Link>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-7">
            <p className="inline-flex items-center rounded-full border border-cyan-200/35 bg-cyan-200/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
              Computer Skills Teaching Centre
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-7xl">
              Learn Tech Skills At{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-indigo-200 to-fuchsia-200 bg-clip-text text-transparent">
                Lightning Speed
              </span>
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-200/80 sm:text-lg">
              Jack Computer Infotech transforms beginners into confident digital creators through expertly structured
              teaching in <span className="font-semibold text-cyan-100">CCC</span>,{" "}
              <span className="font-semibold text-indigo-100">Programming</span>, and{" "}
              <span className="font-semibold text-fuchsia-100">Graphic Designing</span>.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/user/register"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-300 px-6 py-3 text-sm font-black uppercase tracking-[0.17em] text-slate-950 transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(125,211,252,0.6)]"
              >
                Start Learning
                <span className="transition-transform duration-500 group-hover:translate-x-1">{"->"}</span>
              </Link>
              <Link
                href="/user/login"
                className="rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.17em] text-white/90 transition-all duration-500 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10"
              >
                Log In
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {successMetrics.map((metric) => (
              <article
                key={metric.label}
                className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl transition-all duration-700 hover:-translate-y-1 hover:border-cyan-200/45 hover:bg-white/10"
              >
                <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-cyan-300/20 blur-2xl transition-all duration-700 group-hover:bg-violet-300/35" />
                <p className="relative text-2xl font-black text-white sm:text-3xl">{metric.value}</p>
                <p className="relative mt-1 text-xs uppercase tracking-[0.18em] text-slate-200/75 sm:text-sm">
                  {metric.label}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="programs" className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/80">Core Programs</p>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">The 3 Power Tracks</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-300/80 sm:text-base">
              Structured modules, practical output, and progressive skill-building designed for academic and career
              growth.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {corePrograms.map((program) => (
              <article
                key={program.name}
                className="group relative isolate overflow-hidden rounded-3xl border border-white/15 bg-slate-900/70 p-6 transition-all duration-700 hover:-translate-y-1 hover:border-white/35 hover:shadow-[0_18px_50px_rgba(8,47,73,0.35)]"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${program.gradient} opacity-0 transition-opacity duration-700 group-hover:opacity-100`}
                />
                <div className="relative space-y-4">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${program.chip}`}>
                    {program.name}
                  </span>
                  <h3 className="text-2xl font-black tracking-tight text-white">{program.tagline}</h3>
                  <p className="text-sm leading-6 text-slate-200/80">{program.details}</p>
                  <ul className="space-y-2">
                    {program.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-slate-100/90">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-200" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="flow" className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/80">How We Teach</p>
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Your Learning Flow</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-300/85 sm:text-base">
              Every learner follows a clear process that balances concept clarity, practical execution, and output
              quality.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {learningFlow.map((item) => (
              <article
                key={item.step}
                className="group rounded-2xl border border-white/15 bg-slate-950/70 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-200/45 hover:bg-slate-900"
              >
                <p className="text-sm font-black tracking-[0.24em] text-cyan-200/90">{item.step}</p>
                <h3 className="mt-2 text-xl font-extrabold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300/85">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="enroll"
          className="relative overflow-hidden rounded-3xl border border-cyan-200/35 bg-gradient-to-r from-cyan-300/20 via-indigo-300/15 to-fuchsia-300/20 px-6 py-8 sm:px-8"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full border border-white/25 motion-safe:animate-[spin_22s_linear_infinite]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/85">Admissions Open</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Upgrade Your Digital Future With Jack Computer Infotech
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-100/85 sm:text-base">
                Join an environment that mixes discipline, creativity, and practical mastery for long-term technology
                confidence.
              </p>
            </div>
            <Link
              href="/user/register"
              className="inline-flex items-center justify-center rounded-full border border-white/35 bg-white/15 px-7 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition-all duration-500 hover:scale-[1.03] hover:bg-white/25"
            >
              Enroll Now
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
