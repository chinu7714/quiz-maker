"use client";

import { signIn } from "next-auth/react";
import { LockKeyhole, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="shell">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="glass-panel p-8 md:p-10">
          <span className="badge-pro mb-4">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Secure sign in
          </span>
          <h1 className="section-title">Welcome to Quizmify</h1>
          <p className="section-copy mt-3">
            Continue with Google to access your dashboard, quiz history, multiplayer rooms, and Pro upgrade flow.
          </p>
          <button className="primary-btn mt-8 w-full sm:w-auto" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
            Sign in with Google
          </button>
        </section>

        <aside className="dashboard-card bg-slate-950 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-semibold">Your learning platform, organized.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Access AI-generated quizzes, track performance, join competitive rooms, and manage your learning experience from a product-grade dashboard.
          </p>
        </aside>
      </div>
    </main>
  );
}
